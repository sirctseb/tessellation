var paper, console, $, tessellation;
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
		origin: new paper.Point(),
		scale: 100,
		topLeft: new paper.Point(),
		topRight: new paper.Point()
	};
	
	var paths = [];
	var stockTool, editTool;


	editTool = (function() {

		// create tool instance
		var selectedEditTool = new paper.Tool();

		// mouse down handler
		function mouseDown(event) {
			console.log("selectedEditTool.mousedown");

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

			// store the whole hitresult on the tool
			this.hitResult = hitResult;
			
			// check for hit on a stroke for inserting point
			// define options for hit test for stroke
			var strokeHitTestOptions = {
				stroke: true, // look for strokes
				selected : true, // look for selected paths
				tolerance : 2 // this appears to be in pixels^2 or something // TODO magic number
			};

			// if we went down on nothing, check if we're holding shift to add a point somewhere
			if(!this.hitResult) {
				if(event.modifiers.shift) {
					// perform hit test
					hitResult = paper.project.activeLayer.hitTest(event.point, strokeHitTestOptions);
					// if we hit a stroke, insert a segment there
					if(hitResult) {
						console.log("hit stroke: " + hitResult.location.index+1);
						
						// if we went down on a stroke and we have shift selected, insert a new point on the path there
						hitResult.item.insert(hitResult.location.index+1, event.point);
						
						// redo the hit test so that the new segment will be hit
						this.hitResult = paper.project.activeLayer.hitTest(event.point, hitTestOptions);
					} else {
						// if we don't hit a stroke, append a point to the end
						console.log("shift held, adding point");
						
						// add to last symbol
						lastSymbol.definition.lineTo(event.point);
					}
				} else {
					// check for hit on stroke
					hitResult = paper.project.activeLayer.hitTest(event.point, strokeHitTestOptions);
					if(hitResult) {
						this.hitResult = hitResult;
					} else {
						// if not holding shift, just deselect everything
						// TODO which of these do we want?
						// TODO this deselects segments also
						//app.deselectAll();
						// TODO this only deselects paths, but leaves segments selected
						$.each(paper.project.selectedItems, function(index, item) {
							item.selected = false;
						});
						// go back to stock tool
						stockTool.activate();
					}
				}
			} else {
				// if we hit a segment, do selection work
				if(this.hitResult.type === "segment") {
					// if shift held, toggle selection of segment
					if(event.modifiers.shift) {
						// toggle segment selection
						this.hitResult.segment.selected = !this.hitResult.segment.selected;
						// TODO should probably also set this.hitResult to null so it doesn't drag
						// TODO it doesn't draw after this selection for some reason
						paper.view.draw();
					} else {
						// if the segment is already selected, don't deselect others
						// TODO however, if we mouse up without dragging on an already selected segment,
						// we should probably select only this one
						if(!this.hitResult.segment.selected) {
							// first deselect any other selected segments
							$.each(this.hitResult.item.segments, function(index, segment) {
								segment.selected = false;
							});
							// select this segment
							this.hitResult.segment.selected = true;
						}
					}
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
					// set new segment location
					//this.hitResult.segment.point = event.point;
					// translate selected segments
					$.each(this.hitResult.item.segments, function(index, segment) {
						if(segment.selected) {
							segment.point = segment.point.add(event.delta);
						}
					});
				} else if(this.hitResult.type === "handle-in") {
					// update location of handle
					this.hitResult.segment.handleIn = event.point.subtract(this.hitResult.segment.point);
					// make symmetric if shift held
					if(event.modifiers.shift) {
						this.hitResult.segment.handleOut = this.hitResult.segment.handleIn.negate();
					}
				} else if(this.hitResult.type === "handle-out") {
					// update location of handle
					this.hitResult.segment.handleOut = event.point.subtract(this.hitResult.segment.point);
					// make symmetric if shift held
					if(event.modifiers.shift) {
						this.hitResult.segment.handleIn = new paper.Point().subtract(this.hitResult.segment.handleOut);
					}
				} else if(this.hitResult.type === "stroke") {
					// translate entire path
					this.hitResult.item.translate(event.delta);
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
			//console.log(event.item);
			console.log(paper.tess44.getTileAt(event.point).toString());
			
			// perform hit test
			var hitResult = paper.project.activeLayer.hitTest(event.point);

			// if click on path, draw its control points
			if(hitResult) {

				// select path
				hitResult.item.selected = true;

				// select segments
				/*$.each(hitResult.item.segments, function(index, segment) {
					segment.selected = true;
				});*/
				
				// activate edit tool
				editTool.activate();
				
			} else if(event.modifiers.shift) {
				
				// create new path
				var newPath = new paper.Path([event.point]);
				newPath.strokeColor = 'black';
				// store in path list
				paths.push(newPath);
				
				// name it
				newPath.name = "path" + settings.newPathNumber;
				
				// select it
				newPath.selected = true;
				
				// store offset from zero
				var originalPosition = newPath.position.clone();
				// store offset from 0 to tile
				var tileOffset = tessellationToPaper(getTileAt(newPath.position));
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
				var zero = new paper.Point();
				overGrid(function(tile) {
					// if the original path isn't in this tile, place a symbol
					if(!tile.equals(originalTile)) {
						// get position of tile
						//var pos = tileToPaper(zero, tile);
						var pos = tessellationToPaper(tile).subtract(tessellationToPaper(originalTile));
						//var pos = tessellationToPaper(tile.subtract(originalTile));
						var placedSymbol = newPathSymbol.place(pos);
						// place symbol and put in group
						copyGroup.addChild(placedSymbol);
					}
				});
				
				// offset placed symbols by tile offset
				//copyGroup.translate(tileOffset.negate());
				
				lastSymbol = newPathSymbol;
				lastSymbolPoint = event.point;
				
				// activate edit layer
				paper.project.layers[settings.editLayer].activate();
				
				// activate edit tool
				editTool.activate();
			}
		}
		
		blah = {};
		// mouse drag handler
		function mouseDrag(event) {
			// scale if alt is held
			if(event.modifiers.option) {
				var newWay = true;
				if(!newWay) {
					// scale with respect to the upper-left corner of the current tile
					// get upper left point
					var ulPoint = tessellationToPaper(getTileAt(event.point));
					// get last mouse point distance sq
					var lastDistSq = event.lastPoint.getDistance(ulPoint, true);
					// get current mouse point distance sq
					var curDistSq = event.point.getDistance(ulPoint, true);
					// get ratio
					var scaleRatio = curDistSq / lastDistSq;
					// modify scale
					grid.scale *= scaleRatio;
					// scale existing paths
					paper.project.layers[settings.editLayer].scale(scaleRatio, ulPoint);
					paper.project.layers[settings.gridLayer].scale(scaleRatio, ulPoint);
					// TODO figure out how to keep this stuff in sync with the grid scale and translation
					// one solution would be to make everything a symbol and then we can set the matrix directly
					// we could write methods on PlacedItem to set parts of the matrix directly
					// but then we lose the feature of only changing the symbol definitions
					// can you make a symbol based on another symbol? if so, do both matrices get applied?
				} else {
					// get upper left point
					var ulPoint = tessellationToPaper(getTileAt(event.point));
					/*if(!blah.ulPoint) {
						ulPoint = tessellationToPaper(getTileAt(event.point));
						blah.ulPoint = ulPoint;
					} else {
						ulPoint = blah.ulPoint;
					}*/
					console.log('ulPoint: ' + ulPoint.toString());
					var origDistSq = event.downPoint.getDistance(ulPoint,false);
					console.log('orignDist: ' + origDistSq.toString());
					var curDistSq = event.point.getDistance(ulPoint,false);
					console.log('curDist: ' + curDistSq.toString());
					paper.view.zoom = paper.view.zoom * curDistSq / origDistSq;
					console.log('ratio: ' + origDistSq / curDistSq);
					console.log('zoom: ' + paper.view.zoom);
					paper.view.center = ulPoint.add(paper.view.center.subtract(ulPoint).multiply(
						//1 / paper.view.center.getDistance(ulPoint) * origDistSq / curDistSq
						origDistSq / curDistSq
					));
					console.log('center: ' + paper.view.center.toString());
					paper.view.draw();
					grid.origin = paper.view.center;
					grid.scale = grid.scale * origDistSq / curDistSq;
					
					// scale from center
					/*var dist1 = event.downPoint.getDistance(paper.view.center,true);
					var dist2 = event.point.getDistance(paper.view.center,true);
					paper.view.zoom = paper.view.zoom * dist2 / dist1;
					paper.view.draw();*/
				}
			} else {
				var newWay = true;
				if(!newWay) {
					// translate only the layer with the original paths and the layer with the grid
					// if you translate the symbol layer, the symbols get translated twice because you're
					// translating the definition also
					paper.project.layers[settings.editLayer].translate(event.delta);
					paper.project.layers[settings.gridLayer].translate(event.delta);
					// update the origin
					grid.origin = grid.origin.add(event.delta);
				} else {					
					// TODO try doing it in view
					//paper.view.center = paper.view.center.subtract(event.delta);
					// can't use delta because lastPoint is express in
					// the project coordinates that existed before the move 
					paper.view.center = paper.view.center.subtract(event.point.subtract(event.downPoint));
					// TODO i can never tell when we'll have to call draw()
					paper.view.draw();
				}
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
		stockTool.onMouseDrag = mouseDrag;

		return stockTool;
	}());

	var deselectAll = function() {
		// deselect selected segments of selected paths
		// TODO check that a selected item is a path at all
		$.each(paper.project.selectedItems, function(index, selected) {
			$.each(selected.segments, function(index, segment) {
				segment.selected = false;
			});
		});
		paper.project.deselectAll();
	};
	
	var init = function() {	
		/*paper.view.onFrame = function(event) {
				//paper.view.zoom = 1*Math.sin(event.time/10)+0.1;
				//console.log(Math.sin(event.time/10));
				//console.log(paper.view.zoom);
				//paper.view.zoom = 2;
				//paper.view.zoom = 0.4;
				//paper.view.draw();
		};*/
		
		//paper.view.zoom = 2;
		// draw gridlines
		// TODO make app a jquery plugin
		/*var width = $("#testcanvas").width();
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
		var centerOfTile = new paper.Point(0.505, 0.505);
		overGrid(function(tile) {
			//gridSymbol.place(new paper.Point((i + 0.5) * grid.scale + 0.5, (j + 0.5) * grid.scale + 0.5));
			//gridSymbol.place(center);
			gridSymbol.place(tileToPaper(centerOfTile, tile));
		});
		
		// activate original layer
		gridLayer.previousSibling.activate();*/
		
		// intialize with new tessellation stuff
		// set zoom
		//var circ = new paper.Path.Circle([0,0], 10);
		//circ.strokeColor = 'red';
		
		//paper.view.center.x = 0;
		//paper.view.center.y = 0;
		//paper.view.center = [0,0];
		//paper.view.zoom = 1;

		
		// create layers in order
		var gridLayer = new paper.Layer();
		var copyLayer = new paper.Layer();
		// activate original layer
		paper.project.layers[0].activate();
		
		var tess44 = tessellation.setup({type: "{4,4}",
										gridColor: settings.gridColor,
										editLayer: settings.editLayer,
										gridLayer: settings.gridLayer,
										copyLayer: settings.copyLayer});
										
		// TODO testing
		paper.tess44 = tess44;
		
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
		
		// test if you can make a symbol from a placeditem, and if so, if both matrices apply
		// make circle
		/*var circ = new paper.Path.Circle([50,50], 20);
		circ.fillColor = 'red';
		circ.strokeColor = 'black';
		// make symbol
		var circSymbol = new paper.Symbol(circ);
		// place symbol
		var circPlaced = circSymbol.place([100,100]);
		// place a second symbol
		circSymbol.place([150,150]);
		// make symbol from placed symbol
		var subSymbol = new paper.Symbol(circPlaced);
		// place one of those
		var subPlaced = subSymbol.place([200,200]);
		// place a second of those
		subSymbol.place([250,250]);
		// translate definition of subsymbol, which is a placed symbol
		//subPlaced.symbol.definition.translate([50,50]);
		circPlaced.translate([50,50]);
		circPlaced.scale(2);
		console.log(subPlaced.matrix);
		console.log(circPlaced.matrix);*/
		//console.log(subPlaced.symbol.definition);
		// it works. both matrices are applied
		
		
		// placement testing
		/*var circ = new paper.Path.Circle([50,50], 20);
		circ.fillColor = 'red';
		var symbol = new paper.Symbol(circ);
		paper.project.activeLayer.addChild(circ);
		circ.translate([50,50]);
		var placed = symbol.place();*/
		
		
		
	};
	
	
	var overGrid = function(func) {
		// TODO make app a jquery plugin
		var width = $("#testcanvas").width();
		var height = $("#testcanvas").height();
		
		// call a function for each grid tile
		for(var i = 0; i < width / grid.scale; i++) {
			for(var j = 0; j < height / grid.scale; j++) {
				func(new paper.Point(i,j));//,
					//new paper.Point((i + 0.5) * grid.scale + 0.5, (j + 0.5) * grid.scale + 0.5));
			}
		}
	};
	
	var getTileAt = function(point) {
		/*var canvasPoint = this.elementToCanvas(point);
		return new Point().setxy(Math.floor(canvasPoint.x / this.pathView.panelWidth),
								Math.floor(canvasPoint.y / this.pathView.panelHeight));*/
		return new paper.Point(Math.floor((point.x - grid.origin.x) / grid.scale),
								Math.floor((point.y - grid.origin.y) / grid.scale));
	};
	// convert between spaces
	var paperToTessellation = function(point) {
		return point.subtract(grid.origin).multiply(1/grid.scale);
	};
	var tessellationToPaper = function(point) {
		return point.multiply(grid.scale).add(grid.origin);
	};
	var tileToTessellation = function(point, tile) {
		return point.add(tile);
	};
	var tessellationToTile = function(point, tile) {
		return point.subtract(tile);
	};
	var tileToPaper = function(point, tile) {
		return tessellationToPaper(tileToTessellation(point,tile));
	};
	var paperToTile = function(point, tile) {
		return tessellationToTile(paperToTessellation(point), tile);
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
			stroke: true,
			tolerance:2
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
		testHit: testHit,
		viewInfo: function() {
			console.log("view.size: ", paper.view.size.toString());
			console.log("view.bounds: ", paper.view.bounds.toString());
			console.log("view.center: ", paper.view.center.toString());
			console.log("view.bounds.center: " + paper.view.bounds.center.toString());
			console.log("view bounds: ", paper.view.bounds);
		}
	};

}());
