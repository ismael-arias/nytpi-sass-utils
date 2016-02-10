var nodeSass = require("node-sass");
var nodeSassUtils = require("node-sass-utils");

var List = nodeSass.types.List;
var Number = nodeSass.types.Number;
var String = nodeSass.types.String;

var desiredList = "this is my funny list 32px";

var newList = [];

desiredList.split(/[ ,]+/).forEach(function(item) {
	// Try to parseFloat
	var itemAsFloat = parseFloat(item);
	if (isNaN(itemAsFloat) === false) {
		var unit = item.replace(itemAsFloat, "");
		item = new Number(itemAsFloat, unit);
	}

	newList.push(item);
});

console.log(newList);

process.exit(0);