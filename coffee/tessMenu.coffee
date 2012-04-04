jQuery.fn.tessMenu = (method) ->
	methods =
		init: (options) ->
			# TODO store controller in data?
			@data 'tessMenu', {controller: options.controller}

			# init fade menu
			@fadeMenu options

			# add stamp section
			stampSection = @fadeMenu "addCollapsableMenuSection", {headerText: "Stamp"}

			# add lattice view
			# TODO this was htmlLatticeView before
			latticeSection = stampSection.fadeMenu "addCollapsableMenuSection", {headerText: "Lattice"}

			# add polygon section
			polygonSection = stampSection.fadeMenu "addCollapsableMenuSection",
				{headerText: "Shapes(" + options.controller.tessellation.polygons().length + ")"}

			# add substructure 
			substampSection = stampSection.fadeMenu "addCollapsableMenuSection",
				{headerText: "Substamps (" + options.controller.tessellation.polygons().length + ")"}

			# add transform section
			transformSection = stampSection.fadeMenu "addCollapsableMenuSection",
				{headerText: "Placements (" + options.controller.tessellation.transforms().length + ")"}

			# add click handler to stamp header
			stampSection.fadeMenu('selectable')

			# add polygon info
			# TODO

	if methods[method]
		return methods[method].apply(this, Array.prototype.slice.call(arguments, 1))
	else if typeof method == 'object' || ! method
		return methods.init.apply(this, arguments)
	else
		jQuery.error('Method ' + method + ' does not exist on jQuery.fadeMenu')
	this