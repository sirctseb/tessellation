/* Some tessellation definitions for testing and stuff */

var tessellationExamples = function() {
	var SquarePoly = new paper.Path.Rectangle([0,0],[100,100]);
	SquarePoly.strokeColor = '#ddd';
	SquarePoly.strokeWidth = 3;
	SquarePoly.remove();

	//var innerGroup44 = CreatePolyGroup();//Object.create(PolyGroup);
	var innerGroup44 = tessellationModel();
	innerGroup44.addPolygon(SquarePoly);
	innerGroup44.addTransform(new paper.Matrix());
	//var PolyGroup44 = CreatePolyGroup();//Object.create(PolyGroup);
	var PolyGroup44 = tessellationModel();
	//PolyGroup44.addLattice(Lattice.LatticeBy(new paper.Point([0,100]), new paper.Point([100,0])));
	PolyGroup44.addLattice(lattice({v1: new paper.Point([0,100]),
									v2: new paper.Point([100,0])}));
	PolyGroup44.addSubgroup(innerGroup44);
	PolyGroup44.addTransform(new paper.Matrix());

	var TrianglePoly = new paper.Path.RegularPolygon([50,50], 3, 50);
	TrianglePoly.strokeColor = '#ddd';
	TrianglePoly.strokeWidth = 3;
	TrianglePoly.remove();

	/*var innerGroupHex = CreatePolyGroup();
	innerGroupHex.addPolygon(TrianglePoly.clone());
	var rotGroupHex = CreatePolyGroup();
	//rotGroupHex.addTransform(Rotation.rotBy(60, TrianglePoly.firstSegment.point));
	rotGroupHex.addTransform(new paper.Matrix().rotate(60, TrianglePoly.firstSegment.point));
	rotGroupHex.addSubgroup(innerGroupHex);
	var latGroupHex = CreatePolyGroup();
	latGroupHex.addLattice(Lattice.LatticeBy(TrianglePoly.segments[1].point.subtract(TrianglePoly.segments[0].point),
											TrianglePoly.segments[2].point.subtract(TrianglePoly.segments[1].point)));
	latGroupHex.addSubgroup(rotGroupHex);*/

	// new formulation in a single group
	var latGroupHex = tessellationModel();
	latGroupHex.addPolygon(TrianglePoly);
	latGroupHex.addTransform(new paper.Matrix());
	latGroupHex.addTransform(new paper.Matrix().rotate(60, TrianglePoly.firstSegment.point));
	// TODO testing
	//for(var i = 10; i < 90; i+=10) {
	//	latGroupHex.addTransform(Rotation.rotBy(i));
	//}
	/*latGroupHex.addLattice(Lattice.LatticeBy(TrianglePoly.segments[1].point.subtract(TrianglePoly.segments[0].point),
											TrianglePoly.segments[2].point.subtract(TrianglePoly.segments[1].point)));*/
	latGroupHex.addLattice(lattice({v1:TrianglePoly.segments[1].point.subtract(TrianglePoly.segments[0].point),
									v2:TrianglePoly.segments[2].point.subtract(TrianglePoly.segments[1].point)}));
											
	//var hitTestGroup = CreatePolyGroup();
	var hitTestGroup = tessellationModel();
	hitTestGroup.addPolygon(TrianglePoly);
	// TODO write group with transforms so we can test hitPolygons
	hitTestGroup.addTransform(new paper.Matrix());
	hitTestGroup.addTransform(new paper.Matrix().rotate(60, TrianglePoly.firstSegment.point));
	hitTestGroup.addTransform(new paper.Matrix().rotate(120, TrianglePoly.firstSegment.point));
	hitTestGroup.addTransform(new paper.Matrix().rotate(180, TrianglePoly.firstSegment.point));

	// tessellation for wedding hearts
	//var heartGroup = CreatePolyGroup();
	var heartGroup = tessellationModel();
	/*heartGroup.addPolygon(SquarePoly);
	heartGroup.addTransform(new paper.Matrix().scale(1,-1, SquarePoly.position)
												//.rotate(180, SquarePoly.position)
												.translate(SquarePoly.bounds.width, 0)
											);
	heartGroup.addLattice(Lattice.LatticeBy(new paper.Point(SquarePoly.bounds.width * 2,0),
											new paper.Point(SquarePoly.bounds.width*0.5,SquarePoly.bounds.height)));
	log.log('heart lattice is reduced: ' + heartGroup.lattice.isReduced());*/

	var rectangle = new paper.Path.Rectangle([0,0], [50,100]);
	rectangle.strokeColor = "#ddd";
	rectangle.remove();
	var kcGroup = CreatePolyGroup();
	kcGroup.addPolygon(rectangle);
	kcGroup.addTransform(new paper.Matrix());
	kcGroup.addTransform(new paper.Matrix()
									.rotate(90, new paper.Point(rectangle.bounds.right, rectangle.bounds.bottom))
						);
	kcGroup.addTransform(new paper.Matrix()
									.rotate(180, new paper.Point(rectangle.bounds.right, rectangle.bounds.bottom))
						);
	kcGroup.addTransform(new paper.Matrix()
									.rotate(270, new paper.Point(rectangle.bounds.right, rectangle.bounds.bottom))
						);
	kcGroup.addLattice(Lattice.LatticeBy(new paper.Point(150, 0),
										new paper.Point(0,150)));
	/*kcGroup.addLattice(Lattice.LatticeBy(new paper.Point(0,100),
										new paper.Point(50,50)));*/

	return {
		//PolyGroup: PolyGroup,
		//Lattice: Lattice,
		PolyGroup44: PolyGroup44,
		GroupHex: latGroupHex,
		HitGroup: hitTestGroup,
		HeartGroup: heartGroup,
		KCGroup: kcGroup
	};
};