"use strict";

var path = require("path");

module.exports = function(eyeglass, sass) {
	var loadSizeClassConfig = require("./sass/size-class/loadSizeClassConfig")(sass);

	return {
		sassDir: path.join(__dirname, "sass"),
		functions: {
			"_load-size-class-config($pathToJsonFile: false, $replace: false)": loadSizeClassConfig
		}
	};
};