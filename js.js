var paper, console, $, tessellation;
// for jslint

var app = (function () {

	var settings = {
		gridColor: '#bbbbbb',
		editLayer: 0,
		gridLayer: 1,
		copyLayer: 2,
		latticeEditLayer: 3,
		newPathNumber: 0
	};
	
	var paths = [];
	var stockTool, editTool, testHitTool;
	var app = {};
	
	testHitTool = (function() {
		var testTool = new paper.Tool();
		
		testTool.onMouseDown = function(event) {
			//var poly = app.tess.hitPolygons(event.point);
			var poly = app.tessellationView.hitPolygons(event.point);
			// print result of click
			console.log(poly.toString());
		};
		
		return testTool; 
	})();

	editTool = (function() {

		// create tool instance
		var selectedEditTool = new paper.Tool();

		// mouse down handler
		function mouseDown(event) {
			log.log("selectedEditTool.mousedown", "tools");

			// define options for hit test
			var hitTestOptions = {
				//type: paper.PathItem, // TODO as a string or what? // I don't think this is used
				segments : true, // look for segment points
				handles : true, // look for segment handles
				selected : true, // look for selected paths
			};

			// perform hit test
			var hitResult = paper.project.layers[settings.editLayer].hitTest(event.point, hitTestOptions);

			// store the whole hitresult on the tool
			this.hitResult = hitResult;
			
			// check for hit on a stroke for inserting point
			// define options for hit test for stroke
			var strokeHitTestOptions = {
				stroke: true, // look for strokes
				selected : true, // look for selected paths
			};

			// if we went down on nothing, check if we're holding shift to add a point somewhere
			if(!this.hitResult) {
				if(event.modifiers.shift) {
					// perform hit test
					hitResult = paper.project.layers[settings.editLayer].hitTest(event.point, strokeHitTestOptions);
					// if we hit a stroke, insert a segment there
					if(hitResult) {
						console.log("hit stroke: " + hitResult.location.index+1);
						
						// if we went down on a stroke and we have shift selected, insert a new point on the path there
						hitResult.item.insert(hitResult.location.index+1, event.point);
						
						// redo the hit test so that the new segment will be hit
						this.hitResult = paper.project.layers[settings.editLayer].hitTest(event.point, hitTestOptions);
					} else {
						// if we don't hit a stroke, append a point to the end
						console.log("shift held, adding point");
						
						// add to selected
						// TODO assumes we have only one selected item
						if(paper.project.selectedItems.length > 0) {
							paper.project.selectedItems[0].lineTo(event.point);
						}
					}
				} else {
					// check for hit on stroke
					hitResult = paper.project.layers[settings.editLayer].hitTest(event.point, strokeHitTestOptions);
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
			log.log("selectedEditTool.mousedrag", "tools");

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

		// mouse move handler
		function mouseMove(event) {
			log.log("edit Tool: mouse move", "tools");
		}

		// mouse up handler
		function mouseUp(event) {
			log.log('selected edit: mouse up', 'tools');
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

	stockTool = ( function() {
		// create tool instance
		var stockTool = new paper.Tool();

		var selectedColor = '#009dec';

		// mouse down handler
		function mouseDown(event) {
			log.log('stock tool: mouse down', 'tools');
			// hide lattice display if it exists
			if(app.latticeView) {
				app.latticeView.hide();
			}
			
			// perform hit test
			var hitResult = paper.project.activeLayer.hitTest(event.point);

			// if click on path, draw its control points
			if(hitResult) {

				// select path
				hitResult.item.selected = true;
				
				// activate edit tool and give it the hitResult
				editTool.hitResult = hitResult;
				editTool.activate();
				
			} else if(event.modifiers.shift) {
				
				// create new path
				var newPath = new paper.Path([event.point]);
				newPath.strokeColor = 'black';
				newPath.strokeWidth = 3;

				// store in path list
				paths.push(newPath);
				
				// name it
				newPath.name = "path" + settings.newPathNumber;
				
				// add to tessellation
				//app.tess.addPath(newPath);
				// TODO seems like we should add path to the tessellation, not the view?
				app.tessellationView.addPath(newPath);
				
				// activate edit tool
				editTool.activate();
			}
		}
		
		// mouse drag handler
		function mouseDrag(event) {
			log.log('stock tool: mouse drag', 'tools');

			// scale if alt is held
			if(event.modifiers.option) {
				// get view center point
				var center = paper.view.center;
				
				// get distance from mousedown point to center
				var downDistance = event.downPoint.getDistance(center);
				
				// get distance from new point to center
				var currentDistance = event.point.getDistance(center);
				
				// adjust scale by ratio
				paper.view.zoom = paper.view.zoom * currentDistance / downDistance;
			} else {
				// TODO debugging
				if(app.tess.rect && app.tess.rect.bounds.contains(event.point)) {
					//console.log('moving rect');
					//app.tess.rect.point = app.tess.rect.point.add(event.delta);
					app.tess.rect.translate(event.delta);
				} else {
					paper.view.scrollBy(event.downPoint.subtract(event.point).multiply(paper.view.zoom));
				}
				//app.tess.onResize(paper.view);
				app.tessellationView.onResize(paper.view);
			}
		}

		// mouse move handler
		function mouseMove(event) {
			log.log('stock tool: mouse move', 'tools');
			// check if hover over a path

			// perform hit test
			var hitResult = paper.project.activeLayer.hitTest(event.point);

			// if hovering over a path, show as selected
			if(hitResult) {
				hitResult.item.selected = true;
			} else {
				//app.deselectAll();
			}
		}

		function mouseUp(event) {
			log.log("stock tool: mouse up", "tools");
		}


		stockTool.onMouseDown = mouseDown;
		stockTool.onMouseMove = mouseMove;
		stockTool.onMouseDrag = mouseDrag;
		stockTool.onMouseUp = mouseUp;

		return stockTool;
	}());

	latticeDebugTool = ( function() {
		var ldTool = new paper.Tool();
		ldTool.target = new paper.Point();
		ldTool.onMouseDown = function(event) {
			// remove any previous ones
			if(paper.project.activeLayer.children['ldGroup']) {
				paper.project.activeLayer.children['ldGroup'].remove();
			}

			// make a new point
			ldTool.target = event.point;
			// show decomposition into lattice components
			//var v1 = app.tess.lattice().v1();
			//var v2 = app.tess.lattice().v2();
			/*var v1 = new paper.Path.Line(new paper.Point(), app.tess.lattice().v1());
			var v2 = new paper.Path.Line(new paper.Point(), app.tess.lattice().v2());
			v1.strokeColor = 'red';
			v2.strokeColor = 'green';*/

			var coef = app.tess.lattice().decompose(event.point);
			var c1 = app.tess.lattice().v1().multiply(coef.x);
			var c2 = app.tess.lattice().v2().multiply(coef.y);
			var c1Line = new paper.Path.Line(new paper.Point(), c1);
			var c2Line = new paper.Path.Line(c1, c1.add(c2));
			console.log('coef: ' + coef.toString());
			var cursor = new paper.Path.Circle(event.point, 5);

			var group = new paper.Group([c1Line, c2Line, cursor]);
			group.strokeColor = 'blue';
			group.name = 'ldGroup';
		};
		ldTool.onMouseDrag = function(event) {
			paper.view.scrollBy(event.downPoint.subtract(event.point).multiply(paper.view.zoom));
		}
		return ldTool;
	}());

	log.enable('sketch');
	var sketchTool = ( function() {
		var sketchTool = new paper.Tool();
		var path = null;
		var mousedrag = function(event) {
			if(!path) {
				path = new paper.Path([event.point, event.lastPoint]);
				path.strokeColor = 'black';
				path.strokeWidth = 3;
				app.tessellationView.addPath(path);
			}
			if(path) {
				log.log('adding new point', 'sketch');
				path.add(event.point);
			}
		}
		var mouseup = function(event) {
			if(path) {
				log.log('simplifying path');
				path.simplify();
			}
			path = null;
		}
		sketchTool.onMouseDrag = mousedrag;
		sketchTool.onMouseUp = mouseup;
		return sketchTool;
	}());

	app.noopTool = ( function() {
		return new paper.Tool();
	}());

	/* tessellationView delegate methods */
	app.onPathAdded = function(polygon, path) {
		// update the html view
		app.htmlView.addPath(polygon, path);
	}
	/* end tessellationView delegate methods */

	/* latticeEditView delegate methods */
	app.onLatticeEditViewMouseDown = function() {
		// deactivate tools so it doesn't drag other stuff at the same time
		app.noopTool.activate();
	}
	app.onLatticeEditViewMouseDrag = function(info) {
		// set value of lattice vectore
		this.tess.lattice()[info.component](info.point);
		// update canvas view
		this.tessellationView.onLatticeChange(paper.view);
		// update html view
		this.htmlView.onLatticeChange();
	}
	app.onLatticeEditViewMouseUp = function() {
		// reactivate stock tool
		app.stockTool.activate();
	}
	/* end latticeEditView delegate methods */

	/* htmlLatticeView delegate methods */
	app.setLatticeValues = function(values) {
		var that = this;
		$.each(values, function(key, value) {
			that.tess.lattice()[key](value);
		});
		// update tessellation view
		this.tessellationView.onLatticeChange(paper.view);
	}

	app.beginEditLattice = function(component) {
		if(this.latticeView) {
			this.latticeView.show(component);
		} else {
			this.latticeView = new LatticeEditView({controller: app,
												tessellation: app.tess,
												latticeEditLayer: settings.latticeEditLayer,
												component: component});
		}
		paper.view.draw();
	};
	/* end htmlLatticeView delegate methods */

	app.applyStyle = function(style) {
		$.each(paper.project.selectedItems, function(index, item) {
			item.style = style;
		});
		paper.view.draw();
	};

	// generate the html ui which displays the lattice definition
	app.generateUI = function() {
		this.htmlView = htmlTessellationView({controller:app, tessellation: this.tess});
		return this.htmlView.root();
	};
	
	var init = function() {
		
		// create layers in order
		var gridLayer = new paper.Layer();
		var copyLayer = new paper.Layer();
		var latticeEditLayer = new paper.Layer();
		// activate original layer
		paper.project.layers[0].activate();
		
		paper.view.scrollBy([-0.5,-0.5]);
		
		//var tessDef = initTessDef();
		var tessellations = tessellationExamples();

		// turn on tool debug output
		//log.enable('tools');
		
		// TODO for debugging: draw coordinate axes
		/*var xaxis = new paper.Path([[0,-100], [0,100]]);
		xaxis.strokeColor = 'red';
		var yaxis = new paper.Path([[-100,0], [100,0]]);
		yaxis.strokeColor = 'red';*/
		
		this.tess = tessellations.GroupHex;
		//this.tess = tessellations.PolyGroup44;
		//this.tess = tessellations.HitGroup;
		//this.tess = tessellations.HeartGroup;

		this.tessellationView = tessellationView({controller: this, tessellation: this.tess});
		this.tessellationView.render(paper.view);

		sketchTool.activate();
		//stockTool.activate();
		//testHitTool.activate();
		//latticeDebugTool.activate();
		this.tessellation = this.tess;
	};
	
	return $.extend(app, {
		stockTool : stockTool,
		editTool : editTool,
		sketchTool : sketchTool,
		init: init,
		viewInfo: function() {
			console.log("view.size: ", paper.view.size.toString());
			console.log("view.bounds: ", paper.view.bounds.toString());
			console.log("view.center: ", paper.view.center.toString());
			console.log("view.bounds.center: " + paper.view.bounds.center.toString());
			console.log("view bounds: ", paper.view.bounds);
		}
	});

}());
