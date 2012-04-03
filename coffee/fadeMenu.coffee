jQuery.fn.fadeMenu = (method) ->
	methods =
		# initialize a fade menu
		init: (options) ->
			# initialize data
			@data('fadeMenu', options)
			# make sure wrapper has class
			@addClass('fade-menu')

		# create a section and add it to the menu
		addMenuSection: (options) ->
			# TODO test that this is a menu or section
			# create the element
			element = $("<" + (options.type || "div") + " />",
						{class: (options.classes || "") + " fade-menu-section"})
			# add header
			element.append($("<div/>", {"class": "fade-menu-section-title", text: options.headerText}))
			# add to menu
			this.append(element)
			# return the element
			element

		# create a collapsable section and add it to the menu
		addCollapsableMenuSection: (options) ->
			# TODO test that this is a menu or section
			# create the element
			element = $("<" + (options.type || "div") + " />",
						{class: (options.classes || "") + " fade-menu-collapsable-section"})
			# add collapse arrow
			element.append($("<div/>", {"class": "fade-menu-collapse-arrow"}));
			# add header
			element.append($("<div/>", {"class": "fade-menu-section-title", text: options.headerText}))
			# add to menu
			this.append(element)
			# return the element
			element

		# create a fade menu element and add it to the menu
		addElement: (options) ->
			# TODO test that this is a menu or section
			# create the element
			element = $("<" + (options.type || "div") + " />",
						{class: (options.classes || "") + " fade-menu-element"})
			# add to menu
			this.append(element)
			# return the element
			element

		# return an element at a given index
		getElement: (index) ->
			this.children(":not(.fade-menu-section-title, .fade-menu-collapse-arrow)").eq(index)

		# section methods
		header: () ->
			# TODO check that this is a section
			# return $ of title div
			this.children(".fade-menu-section-title")


	if methods[method]
		return methods[method].apply(this, Array.prototype.slice.call(arguments, 1))
	else if typeof method == 'object' || ! method
		return methods.init.apply(this, arguments)
	else
		jQuery.error('Method ' + method + ' does not exist on jQuery.fadeMenu')
	this