# a logging module
defaultLevel = 0
window.log =
	level: 0
	groups: {}
	log: (content, level = defaultLevel) ->
		# if level is a number and it is more than current level, print it
		if typeof level == 'number' and level >= @level then console.log content
		# otherwise, if there is a group
		else if @groups[level] then console.log content
	enable: (level) ->
		@groups[level] = true
	disable: (level) ->
		@groups[level] = false