// from JavaScript: The Good Parts
// create a new object from an existing one
if(typeof Object.create !== 'function') {
	Object.create = function(o) {
		var F = function() {};
		F.prototype = o;
		return new F();
	};
}
// add a method
Function.prototype.method = function (name, func) {
	if(!this.prototype[name]) {
		this.prototype[name] = func;
		return this;
	}
};
