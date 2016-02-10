"use strict";

var path = require("path");
var fs = require("fs");
var deepmerge = require("deepmerge");
var Number = require("node-sass").types.Number;
var math = require("mathjs");

var convertKnownKeysToSassNumbers = function(config) {
	Object.keys(config).forEach(function(categoryKey) {
		if (categoryKey === "options") {
			//console.log("Examining options...");
			Object.keys(config[categoryKey]).forEach(function(optionKey) {
				var optionValue = config[categoryKey][optionKey];
				//console.log("    Examining options[" + optionKey + "] = " + optionValue);
				if (typeof optionKey === "string" && typeof optionValue === "string" && (optionKey.match("pixel-grid-ratio") !== null || optionKey === "outer-margin")) {
					//console.log("*** converting " + optionKey + " option...");
					config[categoryKey][optionKey] = tryToParseSassNumber(tryToMathEvalString(optionValue));
				}
			});
		}
		// Convert any nested objects' "columns" and "gutters" properties
		else if (categoryKey === "classes") {
			var layoutTypes = config.options["layout-types"];
			var layoutTypeConfigKeys = ["columns", "gutters"];

			Object.keys(config[categoryKey]).forEach(function(classKey) {
				Object.keys(config[categoryKey][classKey]).forEach(function(classConfigKey) {
					// Is this a layout-type key?
					var classConfigValue = config[categoryKey][classKey][classConfigKey];
					if (layoutTypes.indexOf(classConfigKey) >= 0 && typeof classConfigValue === "object") {
						//console.log("Examining config[" + categoryKey + "][" + classKey + "][" + classConfigKey + "] = " + classConfigValue);

						layoutTypeConfigKeys.forEach(function(layoutTypeConfigKey) {
							//console.log("    Examining " + layoutTypeConfigKey);
							if (classConfigValue.hasOwnProperty(layoutTypeConfigKey)) {
								classConfigValue[layoutTypeConfigKey] = tryToParseSassNumber(tryToMathEvalString(classConfigValue[layoutTypeConfigKey]));
							}
						});

						// Write back
						config[categoryKey][classKey][classConfigKey] = classConfigValue;
					}
				});
			});
		}
	});
};

var tryToMathEvalString = function(item) {
	try {
		//console.log("Trying to math.eval() " + item);
		var evaluatedItem = math.eval(item);
		if (typeof evaluatedItem === "number") {
			return evaluatedItem;
		} else {
			return item;
		}
	}
	catch(e) {
		return item;
	}
};

var tryToParseSassNumber = function(item) {
	// Try to parseFloat
	var itemAsFloat = parseFloat(item);
	if (isNaN(itemAsFloat) === false) {
		// Does this number have units?
		if (typeof item === "string") {
			var unit = item.replace(itemAsFloat, "");
			item = new Number(itemAsFloat, unit);
		} else {
			item = new Number(itemAsFloat);
		}

	}

	return item;
};

var convertStringToListWithSassNumbers = function(str) {
	// Removing leading and trailing whitespace.
	str = str.trim();
	// Remove leading and trailing parentheses.
	if (str[0] === "(" && str[str.length - 1] === ")") {
		str = str.substr(1, str.length - 2);
	}
	str = str.split(/[ ,]+/g);

	var finalArray = [];

	str.forEach(function(item) {
		item = tryToParseSassNumber(item);
		finalArray.push(item);
	});

	return finalArray;
};

var rewriteFamiliesInConfig = function(config) {
	if (config.hasOwnProperty("families") === false) {
		return;
	}

	Object.keys(config.families).forEach(function (familyName) {
		var familyConfig = config.families[familyName];

		// Is familyConfig a string whose first and last characters aren't matching parentheses?
		if (typeof familyConfig === "string") {
			// Split on whitespace into an array and write the value back to the config object.
			config.families[familyName] = convertStringToListWithSassNumbers(familyConfig);
		}
	});

	//console.log("Finished rewriting families");
};

var rewriteMediaPropertiesInConfig = function(config) {
	if (config.hasOwnProperty("classes") === true) {
		Object.keys(config.classes).forEach(function(sizeClassName) {
			config.classes[sizeClassName] = rewriteMediaProperty(config.classes[sizeClassName]);
		});
	}

	if (config.hasOwnProperty("breakpoints") === true) {
		Object.keys(config.breakpoints).forEach(function(breakpointName) {
			config.breakpoints[breakpointName] = rewriteBreakpoint(config.breakpoints[breakpointName]);
		})
	}
};

var rewriteMediaProperty = function(obj) {
	if (obj.hasOwnProperty("media") && typeof obj.media === "string") {
		obj.media = convertStringToListWithSassNumbers(obj.media);
	}

	return obj;
};

var rewriteBreakpoint = function(breakpoint) {
	if (typeof breakpoint === "string") {
		breakpoint = {
			"media": breakpoint
		}
	}

	return rewriteMediaProperty(breakpoint);
};

module.exports = function(eyeglass, sass) {
	var defaultConfigName = "nytpi-default.json";
	var defaultConfigPath = path.join(__dirname, "sass", "size-class-v3", defaultConfigName);

	var sassUtils = require("node-sass-utils")(sass);

	return {
		sassDir: path.join(__dirname, "sass"),
		functions: {
			"_load-size-class-v3-config($pathToJsonFile: false, $replace: false)": function(pathToJsonFile, replace, done) {
				var usePathToJsonFileArgument = false;
				// Did we get a string?
				if (typeof pathToJsonFile.getValue() === "string") {
					// Is the value a (quoted) string?
					var pathValue = pathToJsonFile.getValue().replace(/['\"]?([^'\"]*)['\"]?/, "$1");

					if (pathValue !== "") {
						// build a relative path to the JSON file and see if it exists
						try {
							// TODO: Remove assumption that Sass files are in ./scss/ relative to process.cwd()
							pathToJsonFile = path.resolve(path.join(
								process.cwd(), "scss", pathValue
							));

							// Try to statSync (this will throw an error if the file doesn't exist)
							fs.statSync(pathToJsonFile);
						}
						// If that relative path doesn't work, try a path relative to this module
						catch(e) {
							pathToJsonFile = path.resolve(path.join(
								__dirname, "sass", "size-class-v3", pathValue
							));
							// The require() call below will fail if this doesn't exist, so don't worry about that here
						}

						usePathToJsonFileArgument = true;
					}
				}

				// One last check to see if we should use the default config path instead
				if (usePathToJsonFileArgument === false) {
					pathToJsonFile = defaultConfigPath;
				}

				// Load the JSON configuration file from disk
				var config = require(pathToJsonFile);
				// Merge this config with the default configuration (if replace.getValue() === false)
				if (replace.getValue() === false) {
					var defaultConfig = require(defaultConfigPath);
					config = deepmerge(defaultConfig, config);
				}

				// Postfix for converting string-encapsulated math expressions to Sass numbers
				convertKnownKeysToSassNumbers(config);

				// Postfix for families (convert JS strings to array of strings; convert anything that should be a Sass number)
				rewriteFamiliesInConfig(config);

				// Postfix for media queries (convert Sass numbers)
				rewriteMediaPropertiesInConfig(config);

				// Return to Sass as a map (using castToSass)
				done(sassUtils.castToSass(config));
			}
		}
	};
};