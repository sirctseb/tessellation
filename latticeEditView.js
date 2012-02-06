/* a view class for lattice editing */
var latticeEditView = function(spec, my) {
	var that = {};
	var my = { controller: spec.controller,
				tessellation: spec.tessellation,
				latticeEditLayer: spec.latticeEditLayer};	
	
	/** private variables **/

	// group for visible structures
	var display = null;

	// private method to produce the mouse handlers for the visible ojects
	var makeHandlers = function(tess, vecName) {

		var selectedColor = 'blue';
		var handlers = {
			mousedown: function(event) {
				// set color to selected color
				this.fillColor = selectedColor;
				// notify of mouse down
				my.controller.onLatticeEditViewMouseDown();
			},
			mousedrag: function(event) {
				log.log('dragging ' + vecName, 'latticeDisplay');

				// update display
				// set the position of the handle
				// TODO testing differential translation so not everything is multiple of 0.5
				//this.position = event.point;
				this.position = this.position.add(event.delta);
				// set the end point of the line
				this.parent.children['line'].lastSegment.point = this.position;
				my.controller.onLatticeEditViewMouseDrag({point: this.position, component: vecName});
				/* // TODO these are done by the controller now via the above call
				// update lattice
				tess.lattice()[vecName](event.point);
				// redraw lattice
				tess.onLatticeChange(paper.view);
				*/

				// TODO update html UI
			},
			mouseup: function(event) {
				// reset fill color
				this.fillColor = 'white';
				// notify of mouse up
				my.controller.onLatticeEditViewMouseUp();
			}
		};
		return handlers;
	};

	// constructor
	var constructor = function() {
		// save old layer
		var oldLayer = paper.project.activeLayer;
		// activate lattice edit layer
		// TODO ensure the layer exists?
		paper.project.layers[my.latticeEditLayer].activate();

		var lattice = my.tessellation.lattice();
		display = new paper.Group();
		$.each(['v1', 'v2'], function(index, vecName) {
			// create display elements
			// draw line
			var line = new paper.Path(new paper.Point(), lattice[vecName]());
			line.name = 'line';
			// draw handle
			var handle = new paper.Path.Circle(lattice[vecName](), 3);
			handle.name = 'handle';
			handle.fillColor = 'white';
			// group to hold display elements
			var group = new paper.Group([line, handle]);
			group.strokeColor = 'blue';

			// add group to display group
			display.addChild(group);

			// add handlers to elements
			handle.attach(makeHandlers(my.tessellation, vecName));
		});

		// reactive original layer
		oldLayer.activate();
	}

	// call constructor
	constructor();

	// public methods
	that.hide = function() {
		// remove display group
		display.remove();
	}
	that.show = function() {
		// TODO make sure visible objects are up to date?
		// add display group back to lattice edit layer
		paper.project.layers[my.latticeEditLayer].addChild(display);
	}

	return that;
};