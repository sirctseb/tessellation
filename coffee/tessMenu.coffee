jQuery.fn.tessMenu = (method) ->
	methods =
		init: (options) ->
			# TODO store controller in data?
			@data 'tessMenu',
				controller: options.controller,
				tessellation: options.tessellation
			tessellation = options.tessellation

			# init fade menu
			if !options.suppressTopLevel
				@fadeMenu options

			# add stamp section
			stampSection = @fadeMenu "addCollapsableMenuSection", {headerText: "Stamp"}

			# add lattice view
			# TODO this was htmlLatticeView before
			latticeSection = stampSection.fadeMenu "addCollapsableMenuSection", {headerText: "Lattice"}

			# add polygon section
			polygonSection = stampSection.fadeMenu "addCollapsableMenuSection",
				{headerText: "Shapes(" + tessellation.polygons().length + ")"}

			# add substructure 
			substampSection = stampSection.fadeMenu "addCollapsableMenuSection",
				{headerText: "Substamps (" + tessellation.subgroups().length + ")"}

			# add transform section
			transformSection = stampSection.fadeMenu "addCollapsableMenuSection",
				{headerText: "Placements (" + tessellation.transforms().length + ")"}

			# make stamp section selectable
			stampSection.fadeMenu('selectable')

			# make polygon section selectable
			polygonSection.fadeMenu('selectable')

			# add polygon info
			# TODO test this
			for polygon in tessellation.polygons()
				# TODO these were htmlShapeViews before
				polygonSection.fadeMenu 'addCollapsableMenuSection',
					{headerText: polygon.toString()}

			# TODO add polygon entry

			# add substructure info
			# TODO test this
			for subgroup in tessellation.subgroups()
				substampSection.tessMenu
					controller: options.controller,
					tessellation: subgroup,
					suppressTopLevel: true

			# add transformation info
			for transform in tessellation.transforms()
				transformSection.fadeMenu 'addElement',
					{contents: transform.toString()}


	if methods[method]
		return methods[method].apply(this, Array.prototype.slice.call(arguments, 1))
	else if typeof method == 'object' || ! method
		return methods.init.apply(this, arguments)
	else
		jQuery.error('Method ' + method + ' does not exist on jQuery.fadeMenu')
	this