/* A simple timer class to test runtimes */
var timer = (function() {
	// object to hold the results of timers
	var timers = {};

	// methods
	return {
		// put a first time in the timer
		startTimer: function(name) {
			this.lap(name);
		},
		// add the current time to the timer history and return the lap time
		lap: function(name) {
			// default name is '' so we don't interfere with actual names
			if(name === undefined) {
				name = '';
			}

			// if there is no timer with that name, create one
			if(!timers[name]) {
				timers[name] = [];
			}

			// add the current time to the timer
			timers[name].push(Date.now());

			// return the difference between now and the previous time
			// make sure there is a previous time, if not, return now
			return this.getLapTime(name);
		},
		// return the time at wich lap occured
		getTime: function(name, lap) {
			// check that the timer exists
			if(!timers[name]) {
				return undefined;
			}

			// if no lap supplied, return time of the most recent lap
			if(lap === undefined) {
				lap = -1;
			}

			// compute positive index from negative index
			if(lap < 0) {
				lap = timers[name].length + lap;

				// if lap was too negative, return undefined
				if(lap < 0) {
					return undefined;
				}
			}

			// return the time
			return timers[name][lap];
		},
		// return the time a given lap took
		getLapTime: function(name, lap) {
			// check that the timer exists
			if(!timers[name]) {
				return undefined;
			}

			// if no lap supplied, return lap time of the most recent lap
			if(lap === undefined) {
				lap = -1;
			}

			// get the time of lap and previous lap
			var lapTime = this.getTime(name, lap);
			var prevLapTime = this.getTime(name, lap - 1);

			// if there was a problem getting either time, return
			if(lapTime === undefined || prevLapTime === undefined) {
				return undefined;
			}

			// return the difference in times
			return lapTime - prevLapTime;
		}
	}
}());