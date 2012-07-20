jQuery.fn.undoView = (method) ->
	methods = {
		init: (options) ->
			# initialize fade menu
			this.fadeMenu(options)

			# create data structure
			this.data('undoView', {history: PathHistory({path: options?.path})})

			# add top level
			this.fadeMenu 'addCollapsableMenuSection', {headerText: "Undo History"}
		push: () ->
			# push path onto history and return new path
			this.data('undoView').history.push()
			# create a new element for the new entry
			this.fadeMenu 'addElement', {contents: "another path"}
		# TODO click handler on elements to undo

	}

	if methods[method]
		return methods[method].apply(this, Array.prototype.slice.call(arguments, 1))
	else if typeof method == 'object' || ! method
		return methods.init.apply(this, arguments)
	else
		jQuery.error('Method ' + method + ' does not exist on jQuery.fadeMenu')
	this