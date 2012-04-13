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
			latticeSection.tessMenu "latticeView"

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
		# update lattice display
		onLatticeChange: () ->
			# TOOD pass event to lattice display
		# add a path to the menu
		addPath: (polygon, path) ->
			# TODO
			# search for the view with the path
		# get the root $ of the menu
		root: () ->
			this.closest(".fade-menu")
		# create a lattice view
		latticeView: (options) ->
			that = this
			# add elements for vector displays
			vdisplays = {
				v1: this.fadeMenu('addElement', {classes: "v1display vdisplay"}),
				v2: this.fadeMenu('addElement', {classes: "v2display vdisplay"})
			}
			tessellation = @tessMenu('root').data('tessMenu').tessellation
			focus.register(that, () -> that.tessMenu 'cancelEditVector')
			# create default and edit views for each
			for component in ["v1", "v2"]
				do (component) ->
					# create default view
					view = $("<div/>",
						{
							"class": "latticeVec " + component+"default",
							text: tessellation.lattice()[component]().prettyPrint()
						}
					)
					# append to display
					view.appendTo(vdisplays[component])
					# add click handler
					view.on("click.tessMenu", () ->
						# notify controller
						$(this).tessMenu("root").data("tessMenu").controller.beginEditLattice(component)
					)
					# add edit button
					view.before(
						$("<div />",
							{
								"class": "editButton " + component+"default",
								text:"edit"
							}
						).click((event) ->
							# TODO edit component
							#editVector(component)
							that.tessMenu 'startEditVector', component
						)
					)

					# create edit view
					editClass = component+"edit"
					# add submit button
					vdisplays[component].append(
						$("<div/>", {
							class: "vecEditSubmit " + editClass,
							text:"submit"
							}).click((event)->
								# TODO
								#finishEditVector(component);
								that.tessMenu 'finishEditVector', component
							)
					)
					# create first label
					vdisplays[component].append(
						$("<label/>", {
							class: "vecEditLabel " + editClass,
							text: "x: ",
							"for": component+"xEdit"
							})
					)
					# create first text box
					vdisplays[component].append(
						$("<input/>", {
							class: "vecEditField " + editClass,
							type: "text",
							value: tessellation.lattice()[component]().x.toFixed(2),
							id: component+"xEdit"
							})
					)
					# create second label
					vdisplays[component].append(
						$("<label/>", {
							class: "vecEditLabel " + editClass,
							text: "y: ",
							"for": component+"yEdit"
							})
					)
					# create second text box
					vdisplays[component].append(
						$("<input/>", {
							class: "vecEditField " + editClass,
							type: "text",
							value: tessellation.lattice()[component]().y.toFixed(2),
							id: component + "yEdit"
							})
					)
		# start editing a lattice component
		startEditVector: (component) ->
			$("."+component+'display', this).addClass('edit')
		finishEditVector: (component) ->
			value = {}
			value[component] = new paper.Point(
				parseFloat($("#" + component + "xEdit", this).val()),
				parseFloat($("#" + component + "yEdit", this).val())
			)
			# send value to controller
			@tessMenu('root').data('tessMenu').controller.setLatticeValues(value)

			# put default displays back
			@tessMenu 'cancelEditVector'
		cancelEditVector: () ->
			for component in ['v1', 'v2']
				$("."+component+"display", this).removeClass('edit')



	if methods[method]
		return methods[method].apply(this, Array.prototype.slice.call(arguments, 1))
	else if typeof method == 'object' || ! method
		return methods.init.apply(this, arguments)
	else
		jQuery.error('Method ' + method + ' does not exist on jQuery.fadeMenu')
	this