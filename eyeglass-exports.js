"use strict";

var path = require("path");
var fs = require("fs");
var deepmerge = require("deepmerge");

module.exports = function(eyeglass, sass) {
	var defaultConfigName = "size-class-v3-default-config.json";
	var defaultConfigPath = path.join(__dirname, defaultConfigName);

	var sassUtils = require("node-sass-utils")(sass);

	return {
		sassDir: path.join(__dirname, "sass"),
		functions: {
			"hello($name)": function(name, done) {
				done(sass.types.String('"Why hello, ' + name.getValue() + '"'));
			},
			"load-size-classes-config($pathToJsonFile: false, $merge: true)": function(pathToJsonFile, merge, done) {
				var useArgument = false;
				// Did we get a string?
				if (typeof pathToJsonFile.getValue() === "string") {
					// Is the value a (quoted) string?
					var pathValue = pathToJsonFile.getValue().replace(/['\"]?([^'\"]*)['\"]?/, "$1");

					if (pathValue !== "") {
						// build a relative path to the JSON file
						pathToJsonFile = path.resolve(path.join(
							process.cwd(), "scss", pathValue
						));

						useArgument = true;
					}
				}

				// One last check to see if we should use the default config path instead
				if (useArgument === false) {
					pathToJsonFile = defaultConfigPath;
				}

				// Load the JSON configuration file from disk
				var config = require(pathToJsonFile);
				// Merge it with the default configuration (if merge.getValue() === true)
				if (merge.getValue() === true) {
					var defaultConfig = require(defaultConfigPath);
					config = deepmerge(defaultConfig, config);
				}

				// Postfix for families (add parentheses around strings)
				if (config.hasOwnProperty("families")) {
					Object.keys(config.families).forEach(function(familyName) {
						var familyConfig = config.families[familyName];

						// Is familyConfig a string whose first and last characters aren't matching parentheses?
						if (typeof familyConfig === "string") {
							// Removing leading and trailing whitespace.
							familyConfig = familyConfig.trim();
							// Remove leading and trailing parentheses.
							if (familyConfig[0] === "(" && familyConfig[familyConfig.length - 1] === ")") {
								familyConfig = familyConfig.substr(1, familyConfig.length - 2);
							}
							// Split on whitespace into an array.
							familyConfig = familyConfig.split(/[ ,]+/g);
							// Write the value back to the config object.
							config.families[familyName] = familyConfig;
						}
					});
				}

				// Return to Sass as a map (using castToSass)
				done(sassUtils.castToSass(config));
			}
		}
	};
};