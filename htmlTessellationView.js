/* a view class to display the structure of a tessellation in html */

var htmlTessellationView = function(spec) {

	var that = {};

	var my =	{ controller: spec.controller,
				  tessellation: spec.tessellation};

	// some main elements
	log.enable("lattUIEvents");

	// tessellation root
	var root = $("<div></div>", {"class": "tessDefUI collapsable tessSection tessUI"});

	// label for root
	var stampHead = $("<div></div>", {"class": "tessHeader", text:"Stamp"}).appendTo(root);

	// lattice section
	var latticeHead = null;
	if(my.tessellation.lattice()) {
		// create container for lattice info
		latticeHead = $("<div></div>", {"class": "latticeHead collapsable tessSection tessUI"}).appendTo(root);
	}

	// polygon section
	var polyHead = $("<div/>", {"class": "tessSection tessUI polyHead collapsable"}).appendTo(root);

	// substructure section
	var substructureHead = $("<div/>", {"class": "tessSection tessUI substructureHead collapsable"}).appendTo(root);
	var subgroupViews = [];

	// transform section
	var transformHead = $("<div/>", {"class": "tessSection tessUI transformHead collapsable"}).appendTo(root);

	// add click handler to stamp header
	// header click handler to set tess as render head
	stampHead.click(function(event) {
		// toggle the selected state, if it is now selected, set this as render head, otherwise, set lattice
		my.tessellation.setRenderHead($(this).toggleClass("selected").hasClass("selected") ? my.tessellation : null);
		// take selected state off any other selected item
		$(".selected").not($(this)).removeClass("selected");
		paper.view.draw();
		return false;
	});

	// add lattice info
	if(my.tessellation.lattice()) {
		// create container for lattice info
		latticeHead.append($("<div></div>", {"class": "tessHeader", text:"Lattice"})
			// lattice click handler to set lattice as render head
			.click(function(event) {
				my.tessellation.setRenderHead(my.tessellation.lattice());
				paper.view.draw();
				return false;
			})
		);

		// create lattice info
		// TODO jquery doesn't seem to like content text and properties passed in through an object
		var v1 = $("<div/>", {"class": "latticeVec tessUI", text: my.tessellation.lattice().v1().toString()}).appendTo(latticeHead);
		var v2 = $("<div/>", {"class": "latticeVec tessUI", text: my.tessellation.lattice().v2().toString()}).appendTo(latticeHead);
		// add edit buttons to edit text directly
		// TODO handlers and text editing
		v1.append($("<div/>", {"class": "editButton", text: "edit"}));
		v2.append($("<div/>", {"class": "editButton", text: "edit"}));
	}

	// add polygon info
	polyHead.append($("<div/>", {"class": "tessHeader", text:"Shapes (" + my.tessellation.polygons().length + ")"})
		// click handler to show polygon info
		.click(function(event) {
			// toggle the selected state, if it is now selected, set this as render head, otherwise, set lattice
			my.tessellation.setRenderHead($(this).toggleClass("selected").hasClass("selected") ? my.tessellation.polygons() : null);
			// take selected state off any other selected item
			$(".selected").not($(this)).removeClass("selected");
			//tess.setRenderHead(tess.polygons());
			paper.view.draw();
			return false;
		})
	);
	// add polygons
	$.each(my.tessellation.polygons(), function(index, polygon) {
		// create an entry
		$("<div/>", {"class": "polyEntry tessUI collapsable", text: polygon.toString()}).appendTo(polyHead)
		.click(function(event) {
			my.tessellation.setRenderHead(polygon);
			paper.view.draw();
			return false;
		});
	});
	// add polygon entry
	$("<div/>", {"class": "addPolyEntry tessUI", text: "Add new shape"}).appendTo(polyHead);

	// add substructure info
	substructureHead.append($("<div/>", {"class": "tessHeader", text: "Substamps (" + my.tessellation.subgroups().length + ")"})
						.click(function(event) {
							my.tessellation.setRenderHead(my.tessellation.subgroups());
							paper.view.draw();
							return false;
						})
	);
	// add subgroup views
	$.each(my.tessellation.subgroups(), function(index, subgroup) {
		//subgroup.generateUI().appendTo(substructureHead);
		// create view for subgroup
		subgroupViews.push(htmlTessellationView({controller:my.controller, tessellation: subgroup}));
		// add subgroup root to this view
		subgroupViews[subgroupViews.length-1].root().appendTo(substructureHead);
	});

	// add transformation info	
	transformHead.append($("<div/>", {"class": "tessHeader", text: "Placements (" + my.tessellation.transforms().length + ")"})
						.click(function(event) {
							my.tessellation.setRenderHead(my.tessellation.transforms());
							paper.view.draw();
							return false;
						})
	);
	// add trasnform UI's
	$.each(my.tessellation.transforms(), function(index, transform) {
		$("<div/>", {"class": "tessUI transform", text: transform.toString()}).appendTo(transformHead)
		.click(function(event) {
			my.tessellation.setRenderHead(transform);
			paper.view.draw();
			return false;
		})
	});

	// add collapse arrows
	$(".tessHeader", root).before($("<div/>", {"class": "collapseArrow"}));

	// accessors
	that.root = function() {
		return root;
	}

	return that;
};