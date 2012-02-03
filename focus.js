/* a module to allow elements to know when they have lost focus, */
/* that is, when a click occurs outside their bounds */

var focus = (function() {
	var focus = {};

	// the set of elements that want to be notified
	var registrants = $();
	var callbacks = {};

	focus.register = function(registrant, callback) {
		// store the callback
		$(registrant).data("clickaway", {callback: callback});

		// add registrant to the registry
		registrants = registrants.add(registrant);
	}

	// wait until dom is ready
	$(function() {
		// add click handler to body
		$("body").click(function(event) {
			// search registry
			registrants.each(function() {
				// if the event target is not a descendant of the registrant
				if(!$(this).has(event.target).length) {
					// notify the registrant of the click away
					$(this).data("clickaway").callback();
				}
			});
		});
	});

	return focus;

}());