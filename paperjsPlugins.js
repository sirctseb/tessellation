/* paperjsPlugins.js contains additions to the paperjs types that are useful to us */

// make a symbol of an ditem without changing the position of the original item
paper.Item.inject({
	symbolize: function() {
		// store position before making symbol
		var origPosition = this.position;
		// make symbol
		var symbol = new paper.Symbol(this);
		// restore position
		this.position = origPosition;
		// return symbol
		return symbol;
	}
});

paper.Point.inject({
	prettyPrint: function() {
		return "x: " + this.x.toFixed(2) + " y: " + this.y.toFixed(2);
	}
});