var paper, console, $; // for jslint

app = (function() {
	
var editTool = (function() {
	
	// create tool instance
	var selectedEditTool = new paper.Tool();
	
	// mouse down handler
	function mouseDown(event) {
		//console.log("selectedEditTool.mousedown");
		
		// define options for hit test
		var hitTestOptions = {
			//type: paper.PathItem, // TODO as a string or what? // I don't think this is used
			segments: true, // look for segment points
			handles: true, // look for segment handles
			selected: true, // look for selected paths
			fill: true,
			tolerance:100 // this appears to be in pixels^2 or something // TODO magic number
		};
		
		// perform hit test
		var hitResult = paper.project.activeLayer.hitTest(event.point, hitTestOptions);

		// we don't do any real work here, so just store the whole hitresult on the tool
		this.hitResult = hitResult;
		
		// if we went down on nothing, remove all the selected things and go to stock tool
		if(!this.hitResult) {
			app.deselectAll();
			stockTool.activate();
		}
	}
	// mouse drag handler
	function mouseDrag(event) {
		console.log("selectedEditTool.mousedrag");
		
		// if anything was hit
		if(this.hitResult) {
			console.log("hit");
			
			// test for hit type
			if(this.hitResult.type === "segment") {
				console.log("segment, moving");
				// set new segment location
				this.hitResult.segment.point = event.point;
				// redraw
				// TODO it looks like paper js automatically redraws here
				//paper.view.draw();
			} else if(this.hitResult.type == "handle-in") {
				// update location of handle
				this.hitResult.segment.handleIn = event.point.subtract(this.hitResult.segment.point);
				// get group of control point marks
				var markGroup = this.hitResult.item.nextSibling;
				// update location of handleInMark
				markGroup.children.handleInMark.position = event.point;
				paper.view.draw();
			} else if(this.hitResult.type == "fill") {
				this.hitResult.item.position = event.point;
			}
		}
	}
	// mouse up handler
	function mouseUp(event) {
		// clear hit result on mouse up
		// TODO this is not actually necessary after using mouseDrag instead of mouseMove
		this.hitResult = null;
	}
	
	selectedEditTool.onMouseDown = mouseDown;
	selectedEditTool.onMouseDrag = mouseDrag;
	selectedEditTool.onMouseUp = mouseUp;
	
	// return tool
	return selectedEditTool;
})();

var stockTool = (function() {
	// create tool instance
	var stockTool = new paper.Tool();
	
	var selectedColor = '#009dec';
	
	// mouse down handler
	function mouseDown(event) {
		// perform hit test
		var hitResult = paper.project.activeLayer.hitTest(event.point);
		
		// if click on path, draw its control points
		if(hitResult) {
			hitResult.item.selected = true;
			// create new group for markers
			var markerGroup = new paper.Group();
			// create markers for control points and add to group
			$.each(hitResult.item.segments, function(index, segment) {

				// create a marker for segment
				//var segmentMark = new paper.Path.Circle(segment.point, 4);
				//segmentMark.fillColor = 'blue';
				// add marker as child of path
				//markerGroup.addChild(segmentMark);
				
				// create a marker for handleIn
				var handleInMark = new paper.Path.Circle(segment.handleIn.add(segment.point), 4);
				handleInMark.fillColor = selectedColor;
				handleInMark.name = "handleInMark"+index;
				// add marker as child of path
				markerGroup.addChild(handleInMark);
				
				// create a line to handleIn
				var handleInLine = new paper.Path.Line(segment.point, segment.point.add(segment.handleIn));
				handleInLine.strokeColor = selectedColor;
				handleInLine.name = "handleInLine";
				markerGroup.addChild(handleInLine);
				
				// create a marker for handleOut
				var handleOutMark = new paper.Path.Circle(segment.handleOut.add(segment.point), 4);
				handleOutMark.fillColor = selectedColor;
				handleOutMark.name = "handleOutMark";
				// add marker as child of path
				markerGroup.addChild(handleOutMark);
				
				// create a line ot handleOut
				var handleOutLine = new paper.Path.Line(segment.point, segment.point.add(segment.handleOut));
				handleOutLine.strokeColor = selectedColor;
				handleOutLine.name = "handleOutLine";
				markerGroup.addChild(handleOutLine);
			});
			console.log("moveAbove: " + markerGroup.moveAbove(hitResult.item));
			console.log("is below: " + markerGroup.isBelow(hitResult.item));
			
			// activate edit tool
			editTool.activate();
		} else {
			app.deselectAll();
		}
	}
	// mouse move handler
	function mouseMove(event) {
		return;
		// check if hover over a path
		// define options for hit test
		var hitTestOptions = {
			// TODO anything?
		};
		
		// perform hit test
		var hitResult = paper.project.activeLayer.hitTest(event.point);
		
		// if hovering over a path, show as selected
		if(hitResult) {
			hitResult.item.selected = true;
		} else {
			app.deselectAll();
		}
	}
	
	stockTool.onMouseDown = mouseDown;
	stockTool.onMouseMove = mouseMove;
	
	return stockTool;
}());

var deselectAll = function() {	
	
	// if clicked on nothing, removed children from any selected paths
	$.each(paper.project.selectedItems, function(index, item) {
		// find group which is the next sibling, and remove it
		item.nextSibling.remove();
	});
	paper.project.deselectAll();
}

return {
	stockTool: stockTool,
	editTool: editTool,
	deselectAll: deselectAll
}

}());