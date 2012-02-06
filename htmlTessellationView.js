/* a view class to display the structure of a tessellation in html */
log.enable("vectorEdit");
var htmlTessellationView = function(spec) {

	var that = {};

	var my =	{ controller: spec.controller,
				  tessellation: spec.tessellation};

	// private members
	// some main elements
	var root,
		stampHead,
		latticeHead,
		polyHead,
		substructureHead,
		subgroupViews,
		transformHead;
	// lattice subview
	var latticeView;
	
	var construct = function() {

		log.enable("lattUIEvents");

		// tessellation root
		root = $("<div></div>", {"class": "tessDefUI collapsable tessSection tessUI"});

		// label for root
		stampHead = $("<div></div>", {"class": "tessHeader", text:"Stamp"}).appendTo(root);

		// lattice section
		latticeView = htmlLatticeView({controller: my.controller,
										tessellation: my.tessellation,
										superview: that});
		latticeHead = latticeView.root().appendTo(root);

		// polygon section
		polyHead = $("<div/>", {"class": "tessSection tessUI polyHead collapsable"}).appendTo(root);

		// substructure section
		substructureHead = $("<div/>", {"class": "tessSection tessUI substructureHead collapsable"}).appendTo(root);
		subgroupViews = [];

		// transform section
		transformHead = $("<div/>", {"class": "tessSection tessUI transformHead collapsable"}).appendTo(root);

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
	};
	// call constructor
	construct();

	// update lattice display
	var onLatticeChange = function() {
		// pass event to lattice subview
		latticeView.onLatticeChange();
	}

	// public methods
	that.onLatticeChange = onLatticeChange;

	// accessors
	that.root = function() {
		return root;
	}

	return that;
};

/* class for lattice subview */
var htmlLatticeView = function(spec, my) {
	var that = {};
	my = { controller: spec.controller,
			tessellation: spec.tessellation,
			superview: spec.superview };

	// private members
	var latticeHead,
		v1display,
		v2display; // TODO contain all vector displays in these outer divs
	var vdisplays;

	var construct = function() {
		// add lattice info
		if(my.tessellation.lattice()) {
			// create container for lattice info
			latticeHead = $("<div></div>", {"class": "latticeHead collapsable tessSection tessUI"});
			// create container for lattice info
			latticeHead.append($("<div></div>", {"class": "tessHeader", text:"Lattice"})
				// lattice click handler to set lattice as render head
				.click(function(event) {
					my.tessellation.setRenderHead(my.tessellation.lattice());
					paper.view.draw();
					return false;
				})
			);
			v1display = $("<div/>", {"class": "tessUI v1display vdisplay"}).appendTo(latticeHead);
			v2display = $("<div/>", {"class": "tessUI v2display vdisplay"}).appendTo(latticeHead);
			vdisplays = {v1: v1display, v2: v2display};

			addDefaultVectorView(["v1"]);
			addEditVectorView("v1");
			addDefaultVectorView(["v2"]);
			addEditVectorView("v2");
			cancelEditVector();

			// register for click away event
			focus.register(latticeHead, onClickAway);
		}
	};

	var onLatticeChange = function() {
		// TODO get fresh tessellation from controller?
		var vecs = ["v1", "v2"];
		$(".latticeVec", latticeHead).each(function(index) {
			$(this).text(my.tessellation.lattice()[vecs[index]]().toString());
		});
	}
	var addDefaultVectorView = function(components) {
		components = components || ["v1", "v2"];

		$.each(components, function(index, component) {
			// create text display
			$("<div/>", {"class": "latticeVec " + component+"default", text: my.tessellation.lattice()[component]().prettyPrint()})
			// add to head
			.appendTo(vdisplays[component])
			// add edit button
			.before($("<div/>", {"class": "editButton " + component+"default", text: "edit"})
						.click(
							function(event) {
								log.log("edit button clicked", "vectorEdit");
								editVector(component);
							}
						)
					);
		});
	};
	var addEditVectorView = function(component) {
		// TODO add submit on enter
		log.log("adding edit vector view", "vectorEdit");

		var editClass = component+"edit";
		// append everything to vector display
		vdisplays[component]
		// add submit button
		.append($("<div/>", {"class": "vecEditSubmit " + editClass, text: "submit"})
						.click(function(event) {finishEditVector(component);}))
		// create first label // TODO make actual label
		.append($("<label/>", {"class": "vecEditLabel " + editClass, text: "x: ", "for": component+"xEdit"}))
		// add first text box
		.append($("<input/>", {"class": "vecEditField " + editClass,
								type: "text",
								value: my.tessellation.lattice()[component]().x.toFixed(2),
								id: component+"xEdit"}))
		// add second label // TODO make actual label
		.append($("<label/>", {"class": "vecEditLabel " + editClass, text: "y: ", "for": component+"yEdit"}))
		// add second text box
		.append($("<input/>", {"class": "vecEditField " + editClass,
								type: "text",
								value: my.tessellation.lattice()[component]().y.toFixed(2),
								id: component+"yEdit"}));
	};
	var updateFieldValues = function() {
		var v1 = my.tessellation.lattice().v1();
		var v2 = my.tessellation.lattice().v2();
		$("#v1xEdit", latticeHead).val(v1.x.toFixed(2));
		$("#v1yEdit", latticeHead).val(v1.y.toFixed(2));
		$("#v2xEdit", latticeHead).val(v2.x.toFixed(2));
		$("#v2yEdit", latticeHead).val(v2.y.toFixed(2));
	}
	var editVector = function(vec) {
		log.log("starting edit vector", "vectorEdit");

		// update field values because they aren't made fresh anymore
		updateFieldValues();

		// show text boxes and labels and submit button
		if(vec === "v1") {
			// show edit view for v1 and default view for v2
			$(".v1edit, .v2default", latticeHead).show();
			$(".v1default, .v2edit", latticeHead).hide();
		} else if(vec === "v2") {
			// show edit view for v2 and default view for v1
			$(".v2edit, .v1default", latticeHead).show();
			$(".v2default, .v1edit", latticeHead).hide();
		}
	};
	var finishEditVector = function(component) {
		var value = {};
		value[component] = new paper.Point(parseFloat($("#xEdit", latticeHead).val()),
											parseFloat($("#yEdit", latticeHead).val()));
		// send value to controller
		my.controller.setLatticeValues(
			 value
		);

		// put default displays back
		cancelEditVector();
	};
	var cancelEditVector = function() {
		log.log("cancel", "vectorEdit");

		// hide edit views and show default views
		$(".v1edit, .v2edit", latticeHead).hide();
		$(".v1default, .v2default", latticeHead).show();
	}
	var onClickAway = function() {
		// TODO test if we are currently in edit state before resetting view
		cancelEditVector();
	}

	// public methods
	that.onLatticeChange = onLatticeChange;

	// accessors
	that.root = function() {
		return latticeHead;
	};

	construct();

	return that;
};