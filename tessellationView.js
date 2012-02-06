/* view class for displaying a full tessellation */
var tessellationView = function(spec, my) {

	var that = {};

	var my = { controller: spec.controller,
				tessellation: spec.tessellation };
	
	// private members
	var group = null,
		symbol = null,
		latticeGroup = null,
		subviews = [];
	

	var onResize = function(view) {
		// TODO if lattice exists
		recomputeLattice(view);
	};
	// TODO refactor
	var setRenderHead = function(head) {
		// pass command up to root
		if(my.parent) {
			my.parent.setRenderHead(head);
			return;
		}

		if(my.undo) {
			my.undo();
			my.undo = null;
		}

		// TODO lattice existence assumption
		// if head is not lattice, hide lattice group
		if(head !== null && head !== lattice) {
			latticeGroup.visible = false;
		}

		// null indicates draw full tessellation
		if(head === null) {
			latticeGroup.visible = true;
		}
		// if head is this polygroup (stamp), place one instance of the outer group
		if(head === that) {
			// TODO which layer?
			my.currentRender = new paper.Group();
			my.currentRender.addChild(symbol.place());
			// TODO we should probably just add the existing group to a layer to make it visible
			// TODO it would make interaction easier too probably
			my.undo = function() {
				my.currentRender.remove();
			}
		}
		// if head is the lattice, make it visible
		if(head === lattice) {
			// make lattice group visible
			latticeGroup.visible = true;
			// TODO show lattice arrows
		}
		// if head is the set of polygons
		if(head === polygons) {
			my.currentRender = new paper.Group();
			my.currentRender.addChild(symbol.place());
			// color code the polygons
			// TODO color code better than random
			// TODO color code html elements
			$.each(polygons, function(index, polygon) {
				polygon.strokeColor = new paper.RgbColor(Math.random(), Math.random(), Math.random());
			});
			// define function to undo changes
			my.undo = function() {
				$.each(polygons, function(index, polygon) {
					// TODO magic constant
					polygon.strokeColor = '#ddd';
				});
				my.currentRender.remove();
			}
		}
		// if head is a single local polygon
		if($.inArray(head, polygons) >= 0) {
			var parent = head.parent;
			// define function to undo changes
			my.undo = function() {
				parent.addChild(head);
			}
			paper.project.activeLayer.addChild(head);
		}
	};

	var recomputeLattice = function(view) {
		// TODO there is probably a better way to do this

		if(my.tessellation.lattice()) {

			//var that = this;
			var lastPlacement = my.placement;
			
			// get lattice points in rectangle
			rect = view.bounds;
			// get lattice point closest to middle of rect
			var closest = my.tessellation.lattice().closestTo(rect.center);
			// search for lattice points where symbol placement would be visible
			var toCheck = [closest.coefs];
			// TODO need to get symbol from group without lattice
			var newPlacement = searchVisibleLattice(toCheck, symbol, rect, null);
			// TODO debugging empty placement problem
			if(newPlacement.visible.length === 0) {
				console.log("something went very wrong");
				closest = my.tessellation.lattice().closestTo(rect.center);
			}

			// compare new placment and old placement
			// draw at locations in new placement but not in old
			// remove locations in old but not in new
			$.each(newPlacement.checked, function(coef, visible) {
				if(visible) {
					if(!lastPlacement.checked[coef]) {
						// new point visible, place and add to lattice group
						latticeGroup.addChild(symbol.place(my.tessellation.lattice().getPoint(visible)));
						// name child
						latticeGroup.lastChild.name = coef;
						// also place content symbol and set as sister of original
						latticeGroup.lastChild.sister = symbol.sister.place(my.tessellation.lattice().getPoint(visible));
					}
				}
			});
			$.each(lastPlacement.checked, function(coef, visible) {
				if(visible) {
					if(!newPlacement.checked[coef]) {
						// also remove content symbol
						latticeGroup.children[coef].sister.remove();
						// newly not-visible point: remove
						latticeGroup.children[coef].remove();
					}
				}
			});
			my.placement = newPlacement;
		}
	};
	var onLatticeChange = function(view) {
		// update placements
		var i = 0;
		$.each(my.placement.checked, function(coef, visible) {
			if(visible) {
				latticeGroup.children[coef].matrix.setToTranslation(my.tessellation.lattice().getPoint(visible));
				// also update content symbol
				latticeGroup.children[coef].sister.matrix.setToTranslation(my.tessellation.lattice().getPoint(visible));
				i++;
			}
		});
		recomputeLattice(view);
		view.draw();
		return;

		//var that = this;
		// remove all placements
		$.each(my.placement.checked, function(coef, visible) {
			if(visible) {
				latticeGroup.children[coef].remove();
			}
		});
		// redo lattice placement
		if(latticeGroup) {
			latticeGroup.remove();
		}
		doInitialLatticePlacement(view);
		view.draw();
	};
	var doInitialLatticePlacement = function(view) {
		//var symbol = symbol;
		// create a group for the lattice which will become the outer group
		latticeGroup = new paper.Group();
		
		// get lattice points in rectangle
		var rect = view.bounds;
		// get lattice point closest to middle of rectangle
		var closest = my.tessellation.lattice().closestTo(rect.center);
		// search for lattice points where symbol placement would be visible
		var toCheck = [closest.coefs];
		var placement = searchVisibleLattice(toCheck, symbol, rect, latticeGroup);
		my.latticePoints = placement.visible;
		
		// place symbols at the visible points
		//$.each(this.latticePoints, function(index, point) {
			// TODO set child's name based on the coef values so that we can remove it later
			//latticeGroup.addChild(symbol.place(point));
		//});
		// TODO replacing above loop with loop over coefs so that we can store name
		//var that = this;
		$.each(placement.checked, function(coef, visible) {
			if(visible) {

				latticeGroup.addChild(symbol.place(my.tessellation.lattice().getPoint(visible)));
				// name child
				latticeGroup.lastChild.name = coef;
				//console.log('name label: ' + latticeGroup.children[coef].label);

				// also place an instance of the sister symbol and set as sister of original placement
				paper.project.layers[1].addChild(symbol.sister.place(my.tessellation.lattice().getPoint(visible)));
				latticeGroup.lastChild.sister = paper.project.layers[1].lastChild;
			}
		});
		
		/* // TODO these were the last remaining statements from a series of commented lines. they do nothing
		// update the outer group to be the lattice group
		var outerGroup = latticeGroup;
		// store group and symbol on this
		// TODO this is clobbered in render
		latticeGroup = outerGroup;*/
		
		// store placement info for resizing
		my.placement = placement;
	};
	// return {'visible': the list of lattice locations where the placed symbol bounds intersect the supplied rectangle,
	//			'checked': an object with an attribute for every coefficient pair that was checked. the value is true iff
	//						the symbol placement at the corresponding location is visible }
	var searchVisibleLattice = function(toCheck, symbol, rectangle, group) {
		// create a symbol placement to test with
		var placement = symbol.place();
		// visible is the master list of actual project coordinate locations of visible lattice points
		var visible = [];
		// checked has an attribute for every lattice coefficient pair that has been searched
		var checked = {};
		var coefs;
		// addNeighbors is a function for adding neighbors to the search queue
		var addNeighbors = function(index, neighbor) {
			// produce the actual coefficients
			var newPoint = neighbor.add(coefs);
			if(!checked.hasOwnProperty(newPoint.toString())) {
				// if not yet checked, add to search queue
				toCheck.push(newPoint);
				// mark as checked so it won't be added again
				// the actual truth value will be set when it is examined
				checked[newPoint.toString()] = false;
			}
		};
		while(toCheck.length > 0) {
			// search at the first point in toCheck
			coefs = toCheck.shift();
			// get lattice point
			var location = my.tessellation.lattice().getPoint(coefs);
			// set translation of placement
			// TODO this could possible be imprecise
			placement.translate(location);
			// test if placement intersects rectangle
			if(placement.bounds.intersects(rectangle)) {
				// if so, mark as visible
				visible.push(location);
				// put in checked object
				checked[coefs.toString()] = coefs;
				// add neighbors to search queue
				var neighbors = [
					new paper.Point(-1,-1), new paper.Point(0,-1), new paper.Point(1,-1),
					new paper.Point(-1, 0),						new paper.Point(1, 0),
					new paper.Point(-1, 1), new paper.Point(0, 1), new paper.Point(1, 1)
				];
				$.each(neighbors, addNeighbors);
			} else {
				// set value in checked object
				checked[coefs.toString()] = false;
			}
			// undo placement translation
			placement.translate(location.negate());
		}
		
		// remove test placement
		placement.remove();
		
		return {'visible': visible, 'checked': checked};
		
	};
	// render in a view
	// this is more like construct
	var render = function(view) {
		// if the symbol for this view's tessellation is already defined, return it
		if(symbol) {
			return symbol;
		}
		
		// reduce the lattice basis if there is a lattice
		if(my.tessellation.lattice() && !my.tessellation.lattice().isReduced()) {
			my.tessellation.lattice().reduceBasis();
		}
		
		// get the group with the subgroups and local symbol placements
		var innerSymbol = getInnerGroup(view);
		
		// place inner symbol into main polygroup group
		//var outerGroup = new paper.Group([innerSymbol.place()]);
		var outerGroup = new paper.Group();

		// group for holding the placements of the sister symbol
		var sisterGroup = new paper.Group([innerSymbol.sister.place()]);

		//var that = this;
		
		// if PG has transforms, make a copy of inner group for each and apply transform
		if(my.tessellation.transforms().length > 0) {
			
			// parse transforms and apply operations
			$.each(my.tessellation.transforms(), function(index, transform) {
				
				// add transformed placed inner symbol into group 
				outerGroup.addChild(innerSymbol.place().transform(transform));

				// add transformed placed inner symbol sister into sister group
				sisterGroup.addChild(innerSymbol.sister.place().transform(transform));
			});
		}
		
		// make symbol from outer group
		var outerSymbol = outerGroup.symbolize();

		symbol = outerSymbol;

		// make symbol for sister group
		outerSymbol.sister = sisterGroup.symbolize();
		
		// if there is a lattice defined, copy this group to each point
		if(my.tessellation.lattice()) {
			// place symbols at visible lattice points
			doInitialLatticePlacement(view);
			
		} else {
			// if there is no lattice, place one instance of the symbol for this group
			// TODO my.tessellation.parent?
			if(!my.parent) {
				outerSymbol.place();
				// also place one instance of the sister symbol
				outerSymbol.sister.place();
			}
		}
		
		// store group and symbol on this
		group = outerGroup;
		symbol = outerSymbol;

		return symbol;
	};
	var getInnerGroup = function(view) {
		
		// get inner groups from subgroups
		var innerGroups = [];
		$.each(my.tessellation.subgroups(), function(index, group) {
			// create view for subgroup
			var subview = tessellationView({controller:my.controller, tessellation: group});
			subviews.push(subview);
			// get subgroup symbol
			var subsymbol = subview.render(view);
			// place symbol and put into group
			innerGroups.push(subsymbol.place());
		});

		// create inner group
		var group = new paper.Group(innerGroups.concat(my.tessellation.polygons()));
		// make symbol from group
		groupSymbol = group.symbolize();

		// create a group & symbol for paths drawn into this group's polygons
		var sisterInner = innerGroups.map(function(group) { return group.sister; });
		group.sister = (sisterInner.length > 0) ? new paper.Group(sisterInner) : new paper.Group();
		groupSymbol.sister = group.sister.symbolize();

		// return symbol
		return groupSymbol;
	};
	var addPath = function(path,layer) {
		
		// find polygon the new path hits
		var hitInfo = findPolygonAt(path.firstSegment.point);
		
		if(hitInfo) {
			// create a symbol of the path
			// save original position before creating symbol
			var pathSymbol = path.symbolize();
			// add the path back to active layer
			paper.project.activeLayer.addChild(path);
			// add path to the group where the matching polygon is
			hitInfo.polygon.parent.sister.addChild(pathSymbol.place().transform(hitInfo.transform.createInverse()));
			// add the path to the model
			hitInfo.polygon.contents = hitInfo.polygon.contents || [];
			// TODO should we store the transform? it could be computed again just by doing findPolygonAt again.
			// but not necessarily if it is moved in the mean time
			hitInfo.polygon.contents.push({path: path, transform: hitInfo.transform});
			// make path selected
			path.selected = true;
		}
	};
	var findPolygonAt = function(point) {
		return hitPolygons(point);
	};
	var hitPolygons = function(point) {
		//var that = this;
		
		var hit = false;
		var hitInfo = null;
		
		if(my.latticePoints.length > 0) {
			$.each(my.latticePoints, function(index, latticePoint) {
				// translate by -latticePoint to search within this portion of the lattice
				var curPoint = point.subtract(latticePoint);
				
				// check this groups for hits at the lattice point adjusted point
				hitInfo = hitPolygonGlobal(curPoint);
				
				// if hit, return from latticePoint loop after
				// updating transform with the lattice translation
				if(hitInfo) {
					hit = true;
					// pre translate by lattice point
					hitInfo.transform.preConcatenate(paper.Matrix.getTranslateInstance(latticePoint.x, latticePoint.y));
					return false;
				}
			});
		} else {
			// if no lattice, just do test at given point
			hitInfo = hitPolygonGlobal(point);
		}
		
		return hitInfo;
	};
	// hitPolygon helper function:
	// check for hits in this group at a supplied global point
	var hitPolygonGlobal = function(point) {
		//var that = this;
		
		// check local polygons and subgroups with no transforms applied
		var hitInfo = hitPolygonLocal(point);
		// if hit, return. don't need to update transform because none was applied here
		if(hitInfo) {
			return hitInfo;
		}
		
		var hit = false;
		
		// perform reverse transforms to check local polygons and subgroups
		$.each(my.tessellation.transforms(), function(index, transform) {
			var localPoint = transform.inverseTransform(point);
			
			// do local checks
			hitInfo = hitPolygonLocal(localPoint);
			// if hit, update transformation with local transform and return
			if(hitInfo) {
				hit = true;
				hitInfo.transform.preConcatenate(transform);
				return false;
			}
		});
		
		// if we found a hit, return the hit polygon
		if(hit) {
			return hitInfo;
		}
	};
	// hitPolygon helper function:
	// check local polygons and subgroups for hits at a point in local coords
	// TODO local is actually sublocal because a transformation (maybe identity) has been applied
	// TODO the solution is to not have transforms in a group applied to polygons in the group
	var hitPolygonLocal = function(point) {
		var hit = false;
		var hitInfo = null;
		
		// check against local polygons
		$.each(my.tessellation.polygons(), function(index, polygon) {
			if(polygon.contains(point)) {
				hit = true;
				hitInfo = {
					polygon: polygon,
					transform: new paper.Matrix()
				};
				return false;
			}
		});
		
		// if we hit a local polygon, return
		if(hit) {
			return hitInfo;
		}
		
		// if no local polygon hits, recurse into subgroups
		//$.each(my.subgroups, function(index, subgroup) {
		$.each(subviews, function(index, subview) {
			//var subHitInfo = subgroup.hitPolygons(point);
			var subHitInfo = subview.hitPolygons(point);
			if(subHitInfo) {
				hit = true;
				hitInfo = subHitInfo;
				return false;
			}
		});
		
		return hitInfo;
	};

	// public methods
	that.hitPolygonLocal = hitPolygonLocal; // shouldn't really be super public, only to this class
	that.onResize = onResize;
	that.render = render;
	that.onLatticeChange = onLatticeChange;
	that.addPath = addPath;

	return that;
};