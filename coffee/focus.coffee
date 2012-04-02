# a module to allow elements to know when they have lost focus,
# that is, when a click occurs outside their bounds

# TODO this should really be a jQuery plugin

# the set of elements that want ot be notified
registrants = $()

# wait until dom is ready
$ ->
	# add click handler to body
	$("body").click((event) ->
		# search registry
		registrants.each(->
			# if the event target is not a descendant of the registrant
			if not $(this).has(event.target).length
				# notify the registrant of the click away
				$(this).data("clickaway").callback();
		)
	)

window.focus = 
	register: (registrant, callback) ->
		# store the callback
		$(registrant).data "clickaway", callback: callback

		# add registrant to the registry
		registrants = registrants.add registrant