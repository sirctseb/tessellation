// a thin implementation of the tessellation model
// that marshalls calls to Tessellation.dart

var thinTessellation = function(spec, my) {
	var that = {};

	var addPolygon = function(polygon) {
		// call method on dart
		JSToDartCommunicator.sendMessage({"method": "addPolygon", "polygon": polygon});
	}
	that.addPolygon = addPolygon;

	var addSubgroup = function(group) {
		// call method on dart
		JSToDartCommunicator.sendMessage({"method": "addSubgroup", "group": group});
	}
	that.addSubgroup = addSubgroup;

	var addTransform = function(transform) {
		// call method on dart
		JSToDartCommunicator.sendMessage({"method": "addTransform", "transform": transform});
	}
	that.addTransform = addTransform;

	// this produces the above methods. if there are more, it may be better to do it this way
	/*var methods = [{"method": "addPolygon", "argname": "polygon"},
					{"method": "addSubgroup", "argname": "group"},
					{"method": "addTransform", "argname": "transform"}];

	for (var i = methods.length - 1; i >= 0; i--) {
		// TODO i'm pretty sure we have to close over the loops variable
		this.methods[[i]] = function(arg) {
			JSToDartCommunicator.sendMessage({"method": methods[i].method, "arg": methods[i].argname]});
		}
	};*/

	// accessors
	// this is done in the loop below
	/*that.polygons = function() {
		// request object from dart
		JSToDartCommunicator.sendMessage({"get": "polygons"}j);
		var retVal;

		// TODO is this synchronous?
		// get object from dart
		JSToDartCommunicator.receiveMessage(function(m) {
			retVal = m.polygons;
		});

		// return value
		return retVal
	}*/

	// define getters for the various properties
	// TODO types conversions
	// TODO should be returning a thin lattice
	// TODO subgroups should be returning list of thin tessellations
	var getMethods = ["polygons", "subgroups", "transforms", "lattice"];
	for (var i = getMethods.length - 1; i >= 0; i--) {
		// TODO i'm pretty sure this is where we have to close over the loop variable
		(function() {
			that.getMethods[i] = function() {
				// request object from dart
				JSToDartCommunicator.sendMessage({"get": getMethods[i]});
				// TODO is this synchronous?
				// get object from dart
				var retVal;
				JSToDartCommunicator.receiveMessage(function(m) {
					retVal = m[getMethods[i]];
				});
				// return value
				return retVal;
			}
		})();
	};

	return that;
};

var thinClass = function(methods) {
	var that = {};

	for (var i = methods.length - 1; i >= 0; i--) {
		that[methods[i]] = function(args) {
			// send original method call
			JSToDartCommunicator.sendMessage({"method": methods[i], "args": args === undefined? null : args});
			// get response
			var retVal;
			// TODO is this synchronous?
			// TODO what if there is no return?
			JSToDartCommunicator.receiveMessage(function(m) {
				retVal = m.result;
			});

			// return value
			return retVal;
		};
	};
}

var thinLattice = function(spec, my) {
	var that = thinClass(["reduceBasis", "isReduced", "getPoint", "decompose", ""]);

	return that;
};

var RemoteClass = function(obj) {
	var that = {};

	that.obj = obj;

	return that;
}

var ClassProxy = function(methods) {
	var that = {};

	// iterate over methods
	for (var i = methods.length - 1; i >= 0; i--) {
		that[methods[i]] = function(args) {
			// send original method call
			JSToDartCommunicator.sendMessage({"method": methods[i], "args": args === undefined? null : args});
			// register for response
			var retVal;
			// TODO is this synchronous?
			// TODO what if there is no return?
			JSToDartCommunicator.receiveMessage(function(m) {
				retVal = m.result;
			});

			// return value
			return retVal;
		};
	};

	return that;
}