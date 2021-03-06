var obj = {field1: "val1", field2: 2};
var console, phantom;
Object.create = function(o) {
	var F = function() {};
	F.prototype = o;
	return new F();
};

var missing = {one: 'one'};
if([missing.two]) {
	console.log('falsy');
} else {
	console.log('truthy');
}
console.log([missing.two] || 'should be this');
var missingResult = [missing.two] || 'should be this';
console.log(missingResult);

var objWithBlank = {};
objWithBlank[''] = 4;
console.log(objWithBlank['']);
//console.log(objWithBlank.);

phantom.injectJs('timer.js');

timer.useSeconds(true);
timer.lap("fast");
var sum = 0;
for(var i = 0; i < 1000000; i++) {
	sum += Math.sqrt(Math.random());
}
console.log(timer.lap("fast"), "timer");
timer.lap("slow");
for(var i = 0; i < 10000000; i++) {
	sum += Math.sqrt(Math.random());
}
console.log(timer.lap("slow"), "timer");

var o1 = {'a': true, 'b': false, 'c': true };
var o2 = {'a': false, 'c': true };
if(o1['a'] === o2['a']) {
	console.log('a matches');
} else {
	console.log('a no match');
}
if(false === o2['b']) {
	console.log('b matches');
} else {
	console.log('b no match');
}
if(o1['c'] === o2['c']) {
	console.log('c matches');
}

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

var dom = {};
// bad
var addHandlers = function(nodes) {
	var i;
	for(i = 0; i < nodes.length; i++) {
		nodes[i].onclick = function (e) {
			console.log(i);
		}
	}
}

phantom.exit();
