/*
  layout.mjs
  
  Joshua M. Moore (2026)
  joshua.moore@verticesandedges.net


*/

import * as three from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SelectionBox } from "three/examples/jsm/interactive/SelectionBox.js";
import { SelectionHelper } from "three/examples/jsm/interactive/SelectionHelper.js";

import { Constants, DynamicMatching } from "./dynamic-matching.ts";
import { Vertex, type VertexId, type VertexOptions } from "./scene-vertex.ts";
import { Edge, type EdgeId, type EdgeOptions } from "./scene-edge.ts";

const wait = async function(delay: number){
  return new Promise((resolve, reject) => setTimeout(resolve, delay));
}

type Color = three.Color | string | number;

export class Graph {
  //#region fields
  #parent: HTMLElement;
  #scene: three.Scene;
  #skyColor: Color;
  #groundColor: Color;
  #intensity: number;
  #light: three.Light;
  #camera: three.PerspectiveCamera;
  #renderer: three.WebGLRenderer;
  #controls: OrbitControls;

  #vertices: Map<VertexId, Vertex> = new Map(); // vertices mapping from id string to scene vertex
  #edges: Map<EdgeId, Edge> = new Map(); // edge mapping from id string to scene edge
  
  dynamicMatching  = new DynamicMatching(0); // todo get it to work
  selected: Set<Vertex> = new Set<Vertex>();;

  #selectionBox: SelectionBox;
  #selectionHelper: SelectionHelper;
  #constants: Constants = Constants.toJSON();
  //#endregion

  constructor( elem: HTMLElement ){
    this.#parent = elem;

    // using the threejs library to create a scene
    this.#scene = new three.Scene();
    
    // light
    this.#skyColor = 0xffffff;
    this.#groundColor = 0x878787;
    this.#intensity = 85.0;
    this.#light = new three.HemisphereLight( 
      this.#skyColor,
      this.#groundColor 
    );
    this.#scene.add( this.#light );
    
    // the camera lets us look into the scene
    this.#camera = new three.PerspectiveCamera( 75, elem.clientWidth/elem.clientHeight, 0.1, 1000 );
    this.#camera.position.z = 25;
    
    // the renderer renders the scene onto a canvas element
    this.#renderer = new three.WebGLRenderer({ antialias: true });
    this.#renderer.setSize( elem.clientWidth, elem.clientHeight );
    this.#renderer.setPixelRatio( elem.clientWidth / elem.clientHeight );
    // this.#renderer.setClearColor( 'transparent' );
    this.#renderer.setClearAlpha( 0x00000000 );
    this.#renderer.domElement.style.width = '100%';
    this.#renderer.domElement.style.height = '100%';
    this.#renderer.domElement.style.display = 'block';
    this.#renderer.domElement.style.backgroundColor = 'rgba(ff, ff, ff, 0%)';
    this.#renderer.setAnimationLoop( this.#animate.bind( this ) );
    this.#controls = new OrbitControls( this.#camera, this.#renderer.domElement );
    
    elem.appendChild( this.#renderer.domElement )
    elem.addEventListener('resize', this.resize.bind(this));

    this.#renderer.domElement.addEventListener('click', this.#onClick.bind(this), false);

    this.#selectionBox = new SelectionBox( this.#camera, this.#scene );
    this.#selectionHelper = new SelectionHelper( this.#renderer, 'selectBox' );
    this.canvas.addEventListener('pointerdown', this.onPointerdown.bind(this));
    this.canvas.addEventListener('pointermove', this.onPointermove.bind(this));
    this.canvas.addEventListener('pointerup', this.onPointerup.bind(this));
  }

  addVertex(options: VertexOptions): Vertex {
    options.id ??= Vertex.id();
    const vertex = new Vertex( this, options );
    this.#scene.add( vertex.group );
    this.#vertices.set( vertex.id, vertex );
    this.dynamicMatching?.addVertex( vertex.id );

    return vertex;
  }

  removeVertex( id: string ): boolean {
    try{
      // retrieve vertex
      const vertex = this.#vertices.get(id);
      if(!vertex) return false;

      // remove incident edges
      [...this.#edges.values()]
      .filter(edge => (edge.source.id === vertex.id) || (edge.target.id === vertex.id))
      .forEach(edge => this.removeEdge(edge.id));

      // remove vertex
      this.#vertices.delete( vertex.id );

      // undraw vertex
      vertex.group.removeFromParent();
      this.dynamicMatching.removeVertex( vertex.id );

      vertex.label?.remove?.();
      
      return true;
    }catch(e){
      console.error(e);
    }

    return false;
  }

  addEdge(sourceId: Vertex | VertexId, targetId: Vertex | VertexId, options: EdgeOptions): Edge {
    options.id ??= Edge.id();
    options = Object.assign( {}, this.defaults.edge, options )

    const source: Vertex = typeof sourceId === 'string' ? this.#vertices.get(sourceId)! : sourceId as Vertex;
    const target: Vertex = typeof targetId === 'string' ? this.#vertices.get(targetId)! : targetId as Vertex;
    const edge = new Edge( this, source, target, options );
    
    this.#scene.add( edge.group );
    this.#edges.set( edge.id, edge );
    this.dynamicMatching?.addEdge( edge.id, edge.source.id, edge.target.id, options.strength );

    // await wait(10);
    return edge;
  }

  removeEdge( id ){
    try{
      // retrieve edge
      const edge = this.#edges.get( id );
      if(!edge) return false;
      
      // delete edge
      this.#edges.delete( edge.id );
      
      // undraw edge
      edge.group.removeFromParent();
      this.dynamicMatching.removeEdge( edge.id );

      edge.label?.remove();

      if(edge.spline){
        edge.group.userData.stops.forEach((iv: Vertex) => this.dynamicMatching.removeVertex(iv.id));
      }

      return true;
    }catch(e){
      console.error(e);
    }
  }

  clear(): void {
    this.#vertices.forEach( v => this.removeVertex( v.id ) );
    Vertex.resetId();
    Edge.resetId();
  }

  remove(): void {
    while(this.#scene.children.length > 0){
      this.#scene.remove(this.#scene.children[0]);
    }
    this.#scene.clear();
  }

  defaults  = {
    vertex: {
      color: 0x6495ed,
      selectionColor: 0xffa500,
      texture: null,
      size: 1.0,
      label: null,
      selected: false,
      visible: true,
      spline: false
    },
    edge: {
      color: 0x000000,
      strength: 1.0,
      label: null,
      arrow: false,
      width: 3,
      spline: false,
      visible: true
    }
  }

  onPointerdown(e: PointerEvent): void {
    if(!e.altKey){
      this.#controls.enabled = true;
      this.#selectionHelper.enabled = false;
      return;
    }
    e.preventDefault();

    this.#controls.enabled = false;
    this.#selectionHelper.enabled = true;

    for(let item of this.#selectionBox.collection){
      if(item.name === 'cube'){
        item.parent!.userData.vertex.selected = false;
      }
    }

    this.#selectionBox.startPoint.set(
      (e.clientX / this.#renderer.domElement.clientWidth) * 2 - 1,
      -(e.clientY / this.#renderer.domElement.clientHeight) * 2 + 1, 
      0.5
    );
  }

  onPointermove(e: PointerEvent): void {
    e.preventDefault();
    if(!e.altKey){
      this.#controls.enabled = true;
      this.#selectionHelper.enabled = false;
      return;
    }

    this.#controls.enabled = false;
    this.#selectionHelper.enabled = true;
   
    if( this.#selectionHelper.isDown ){
      for(let item of this.#selectionBox.collection){
        if(item.name === 'cube'){
          item.parent!.userData.vertex.selected = false;
        }        
      }

      this.#selectionBox.endPoint.set(
        (e.clientX / this.#renderer.domElement.clientWidth) * 2 - 1,
        -(e.clientY / this.#renderer.domElement.clientHeight) * 2 + 1,
        0.5
      );

      for(let selected of this.#selectionBox.select()){
        if(selected.name === 'cube'){
          selected.parent!.userData.vertex.selected = true;
        }
      }
    }
  }

  onPointerup(e: PointerEvent): void {
    e.preventDefault();
    if(!e.altKey){
      this.#controls.enabled = true;
      this.#selectionHelper.enabled = false;
      return;
    }

    this.#controls.enabled = false;
    this.#selectionHelper.enabled = true;

    this.#selectionBox.endPoint.set(
      (e.clientX / this.#renderer.domElement.clientWidth) * 2 - 1,
      -(e.clientY / this.#renderer.domElement.clientHeight) * 2 + 1,
      0.5
    );

    const allSelected = this.#selectionBox.select();
    for(let selected of allSelected){
      if(selected.name === 'cube'){
        selected.parent!.userData.vertex.selected = true;
      }
    }
  }

  get constants(): Constants {
    return Constants;
  }

  fromJSON(json: {V: Array<VertexOptions>, E: Array<EdgeOptions>, constants: Constants, defaults: {vertices: VertexOptions, edges: EdgeOptions}}): void {
    this.clear();
    Constants.fromJSON(json.constants);
    Object.assign(this.defaults, json.defaults);

    for(let vertex of json.V){
      this.addVertex(vertex);
    }
    for(let edge of json.E){
      this.addEdge(edge.sourceId!, edge.targetId!, edge);
    }
  }

  toJSON(): {constants: Constants, defaults: {vertices: VertexOptions, edges: EdgeOptions}, V: Array<VertexOptions>, E: Array<EdgeOptions>}{
    return {
      constants: Constants.toJSON(),
      defaults: this.defaults as any,
      V: [...this.#vertices.values()].filter( (v: Vertex) => !v.spline ).map( (v: Vertex) => v.toJSON() ),
      E: [...this.#edges.values()].map( (e: Edge) => e.toJSON() )
    }
  }

  // vertices array for external use
  get vertices(): Array<Vertex> {
    return [...this.#vertices.values()].filter(v => !v.spline);
  }

  get edges(): Array<Edge>{
    return [...this.#edges.values()];
  }

  get canvas(): HTMLCanvasElement {
    return this.#renderer.domElement;
  }

  #animate(): void {
    this.dynamicMatching.update();

    // for(const [id, simVertex] of this.dynamicMatching.vertices){
    //   const renderVertex = this.#vertices.get(id);
    //   if(renderVertex){
    //     renderVertex.group.position.copy(simVertex.position);
    //   }
    // }

    this.#vertices.forEach(ov => ov.update());
    this.#edges.forEach(oe => oe.update());
    this.#updateLabels();
    this.#controls.update();

    this.#renderer.render( this.#scene, this.#camera );
  }

  set backgroundColor( color: Color ) {
    this.#renderer.setClearColor( color );
  }

  #onClick(e: PointerEvent): void {
    const mouse = new three.Vector2();
    const raycaster = new three.Raycaster();
    let intersects = [], vertex = null;

    if(!e.ctrlKey && !e.altKey){
      [...this.selected.values()].filter((v: Vertex) => !v.spline).forEach((v: Vertex) => v.selected = false);
    }

    mouse.set(
      (e.clientX / this.#renderer.domElement.clientWidth) * 2 - 1,
      -(e.clientY / this.#renderer.domElement.clientHeight) * 2 + 1
    );

    raycaster.setFromCamera( mouse, this.#camera );
    intersects = raycaster
      .intersectObjects( this.#scene.children )
      .filter(io => ['wire', 'cube'].includes(io.object.name))
      .filter(io => !io.object.spline);

    if(intersects.length){
      vertex = intersects[0]?.object.parent!.userData.vertex;
      vertex.selected = e.ctrlKey ? !vertex.selected : true;

      this.#renderer.domElement.dispatchEvent(
        new CustomEvent( 'vertex-click', {detail: vertex} )
      );

      this.#renderer.domElement.dispatchEvent(
        new CustomEvent( 'vertex-select', {detail: this.selected} )
      );
    }
  }

  resize(){
    this.#camera.aspect = this.#parent.clientWidth / this.#parent.clientHeight;
    this.#camera.updateProjectionMatrix();
    this.#renderer.setSize( this.#parent.clientWidth, this.#parent.clientHeight );
  }

  get parent(){
    return this.#parent;
  }

  #isObscured(object: three.Object3D): boolean {
    const cam = new three.Vector3();
    this.#camera.getWorldPosition( cam );

    const point = new three.Vector3();
    object.getWorldPosition( point );
    
    const raycaster = new three.Raycaster();
    raycaster.setFromCamera( new three.Vector2().copy(point), this.#camera )
    const intersects = raycaster.intersectObjects( this.#scene.children )
    
    if(intersects.length > 0){
      const distance = cam.distanceTo( point );
      if( intersects[0].distance < distance - 0.01 ){
        return true;
      }
    }

    return false;
  }

  // todo: middle of a spline curve
  #updateLabels(): void {
    const applicableObjectNames = new Set([
      'vertex-cube',
      'edge-line', 'edge-arrow',
      'edge-spline', 'edge-splarrow'
      // 'line', 'spline'
    ]);

    const raycaster = new three.Raycaster();
    const canvas = this.#renderer.domElement;
    const camera = this.#camera;
    raycaster.ray.origin.copy( camera.position );

    this.#scene.traverseVisible((object) => {
      if(!applicableObjectNames.has(object.name)) return;

      let label, pos;
      if(object.name === 'vertex-cube'){
        // vertex cubes
        label = object.userData.vertex?.label;
        if(!label) return;

        raycaster.ray.direction.copy( object.position.clone().sub( camera.position ).normalize() ); // ?
        pos = object.position.clone();
      }else if((object.name === 'edge-line') || (object.name === 'edge-arrow')){
        // straight edges
        label = object.userData.edge?.label;
        if(!label) return;

        const start = object.userData.edge.source.position.clone();
        const end   = object.userData.edge.target.position.clone();
        pos = start.clone().add(end).divideScalar(2.0);
      }else if((object.name === 'edge-spline') || (object.name === 'edge-splarrow')){
        // spline edges
        label = object.userData.edge?.label;
        if(!label) return;

        const stopA = object.userData.stops[0];
        const stopB = object.userData.stops[1];

        const start = this.dynamicMatching.getVertex(stopA)!.position.clone();
        const end   = this.dynamicMatching.getVertex(stopB)!.position.clone();
        pos = start.add(end).divideScalar(2.0);
      }

      if(this.#isObscured(object)){
        if(label) label.style.display = 'none';
        return;
      }else{
        if(label) label.style.display = 'block';
      }

      pos.project(camera);

      const rect = canvas.getBoundingClientRect();
      const halfWidth = canvas.clientWidth / 2;
      const halfHeight = canvas.clientHeight / 2;

      label.style.left  = `${rect.x + (pos.x * halfWidth)  + halfWidth }px`;
      label.style.top   = `${rect.y - (pos.y * halfHeight) + halfHeight}px`;
    });
  }

  #toClientCoords(scenePos: three.Vector3, camera: three.PerspectiveCamera, canvas: HTMLCanvasElement): three.Vector2 {
    let position = scenePos.clone();
    position.project( camera );
    let x = Math.round( position.x + 1 ) / 2 * canvas.clientWidth;
    let y = Math.round( position.y + 1 ) / 2 * canvas.clientHeight;

    return new three.Vector2(x, y);
  }
}
