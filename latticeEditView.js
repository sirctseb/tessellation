/* a view class for lattice editing */
var latticeEditView = function(spec, my) {
	var that = {};
	var my = $.extend({ controller: spec.controller,
				tessellation: spec.tessellation,
				latticeEditLayer: spec.latticeEditLayer,
				selectedColor: 'blue'}, my);
	
	/** private variables **/

	// group for visible structures
	var display = null;

	// private method to produce the mouse handlers for the visible ojects
	var makeHandlers = function(tess, vecName) {

		var handlers = {
			mousedown: function(event) {
				display.fillColor = 'white';
				// set color to selected color
				this.fillColor = my.selectedColor;
				// notify of mouse down
				my.controller.onLatticeEditViewMouseDown();
			},
			mousedrag: function(event) {
				log.log('dragging ' + vecName, 'latticeDisplay');

				// update display
				// set the position of the handle
				this.position = this.position.add(event.delta);
				// set the end point of the line
				this.parent.children['line'].lastSegment.point = this.position;
				// notify controller
				my.controller.onLatticeEditViewMouseDrag({point: this.position, component: vecName});

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
	var constructor = function(component) {
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
			group.name = 'group' + vecName;

			// add group to display group
			display.addChild(group);

			// add handlers to elements
			handle.attach(makeHandlers(my.tessellation, vecName));
		});
		show(component);

		// reactive original layer
		oldLayer.activate();
	}

	var hide = function() {
		// remove display group
		display.remove();
	}
	var show = function(component) {
		// TODO make sure visible objects are up to date?
		// add display group back to lattice edit layer
		paper.project.layers[my.latticeEditLayer].addChild(display);

		// if a component was passed in, show the handle as selected
		if(component) {
			display.fillColor = 'white';
			display.children['group' + component].children['handle'].fillColor = my.selectedColor;
		}
	}

	// public methods
	that.hide = hide;
	that.show = show;

	// call constructor
	constructor(spec.component);

	return that;
};