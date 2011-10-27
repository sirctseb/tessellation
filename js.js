var paper, console, $;
// for jslint

var app = ( function() {
	
	var settings = {
		gridColor: '#bbbbbb',
		editLayer: 0,
		gridLayer: 1,
		copyLayer: 2,
		newPathNumber: 0
	};

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
				tolerance : 50 // this appears to be in pixels^2 or something // TODO magic number
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
					//lastSymbol.definition.lineTo(event.point.subtract(lastSymbolPoint));
					lastSymbol.definition.lineTo(event.point);
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
					// make symmetric if shift held
					if(event.modifiers.shift) {
						this.hitResult.segment.handleOut = this.hitResult.segment.handleIn.negate();
					}
				} else if(this.hitResult.type == "handle-out") {
					// update location of handle
					this.hitResult.segment.handleOut = event.point.subtract(this.hitResult.segment.point);
					// make symmetric if shift held
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
			console.log(event.type);
			console.log(event.character);
			console.log(event.key);
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
				newPath.strokeColor = 'black';
				
				// select it
				newPath.selected = true;
				
				// name it
				newPath.name = "path" + settings.newPathNumber;
				
				// store offset from zero
				var originalPosition = newPath.position.clone();
				// store offset from tile
				var offset = newPath.position.subtract(getTileAt(newPath.position).multiply(grid.scale));
				// store offset from 0 to tile
				var tileOffset = getTileAt(newPath.position).multiply(grid.scale);
				// store tile of new path
				var originalTile = getTileAt(newPath.position);
				
				// make symbol
				var newPathSymbol = new paper.Symbol(newPath);
				
				// TODO I think a paper.js bug: hittest tolerance grows when something is at (0,0)
				// move back to original position
				newPathSymbol.definition.position = newPathSymbol.definition.position.add(originalPosition);
				
				// select definition again
				newPath.selected = true;
				
				// put original back in the layer
				paper.project.layers[settings.editLayer].addChild(newPath);
				
				// activate copy layer to put symbols in
				paper.project.layers[settings.copyLayer].activate();
				
				// make group for layers
				var copyGroup = new paper.Group();
				copyGroup.name = "path" + settings.newPathNumber;
				
				// increment new path number
				settings.newPathNumber++;
				
				// place symbols
				overGrid(function(tile, tileCenter) {
					// if the original path isn't in this tile, place a symbol
					if(!tile.equals(originalTile)) {
						// get position of tile
						var pos = tile.multiply(grid.scale);
						var placedSymbol = newPathSymbol.place(pos);
						// place symbol and put in group
						copyGroup.addChild(placedSymbol);
					}
				});
				
				// offset placed symbols by tile offset
				copyGroup.translate(tileOffset.negate());
				
				lastSymbol = newPathSymbol;
				lastSymbolPoint = event.point;
				
				// activate edit layer
				paper.project.layers[settings.editLayer].activate();
				
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
	
	var init = function() {
		// draw gridlines
		// TODO make app a jquery plugin
		var width = $("#testcanvas").width();
		var height = $("#testcanvas").height();
		
		// create layer for grid
		var gridLayer = new paper.Layer();
		
		// create layer for copies
		var copyLayer = new paper.Layer();
		
		// activate grid layer
		gridLayer.activate();
		
		// create grid lines 
		var gridPath = new paper.Path([new paper.Point(0,grid.scale), new paper.Point(0,0), new paper.Point(grid.scale, 0)]);
		gridPath.strokeColor = settings.gridColor;
		var gridSymbol = new paper.Symbol(gridPath);
		
		// draw grid over canvas
		/*for(var i = 0; i < width / grid.scale; i++) {
			for(var j = 0; j < height / grid.scale; j++) {
				// add 0.5 * grid.scale because it places at center, and add 0.5 so that it doesn't alias by default
				gridSymbol.place(new paper.Point((i + 0.5) * grid.scale + 0.5, (j + 0.5) * grid.scale + 0.5));
			}
		}*/
		overGrid(function(tile, center) {
			//gridSymbol.place(new paper.Point((i + 0.5) * grid.scale + 0.5, (j + 0.5) * grid.scale + 0.5));
			gridSymbol.place(center);
		});
		
		// activate original layer
		gridLayer.previousSibling.activate();
		
		/*var group1 = new paper.Group();
		var group2 = new paper.Group();
		var circ = new paper.Path.Circle(new paper.Point(20,20), 10);
		console.log("circ child of layer: " + paper.project.activeLayer.isChild(circ));
		circ.fillColor = 'red';
		group1.addChild(circ);
		console.log("child of group1: " + group1.isChild(circ));
		console.log("child of group2: " + group2.isChild(circ));
		group2.addChild(circ);
		console.log("child of group1: " + group1.isChild(circ));
		console.log("child of group2: " + group2.isChild(circ));
		group2.addChild(group1);
		console.log("group1 child of group2: " + group2.isChild(group1));
		console.log("circ child of layer: " + paper.project.activeLayer.isChild(circ));
		group1.name = "group1";
		console.log(group2.children.group1);*/
		// results of these tests:
		// items can be child of only one group / layer at a time
		// group can be child of another group
		// groups can be named
		
		/*var groupa = new paper.Group();
		var circ1 = new paper.Path.Circle(new paper.Point(20,20), 10);
		var circ2 = new paper.Path.Circle(new paper.Point(50,20), 10);
		groupa.addChild(circ1);
		groupa.addChild(circ2);
		groupa.fillColor = 'red';
		//groupa.scale(0.1);
		var circ3 = new paper.Path.Circle(new paper.Point(80,20), 10);
		circ3.fillColor = 'black';
		groupa.addChild(circ3);
		groupa.translate([0,40]);*/
		// results of these tests:
		// attributes set on a group are not applied to items added to the group
		// after the attributes have been set
		
		/*var circa = new paper.Path.Circle([20,20], 10);
		circa.fillColor = 'red';
		var circSymbol = new paper.Symbol(circa);
		var circPlaced = circSymbol.place([15,15]);
		console.log(circPlaced.matrix.translateX, circPlaced.matrix.translateY);
		circPlaced.translate([10,10]);
		console.log(circPlaced.matrix.translateX, circPlaced.matrix.translateY);
		circSymbol.definition.translate([20,20]);
		console.log(circPlaced.matrix.translateX, circPlaced.matrix.translateY);*/
		// results of these tests:
		// translating or the placement point of a placedsymbol affects its matrix,
		// but translating the definition of the symbol doesn't
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
	
	var testHit = function() {
		
		// TODO make app a jquery plugin
		var width = $("#testcanvas").width();
		var height = $("#testcanvas").height();
		
		// TODO was testing. figured out that it's options.segments, not options.segment
		// monte carlo simulation of trying to click on segments
		// define options for hit test
		var hitTestOptions = {
			//type: paper.PathItem, // TODO as a string or what? // I don't think this is used
			segments: true, // look for segment points
			handles: true, // look for segment handles
			selected: true, // look for selected paths
			tolerance:100
		};
		
		var res = 50;
		
		var hitCircle = new paper.Path.Circle(null, 3);
		hitCircle.fillColor = 'green';
		var hitSymbol = new paper.Symbol(hitCircle);
		var missCircle = new paper.Path.Circle(null, 3);
		missCircle.fillColor = 'red';
		var missSymbol = new paper.Symbol(missCircle);
		//for(var i = 0; i < 1000; i++) {
		for(var i = 0; i < res; i++) {
			for(var j = 0; j < res; j++) {
				// perform hit test
				//var testPoint = new paper.Point(Math.random()*400, Math.random()*400);
				var testPoint = new paper.Point(i * width / res, j * height / res);
				var hitResult = paper.project.activeLayer.hitTest(testPoint, hitTestOptions);
				if(hitResult) {
					hitSymbol.place(testPoint);
				} else {
					missSymbol.place(testPoint);
				}
			}
		}
	 };
	
	return {
		stockTool : stockTool,
		editTool : editTool,
		deselectAll : deselectAll,
		init: init,
		testHit: testHit
	};

}());
