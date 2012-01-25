/* paperjsPlugins.js contains additions to the paperjs types that are useful to us */

// check if a point is in the interior of an assumed convex polygon
// TODO put this somewhere better
paper.Path.inject({
	/*isInterior: function(point) {
		if(!this.closed) {
			return false;
		}
	
		var interior = true;
		var that = this;
		$.each(this.curves, function(index, curve) {
			var p1 = that.clockwise ? curve.point1 : curve.point2;
			var p2 = that.clockwise ? curve.point2 : curve.point1;
			// TODO do this with paper.Line
			var vec = p2.subtract(p1);
			var orthogonal = new paper.Point(vec.y, -vec.x);
			if(orthogonal.dot(p1.negate().add(point)) > 0) {
				interior = false;
				return false;
			}
		});
		
		return interior;
	}*/

	// version which should work with general paths
	isInterior: function(point) {
		// TODO check for closed?
		/*if(!this.closed) {
			return false;
		}*/

		// find the closest point on any curve of the path to the given point
		var nearestCurveLocation = this.getNearestLocation(point);

		// check if the given point is inward of the nearest location
		return nearestCurveLocation.normal.dot(point.subtract(nearestCurveLocation.point)) * ( this.clockwise ? -1 : 1 ) > 0;
	}
});

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