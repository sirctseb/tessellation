class PathHistory

	# fields

	# the actual list of paths in the undo history
	pathList: []
	# where we are in the history
	index:0

	# initialize the PathHistory
	constructor: (path) ->
		@pathList.append path

	# methods

	# move back one in the undo history
	undo: () ->
		# move index down one if we're not at the butt already
		if @index > 0 then @index--
		# TODO update references to the path?
		# return the new index
		@index

	# move forward one in the undo history
	redo: () ->
		# move index up one if we're not at the head already
		if @index < @pathList.length - 1 then @index++
		# TODO update references to the path?
		# return new index
		@index

	# set to a specific location in the history
	undoTo: (index) ->
		if 0 <= index && index < @pathList.length then @index = index
		# TODO update references to the path?

	# set to most recent path
	redoAll: () ->
		@undoTo(@pathList.length - 1)

	# set to oldest path
	undoAll: () ->
		@undoTo(0)

	# chop the future history to length
	# length is the length up to the current index by default
	truncate: (length = @index + 1) ->
		if 0 < length && length < pathList.length
			@pathList = @pathList.slice(0,length)
		if @index > @pathList.length - 1
			@redoAll()

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
