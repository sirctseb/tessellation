obj = {field1: "val1", field2: 2};

Object.create = function(o) {
	var F = function() {};
	F.prototype = o;
	return new F();
};

newobj = Object.create(obj);
console.log(newobj.field1);
newobj.field1 = "val2";
console.log(obj.field1);
console.log(newobj.field1);

var f = function() {
	return 4;
}

var sircobj = {
	field: f()
};

console.log(sircobj.field);

phantom.exit();
