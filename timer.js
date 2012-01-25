/* A simple timer class to test runtimes */
var timer = (function() {
	// object to hold the results of timers
	var timers = {};

	// methods
	return {
		startTimer: function(name) {
			// default name is '' so we don't interfere with actual names
			if(name === undefined) {
				name = '';
			}

			// if there is no timer with that name, create one
			if(!timers[name]) {
				timers[name] = [];
			}

			// add the current time to the timer
			timers[name].push(new Date());
		}
	}
}());