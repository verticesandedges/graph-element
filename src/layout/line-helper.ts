import * as three from 'three/build/three.module';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';

import { Vertex, VertexId, VertexOptions } from './scene-vertex';
import { Edge, EdgeId, EdgeOptions } from './scene-edge';
import { Graph } from './scene-graph';
/**
 * class LineHelper
 * 
 * The LineHelper class features 2 groups of 4 each static methods: 
 * generate{Line,Spline,Arrow,Splarrow}, and update{Line,Arrow,Spline,Splarrow},
 * which assist in drawing edges.
 * 
 * The generate functions return a ThreeJS Group, which needs to be added to the scene. 
 * The update functions update a group according to its .userData.edge properties.
 */
export class LineHelper {

  //#region generate functions

  /**
   * @name generateLine
   * Generates a simple line edge.
   * 
   * @param (LayoutVertex) from 
   * @param (LayoutVertex) to
   * @param (object) options 
   * 
   * @returns a three.Group object for reference by Edge objects.
   */
  static generateLine( from: Vertex, to: Vertex, options: EdgeOptions ): three.Group {
    const group = new three.Group();
    group.name = 'edge-line';

    const geometry = new LineGeometry();
    geometry.setFromPoints([ from.position, to.position ]);

    const material = new LineMaterial({
      color: options.color,
      linewidth: options.width
    });

    const line = new Line2( geometry, material );
    line.name = 'line';

    group.add( line );

    return group;
  }

  /**
   * @name generateSpline
   * Generates a spline curve.
   * 
   * @param (LayoutVertex) from 
   * @param (LayoutVertex) to
   * @param (object) options 
   * @param (Graph) graph
   * 
   * @returns three.Group
   */
  static generateSpline( from: Vertex, to: Vertex, options: EdgeOptions, graph: Graph ): three.Group {
    const group = new three.Group();
    group.name = 'edge-spline';
    
    // dynamicMatching.addVertex returns ids
    const stopA: VertexId = graph.dynamicMatching.addVertex();
    const stopB: VertexId = graph.dynamicMatching.addVertex();

    const stops = [
      graph.dynamicMatching.getVertex(stopA)!.position,
      graph.dynamicMatching.getVertex(stopB)!.position,
    ]

    const edgeFromA = graph.dynamicMatching.addEdge(Edge.id(), from.id, stopA, 1.0);
    const edgeAB    = graph.dynamicMatching.addEdge(Edge.id(), stopA, stopB, 1.0);
    const edgeBTo   = graph.dynamicMatching.addEdge(Edge.id(), stopB, to.id, 1.0);

    const curve = new three.CatmullRomCurve3([ from.position, ...stops, to.position ], false, 'centripetal', 0.1);

    const geometry = new LineGeometry();
    const points = curve.getPoints( 20 );
    geometry.setFromPoints(points);
    const material = new LineMaterial({
      color: options.color,
      linewidth: options.width
    })
    const line = new Line2( geometry, material );
    line.name = 'spline'; // todo search for line
    
    group.add( line );
    group.userData.stops = [stopA, stopB];
    group.userData.segments = [edgeFromA, edgeAB, edgeBTo];
    
    return group;
  }

  /**
   * @name generateArrow
   * Generates an arrow edge.
   * 
   * @param (LayoutVertex) from 
   * @param (LayoutVertex) to
   * @param (object) options 
   */
  static generateArrow( from: Vertex, to: Vertex, options: EdgeOptions ): three.Group {
    const group = new three.Group();
    group.name = 'edge-arrow';

    // create line
    const lineGeo = new LineGeometry();
    lineGeo.setFromPoints([ from.position, to.position ]);
    const lineMat = new LineMaterial({
      color: options.color,
      linewidth: options.width
    });
    const line = new Line2( lineGeo, lineMat );
    line.name = 'line';

    // create cone
    // const coneGeo = new three.CylinderGeometry(0, 0.5, 1);
    const coneGeo = new three.CylinderGeometry( 0, 0.2, 0.7);
    coneGeo.translate( 0, -1.0, 0 );
    coneGeo.rotateX(- Math.PI / 2);
    const coneMat = new three.MeshBasicMaterial({
      color: options.color,
      toneMapped: false
    });
    const cone = new three.Mesh( coneGeo, coneMat );
    cone.name = 'cone';

    group.add(line);
    group.add(cone);
    //cone.rotateY(Math.PI/2)

    return group;
  }

  /**
   * @name generateSplarrow
   * Creates a spline arrow.
   * 
   * @param {*} from 
   * @param {*} to 
   * @param {*} options 
   * @param {*} graph 
   * @returns 
   */
  static generateSplarrow( from: Vertex, to: Vertex, options: EdgeOptions, graph: Graph ): three.Group {
    const group = new three.Group();
    group.name = 'edge-splarrow';

    // line geometry & material
    const stopA = graph.dynamicMatching.addVertex();
    const stopB = graph.dynamicMatching.addVertex();
    const stops = [
      graph.dynamicMatching.getVertex(stopA)!.position,
      graph.dynamicMatching.getVertex(stopB)!.position
    ];

    const edgeFromA = graph.dynamicMatching.addEdge(Edge.id(), from.id, stopA);
    const edgeAB = graph.dynamicMatching.addEdge(Edge.id(), stopA, stopB);
    const edgeBTo = graph.dynamicMatching.addEdge(Edge.id(), stopB, to.id);

    const curve = new three.CatmullRomCurve3([ from.position, ...stops, to.position], false, 'centripetal', 0.1);
    const splineGeo = new LineGeometry();
    const points = curve.getPoints(20);
    splineGeo.setFromPoints( points );

    const splineMat = new LineMaterial({
      color: options.color,
      linewidth: options.width
    });
    const spline = new Line2( splineGeo, splineMat );
    spline.name = 'spline';

    // cone geometry & material
    const coneGeo = new three.CylinderGeometry( 0, 0.2, 0.7 );
    coneGeo.translate( 0, -1.0, 0 );
    coneGeo.rotateX( -Math.PI / 2 );
    const coneMat = new three.MeshBasicMaterial({
      color: options.color,
      toneMapped: false
    });
    const cone = new three.Mesh( coneGeo, coneMat );
    cone.name = 'cone';

    group.add(spline);
    group.userData.stops = [stopA, stopB];
    group.userData.segments = [edgeFromA, edgeAB, edgeBTo];
    group.add(cone);

    return group;
  }

  //#endregion

  //#region update functions

  /**
   * @name updateArrow
   * 
   * @param {three.Group} group 
   * @param {LayoutVertex} from 
   * @param {LayoutVertex} to 
   */
  static updateArrow( group: three.Group, from: Vertex, to: Vertex ): void {
    const line = group.getObjectByName('line') as Line2;
    const cone = group.getObjectByName('cone');

    line.geometry.setFromPoints([ from.pos, to.pos ]);
    cone!.position.copy( to.pos );
    cone!.lookAt( from.pos );
    // line.geometry.needsUpdate = true;
    line.geometry.attributes.instanceStart.needsUpdate = true;
    line.geometry.attributes.instanceEnd.needsUpdate = true;
  }

  /**
   * @name updateLine
   * 
   * @param {three.Group} group 
   * @param {LayoutVertex} from 
   * @param {LayoutVertex} to 
   */
  static updateLine( group: three.Group, from: Vertex, to: Vertex ): void {
    const line = group.getObjectByName('line') as Line2;
    line.geometry.setFromPoints( [ from.pos, to.pos ] );
    // line.geometry.needsUpdate = true;
    line.geometry.attributes.instanceStart.needsUpdate = true;
    line.geometry.attributes.instanceEnd.needsUpdate = true;
  }

  /**
   * @name updateSpline
   * 
   * @param {three.Group} group 
   * @param {LayoutVertex} from 
   * @param {LayoutVertex} to 
   * @param {Graph} graph
   */
  static updateSpline( group: three.Group, from: Vertex, to: Vertex, graph: Graph ): void {
    const spline = group.getObjectByName('spline') as Line2;

    const stops = group.userData.stops.map(id => {
      return graph.dynamicMatching.getVertex(id)!.position
    });

    const curve = new three.CatmullRomCurve3([ from.pos, ...stops, to.pos ], false, 'centripetal', 0.1);

    spline!.geometry.setFromPoints(curve.getPoints( 20 ));
    // spline!.geometry.needsUpdate = true;
    spline.geometry.attributes.instanceStart.needsUpdate = true;
    spline.geometry.attributes.instanceEnd.needsUpdate = true;
  }

  /**
   * @name updateSplarrow
   * 
   * @param {three.Group} group 
   * @param {LayoutVertex} from 
   * @param {LayoutVertex} to 
   * @param {Graph} graph 
   * 
   * @
   */
  static updateSplarrow( group: three.Group, from: Vertex, to: Vertex, graph: Graph ): void {
    const spline = group.getObjectByName('spline') as Line2;

    const stops = group.userData.stops.map(id => {
      return graph.dynamicMatching.getVertex(id)!.position
    });
    const curve = new three.CatmullRomCurve3([ from.pos, ...stops, to.pos ], false, 'centripetal', 0.1);
    spline.geometry.setFromPoints(curve.getPoints(20));
    // spline.geometry.needsUpdate = true;
    spline.geometry.attributes.instanceStart.needsUpdate = true;
    spline.geometry.attributes.instanceEnd.needsUpdate = true;

    const cone = group.getObjectByName('cone');
    cone!.position.copy(to.pos);
    cone!.lookAt(stops.at(-1));
  }

  //#endregion
}
