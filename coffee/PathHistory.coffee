class PathHistory

	# fields

	# the actual list of paths in the undo history
	pathList: []
	# where we are in the history
	index:0
	# callbacks to invoke when the undo state changes
	# when the state of the undo history changes, this will be called thus:
	# TODO allow client to provide data as param, or the this object?
	# @callback.callback(@pathList[@index])
	# TODO formalize when callback should be called
	callback: {}

	# initialize the PathHistory
	constructor: (options) ->
		# put initial path in history if it exists
		if options.path? then @pathList.append path
		# register callback for when path changes
		if options.callback? 
			@callback = options.callback

	# methods

	# register a callback
	onChange: (callback) ->
		@callback = callback

	# call the callback
	callCallback: ()->
		@callback.call(null, @pathList(@index))

	# move back one in the undo history
	undo: () ->
		# move index down one if we're not at the butt already
		if @index > 0 then @index--
		# call callback
		@callCallback()
		# TODO update references to the path?
		# return the new index
		@index

	# move forward one in the undo history
	redo: () ->
		# move index up one if we're not at the head already
		if @index < @pathList.length - 1 then @index++
		# call callback
		@callCallback()
		# TODO update references to the path?
		# return new index
		@index

	# set to a specific location in the history
	undoTo: (index) ->
		if 0 <= index && index < @pathList.length then @index = index
		# call callback
		@callCallback()
		# TODO update references to the path?

	# set to most recent path
	redoAll: () ->
		@undoTo(@pathList.length - 1)
		# callback is called in undoTo

	# set to oldest path
	undoAll: () ->
		@undoTo(0)
		# callback is called in undoTo

	# chop the future history to length
	# length is the length up to the current index by default
	truncate: (length = @index + 1) ->
		if 0 < length && length < pathList.length
			@pathList = @pathList.slice(0,length)
		if @index > @pathList.length - 1
			@redoAll()
		# callback is called in redoAll(undoTo())

	# add a new path state to the history after index
	# if index < pathList.length - 1, then history is chopped off before adding new path
	# set the current state to the newly added one according to setToNewState
	addPath: (path, index = @index, setToNewState = true) ->
		# validate index value
		if index < 0 || pathList.length - 1 < index
			# return what?
			return null
		# truncate and add new path
		@pathList.splice(index + 1, @pathList.length, path)

		# set new index if indicated or if necessary
		if setToNewState || index > @pathList.length - 1
			@redoAll()
		else
			# call callback
			@callCallback()
