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
		# return a $ of the title div
		header: () ->
			# TODO check that this is a section
			# return $ of title div
			this.children(".fade-menu-section-title")
		# returns true if currently selected
		selected: () ->
			this.hasClass("selected")
		# set whether the section is selectable
		selectable: (selectable, callback) ->
			# set selectable if selectable is (undefined | true | {selectable: true})
			if !selectable? or selectable == true or selectable?.selectable
				# check for callback
				onSelect = selectable?.onSelect | callback?.onSelect
				onDeselect = selectable?.onDeselect | callback?.onDeselect

				that = this
				# register click handler
				this.fadeMenu('header').on "click.fadeMenu", (event) ->
					# test if currently selected
					if that.fadeMenu('selected')
						# deselect
						that.removeClass('selected')
						# call callback
						onDeselect?()
					else
						# select
						that.addClass('selected')
						# call callback
						onSelect?()

	if methods[method]
		return methods[method].apply(this, Array.prototype.slice.call(arguments, 1))
	else if typeof method == 'object' || ! method
		return methods.init.apply(this, arguments)
	else
		jQuery.error('Method ' + method + ' does not exist on jQuery.fadeMenu')
	this