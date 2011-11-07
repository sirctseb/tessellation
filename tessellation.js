var paper; // for jslint
var tessellation = (function() {
	
	// TODO define actual tessellation object
	
	var tessObject = {};
	tessObject.tileToPaper = function(point, tile) {
		// TODO ignoring translation for now
		return point.add(tile);//.multiply(100);
	};
	tessObject.init44 = function(options) {
		// TODO create square grid lines and add to view
		var width = this.view.viewSize.width;
		var height = this.view.viewSize.height;
		
		// TODO should we do all this layer stuff in the app, and send it to tessellation?
		// save original active layer
		var origLayer = this.project.activeLayer;
		
		// create new layer for grid
		var gridLayer = new this.paper.Layer();
		
		// create path for grid
		var gridPath = new this.paper.Path([new this.paper.Point(0,1), new this.paper.Point(0,0), new this.paper.Point(1, 0)]);
		gridPath.strokeColor = options.gridColor;
		
		// create a symbol for the grid
		var gridSymbol = new this.paper.Symbol(gridPath);
		
		console.log("view.size: ", this.view.size.toString());
		console.log("view.bounds: ", this.view.bounds.toString());
		console.log("view.center: ", this.view.center.toString());
		console.log("view.bounds.center: " + this.view.bounds.center.toString());
		console.log("view bounds: ", this.view.bounds);
		
		
		// draw grid symbols in each tile
		var tileCenter = new this.paper.Point(0.505,0.505);
		for(var i = 0; i < width / 100; i++) {
			for(var j = 0; j < height / 100; j++) {
				//func(new paper.Point(i,j));
				gridSymbol.place(this.tileToPaper(tileCenter, new paper.Point(i,j)));
			}
		}
		
		// reactivate original layer
		origLayer.activate();
		
	};
	tessObject.addPath = function(path) {
		// TODO create symbol and place copies, put original back
	};
	tessObject.removePath = function() {
		// TODO anything?
	};
	tessObject.onResize = function() {
		// TODO recompute visible tiles & replace symbols
	};
	tessObject.onTranslate = function() {
		this.onResize();
	};
	tessObject.onZoom = function() {
		this.onResize();
	};
	tessObject.setOptions = function(options) {
		// TODO set options relating to symmetry, rotation, etc.
	};
	
	tessObject.setup = function(options) {
		// create a tessellation object
		var tess = Object.create(tessObject);
		// easy access to paperScope stuff
		tess.paper = paper;
		tess.view = paper.view;
		tess.project = paper.project;
		
		// setup based on options
		if(options.type == "{4,4}") {
			tess.type = options.type;
			tess.init44(options);
		}
		
		return tess;
	};
	
	return tessObject;
	
})();
