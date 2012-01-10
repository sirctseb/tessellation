var log = (function() {
	var log = {
		// log level
		level: 0,
		defaultLevel: 0,
		groups: {},
		log: function(content, level) {
			// set default level if none supplied
			if(arguments.length === 1) {
				level = this.defaultLevel;
			}
			// if level is a number,
			if(typeof level === 'number') {
				// print contents if current level is lower
				if(level >= this.level) {
					console.log(content);
				}
			} else {
				// if level is not a number, print contents
				// if debug group is enabled
				if(groups[level]) {
					console.log(content);
				}
			}
		}, 
		enable: function(level) {
			groups[level] = true;
		}
		disable: function(level) {
			groups[level] = false;
		}
	};
}());