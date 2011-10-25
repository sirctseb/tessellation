var paper, console, $;
// for jslint

var app = ( function() {

	var grid = {
		scale: 100
	};
	var stockTool, editTool;

	editTool = (function() {

		// create tool instance
		var selectedEditTool = new paper.Tool();

		// mouse down handler
		function mouseDown(event) {
			//console.log("selectedEditTool.mousedown");

			// define options for hit test
			var hitTestOptions = {
				//type: paper.PathItem, // TODO as a string or what? // I don't think this is used
				segments : true, // look for segment points
				handles : true, // look for segment handles
				selected : true, // look for selected paths
				tolerance : 100 // this appears to be in pixels^2 or something // TODO magic number
			};

			// perform hit test
			var hitResult = paper.project.activeLayer.hitTest(event.point, hitTestOptions);

			// we don't do any real work here, so just store the whole hitresult on the tool
			this.hitResult = hitResult;

			// if we went down on nothing, remove all the selected things and go to stock tool
			if(!this.hitResult) {
				//if(event.modifiers.shift && paper.project.selectedItems.length == 1) {
				if(event.modifiers.shift) {
					// add to path
					//paper.project.selectedItems[0].lineTo(event.point);
					// add to last symbol
					lastSymbol.definition.lineTo(event.point.subtract(lastSymbolPoint));
					//lastSymbol.definition.strokeColor = 'black';
				} else {
					app.deselectAll();
					stockTool.activate();
				}
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

	var lastSymbol; // TODO this is bad
	var lastSymbolPoint; // TODO very bad
	stockTool = ( function() {
		// create tool instance
		var stockTool = new paper.Tool();

		var selectedColor = '#009dec';

		// mouse down handler
		function mouseDown(event) {
			console.log(event.item);
			
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
				
			} else if(event.modifiers.shift) {
				
				// create new path
				var newPath = new paper.Path([event.point]);
				//var newPath = new paper.Path([event.point, event.point.add([20,0])]);
				//var newPath = new paper.Path.Circle(event.point, 20);
				newPath.strokeColor = 'black';
				
				// select it
				newPath.selected = true;
				
				// store offset from tile
				var offset = newPath.position.subtract(getTileAt(newPath.position).multiply(grid.scale));
				console.log(newPath.position.x, newPath.position.y);
				console.log(offset.x, offset.y);
				
				// make symbol and place over grid
				var newPathSymbol = new paper.Symbol(newPath);
				
				// put original back in the layer
				paper.project.activeLayer.addChild(newPath);
				
				overGrid(function(tile, tileCenter) {
					//console.log(offset.x, offset.y);
					//console.log(tile.x, tile.y);
					var pos = tile.multiply(grid.scale).add(offset);
					//console.log(pos.x, pos.y);
					newPathSymbol.place(tile.multiply(grid.scale).add(offset));
				});
				lastSymbol = newPathSymbol;
				lastSymbolPoint = event.point;
				
				// activate edit tool
				editTool.activate();
			}
		}

		// mouse move handler
		function mouseMove(event) {
			// check if hover over a path

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
	};
	
	var gridLayer;
	var init = function() {
		// draw gridlines
		// TODO make app a jquery plugin
		var width = $("#testcanvas").width();
		var height = $("#testcanvas").height();
		
		// create layer for grid
		gridLayer = new paper.Layer();
		
		// create grid lines 
		var gridPath = new paper.Path([new paper.Point(0,grid.scale), new paper.Point(0,0), new paper.Point(grid.scale, 0)]);
		gridPath.strokeColor = 'black';
		var gridSymbol = new paper.Symbol(gridPath);
		
		// draw grid over canvas
		for(var i = 0; i < width / grid.scale; i++) {
			for(var j = 0; j < height / grid.scale; j++) {
				// add 0.5 * grid.scale because it places at center, and add 0.5 so that it doesn't alias by default
				gridSymbol.place(new paper.Point((i + 0.5) * grid.scale + 0.5, (j + 0.5) * grid.scale + 0.5));
			}
		}
		
		// activate original layer
		gridLayer.previousSibling.activate();
	};
	
	
	var overGrid = function(func) {
		// TODO make app a jquery plugin
		var width = $("#testcanvas").width();
		var height = $("#testcanvas").height();
		
		// call a function for each grid tile
		for(var i = 0; i < width / grid.scale; i++) {
			for(var j = 0; j < height / grid.scale; j++) {
				func(new paper.Point(i,j),
					new paper.Point((i + 0.5) * grid.scale + 0.5, (j + 0.5) * grid.scale + 0.5));
			}
		}
	};
	
	var getTileAt = function(point) {
		/*var canvasPoint = this.elementToCanvas(point);
		return new Point().setxy(Math.floor(canvasPoint.x / this.pathView.panelWidth),
								Math.floor(canvasPoint.y / this.pathView.panelHeight));*/
		return new paper.Point(Math.floor(point.x / grid.scale),
								Math.floor(point.y / grid.scale));
	};
	
	return {
		stockTool : stockTool,
		editTool : editTool,
		deselectAll : deselectAll,
		init: init
	};

}());
