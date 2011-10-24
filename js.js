var paper, console, $; // for jslint
function GetSelectedEditTool() {
	
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
			tolerance:100 // this appears to be in pixels^2 or something // TODO magic number
		};
		
		// perform hit test
		var hitResult = paper.project.activeLayer.hitTest(event.point, hitTestOptions);

		// we don't do any real work here, so just store the whole hitresult on the tool
		this.hitResult = hitResult;
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
}

function GetStockTool() {
	// create tool instance
	var stockTool = new paper.Tool();
	
	// mouse move handler
	function mouseMove(event) {
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
			// if not hovering over any path, clear selected paths
			$.each(paper.project.selectedItems, function(index, item) {
				item.selected = false;
			});
		}
	}
	
	stockTool.onMouseMove = mouseMove;
	
	return stockTool;
}
