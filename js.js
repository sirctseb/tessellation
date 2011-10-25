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
		//console.log("selectedEditTool.mousedrag");
		
		// if anything was hit
		if(this.hitResult) {
			//console.log("hit");
			
			// test for hit type
			if(this.hitResult.type === "segment") {
				//console.log("segment, moving");
				// set new segment location
				this.hitResult.segment.point = event.point;
			} else if(this.hitResult.type == "handle-in") {
				// update location of handle
				this.hitResult.segment.handleIn = event.point.subtract(this.hitResult.segment.point);
				if(event.modifiers.shift) {
					console.log("symmetrical");
					this.hitResult.segment.handleOut = new paper.Point().subtract(this.hitResult.segment.handleIn);
				}
			} else if(this.hitResult.type == "handle-out") {
				this.hitResult.segment.handleOut = event.point.subtract(this.hitResult.segment.point);
				if(event.modifiers.shift) {
					this.hitResult.segment.handleIn = new paper.Point().subtract(this.hitResult.segment.handleOut);
				}
			}
		}
	}
	// mouse up handler
	function mouseUp(event) {
		// clear hit result on mouse up
		// TODO this is not actually necessary after using mouseDrag instead of mouseMove
		this.hitResult = null;
	}
	// TODO we don't get a keydown for shift key
	// i wanted to use it to impose symmetry on the handles when shift went down after
	// already having dragged one point somewhere
	function keyDown(event) {
		/*console.log(event.type);
		console.log(event.character);
		console.log(event.key);*/
	}
	
	selectedEditTool.onMouseDown = mouseDown;
	selectedEditTool.onMouseDrag = mouseDrag;
	selectedEditTool.onMouseUp = mouseUp;
	selectedEditTool.onKeyDown = keyDown;
	
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
			
			// select path
			hitResult.item.selected = true;
			
			// select segments
			$.each(hitResult.item.segments, function(index, segment) {
				segment.selected = true;
			});
			
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
	paper.project.deselectAll();
}

return {
	stockTool: stockTool,
	editTool: editTool,
	deselectAll: deselectAll
}

}());