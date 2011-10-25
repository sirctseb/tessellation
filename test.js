var obj = {field1: "val1", field2: 2};
var console, phantom;
Object.create = function(o) {
	var F = function() {};
	F.prototype = o;
	return new F();
};

var newobj = Object.create(obj);
console.log(newobj.field1);
newobj.field1 = "val2";
console.log(obj.field1);
console.log(newobj.field1);


var blah = {a: "a", b: "b"};
var blah2 = Object.create(blah);
blah.a = "c";
console.log("blah2.a: " + blah2.a);
console.log("blah2.hasOwnProperty('a'): " + blah2.hasOwnProperty('a'));
blah2.a = "d";
console.log("blah2.a: " + blah2.a);
console.log("blah2.hasOwnProperty('a'): " + blah2.hasOwnProperty('a'));

var f = function() {
	return 4;
};

var sircobj = {
	field: f()
};

console.log(sircobj.field);

var setObj = {
	setName: function(name) {
		console.log('setName');
	}
};
setObj.name = "blah";

phantom.exit();
