window.latticeEditView = (spec, my) ->
	that = {}
	my = $.extend({
			controller: spec.controller,
			tessellation: spec.tessellation,
			latticeEditLayer: spec.latticeEditLayer,
			selectedColor: 'blue'
		}, my)

	# private variables
	display = null

	# private method to produce the mouse handlers for the visible objects
	makeHandlers = (tess, vecName) ->
		{
			mousedown: (event) ->
				display.fillColor = 'white'

				# set color to selected color
				@fillColor = my.selectedColor

				# notify of mouse down
				my.controller.onLatticeEditViewMouseDown()

			mousedrag: (event) ->
				log.log('dragging ' + vecName, 'latticeDisplay')

				# update display
				# set the position of the handle
				@position = @position.add(event.delta)

				# set the end point of the line
				@parent.children['line'].lastSegment.point = this.position

				# notify controller
				my.controller.onLatticeEditViewMouseDrag({point: this.position, component: vecName})

			mouseup: (event) ->
				# reset fill color
				@fillColor = 'white'

				# notify of mouse up
				my.controller.onLatticeEditViewMouseUp()
		}

	# constructor
	constructor = (component) ->
		# save old latticeEditLayer
		oldLayer = paper.project.activeLayer

		# activate lattice edit layer
		# TODO ensure the layer exists?
		paper.project.layers[my.latticeEditLayer].activate()

		lattice = my.tessellation.lattice()
		display = new paper.Group()
		for vecName, index in ['v1', 'v2']
			# create display elements
			# draw line
			line = new paper.Path(new paper.Point(), lattice[vecName]())
			line.name = 'line';
			# draw handle
			handle = new paper.Path.Circle(lattice[vecName](), 3)
			handle.name = 'handle'
			handle.fillColor = 'white'
			# group to hold display elements
			group = new paper.Group([line, handle])
			group.strokeColor = 'blue'
			group.name = 'group' + vecName

			# add group to display group
			display.addChild(group)

			# add handlers to elements
			handle.attach(makeHandlers(my.tessellation, vecName))
		show component

		# reactivate original layer
		oldLayer.activate()

	hide = ->
		# remove display group
		display.remove()

	show = (component) ->
		# TODO make sure visible objects are up to date?
		# add display group back to lattice edit layer
		paper.project.layers[my.latticeEditLayer].addChild(display)

		# if a component was passed in, show the handle as selected
		if component?
			display.fillColor = 'white'
			display.children['group' + component].children['handle'].fillColor = my.selectedColor

	# public methods
	that.hide = hide
	that.show = show

	# call constructor
	constructor spec.component

	# return created object
	that