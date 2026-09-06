import * as three from 'three';
import { Line2 } from 'three/examples/jsm/lines/Line2';
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry';
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial';
import { LineHelper } from "./line-helper";
import { Vertex, VertexId, VertexOptions } from './scene-vertex'; 
import { Graph } from './scene-graph'

type Color = string | number | three.Color;
export type EdgeId = string;
export type EdgeOptions = {
  id?: EdgeId; 
  arrow?: boolean;
  spline?: boolean;
  visible?: boolean;
  color?: Color;
  width?: number;
  label?: string | HTMLLabelElement | null;
  strength?: number;
  sourceId?: VertexId;
  targetId?: VertexId;
}

export class Edge {
  static nextId: number = 0;
  static resetId(){ Edge.nextId = 0; }
  static id(): EdgeId { return `edge-${++Edge.nextId}`}

  #id: EdgeId;
  
  #graph: Graph;
  #line: three.Group | null   = null;
  #group: three.Group;
  
  #source: Vertex;
  #target: Vertex;

  // visible -- access state through getters and setters
  #arrow: boolean = false;
  #color: number = 0x000;
  #width: number = 1.0;
  #label: HTMLLabelElement | null = null;
  #strength: number = 1.0;
  #spline: boolean = false;
  #splineVertices: Array<Vertex> = new Array<Vertex>();
  #splineCurve: three.Group | null = null;

  constructor( graph: Graph, source: Vertex, target: Vertex, options: EdgeOptions){
    console.assert(source instanceof Vertex, 'Edge should have a source');
    console.assert(target instanceof Vertex, 'Edge should have a target');

    this.#graph = graph;
    options = Object.assign({id: options?.id ?? Edge.id()}, options);

    this.#id = options.id ?? Edge.id();
    if(!this.#spline){
      this.#graph.dynamicMatching.addEdge( this.#id, source.id, target.id, options.strength );
    }

    this.#source = source;
    this.#target = target;
    
    this.#arrow = options.arrow ?? false;
    this.#spline = options.spline ?? false;
    this.#strength = options.strength ?? 1.0;

    // choose a LineHelper fn to draw edge
    let fn;
    if(this.#arrow && !this.#spline)      fn = LineHelper.generateArrow;
    else if(this.#spline && !this.#arrow) fn = LineHelper.generateSpline;
    else if(this.#spline && this.#arrow)  fn = LineHelper.generateSplarrow;
    else                                  fn = LineHelper.generateLine;
    
    // call the previously chosen LineHelper function
    this.#group = fn(this.#source, this.#target, options, this.#graph);
    
    this.#group.userData.id = this.id;
    this.#group.userData.edge = this;

    this.#source.edges.add(this);
    this.#target.edges.add(this);

    Object.assign(this, graph.defaults.edge, options);
  }

  get label(): HTMLLabelElement | null {
    return this.#label as HTMLLabelElement;
  }

  set label(text: string | HTMLLabelElement){
    this.#label?.remove();

    if(typeof text === 'string' && text.length > 0){
      const label = document.createElement('label');
      label.innerText = text;
      (this.#graph?.parent! as HTMLElement).appendChild(label);

      label.style.display = 'block';
      label.style.zIndex = '1';
      label.style.position = 'fixed';

      this.#label = label;
    }

    if(text instanceof HTMLLabelElement){
      const label = text as HTMLLabelElement;
      (this.#graph?.parent! as HTMLElement).appendChild(label);

      label.style.display = 'block';
      label.style.zIndex = '1';
      label.style.position = 'fixed';

      this.#label = label;
    }
  }

  get source(): Vertex {
    return this.#source;
  }

  get target(): Vertex {
    return this.#target;
  }

  get options(): EdgeOptions {
    return {
      id: this.id,
      color: this.color,
      width: this.width,
      strength: this.strength,
      visible: this.visible,
      arrow: this.arrow,
      label: this.label
    }
  }

  get id(): EdgeId{
    return this.#id;
  }

  set id(val: EdgeId){ 
    this.#id = val 
  } 

  get group(): three.Group {
    return this.#group;
  }

  get color(): number {
    return this.#color;
  }

  set color( color: Color ){
    const c = new three.Color( color ).getHex();
    let line;
    if(this.#spline){
      line = this.#group.getObjectByName('spline') as Line2;
    }else{
      line = this.#group.getObjectByName('line') as Line2;
    }

    line.material.color.set( color );
    line.material.needsUpdate = true;

    if(this.#arrow){
      const cone = this.#group.getObjectByName('cone') as three.Mesh;
      (cone.material as three.MeshBasicMaterial).color.set( color );
      (cone.material as three.MeshBasicMaterial).needsUpdate = true;
    }
  
    this.#color = c;
  }

  get width(): number {
    return this.#width;
  }

  set width( value ){
    if(this.#spline) return;

    this.#width = value;

    const line = this.#group.getObjectByName('line') as three.Mesh;
    (line.material as LineMaterial).linewidth = value;
    (line.material as LineMaterial).needsUpdate = true;
  }

  get strength(): number {
    return this.#strength;
    // return this.#graph.dynamicMatching.edges.get( this.#id )!.strength;
  }

  set strength(val: number){
    const edge = this.#graph.dynamicMatching.edges.get( this.#id );
    edge!.strength = val;
    this.#strength = val;
  }

  get visible(){
    return this.#group.visible;
  }

  set visible(val){
    this.#group.visible = val;
  }

  get arrow(){
    return this.#arrow;
  }

  set arrow( val ){
    if(val === this.#arrow) return;

    // remove current
    const parent = this.#group.parent;
    this.#group.removeFromParent();

    const line = this.#group.getObjectByName('line');
    line?.material.dispose();
    line?.geometry.dispose();

    const spline = this.#group.getObjectByName('spline');
    spline?.material.dispose();
    spline?.geometry.dispose();

    const cone = this.#group.getObjectByName('cone');
    cone?.material.dispose();
    cone?.geometry.dispose();

    // redraw
    let fn = null;
    if(this.#spline) fn = val ? LineHelper.generateSplarrow : LineHelper.generateSpline;
    else             fn = val ? LineHelper.generateArrow    : LineHelper.generateLine;
    this.#group         = fn( this.#source, this.#target, this.options, this.#graph );
    
    this.#group.userData.edge = this;
    parent?.add(this.#group);

    this.#arrow = val;
  }

  get spline(){
    return this.#spline;
  }

  set spline( val ){
    if(val === this.#spline) return;

    // remove current
    const parent = this.#group.parent;
    this.#group.removeFromParent();

    const line = this.#group.getObjectByName('line');
    line?.material.dispose();
    line?.geometry.dispose();

    const spline = this.#group.getObjectByName('spline');
    spline?.material.dispose();
    spline?.geometry.dispose();

    const cone = this.#group.getObjectByName('cone');
    cone?.material.dispose();
    cone?.geometry.dispose();

    // redraw 
    let fn = null;
    
    if(this.#arrow) fn = val ? LineHelper.generateSplarrow : LineHelper.generateArrow;
    else            fn = val ? LineHelper.generateSpline   : LineHelper.generateLine;
    this.#group        = fn(this.#source, this.#target, this.options, this.#graph);
    
    this.#group.userData.edge = this;
    parent?.add(this.#group);

    this.#spline = val;
  }

  toJSON(): EdgeOptions {
    return {
      id: this.id,
      sourceId: this.source.id,
      targetId: this.target.id,
      color: this.color,
      arrow: this.arrow,
      label: this.label,
      strength: this.strength,
      spline: this.spline
    };
  }

  update(){
    const args = [
      this.#group, 
      this.#source, 
      this.#target,
      this.#graph
    ];

    switch(this.#group.name){
      case 'edge-line': 
        LineHelper.updateLine(...args);
        break;
      case 'edge-arrow':
        LineHelper.updateArrow(...args);
        break;
      case 'edge-spline':
        LineHelper.updateSpline(...args);
        break;
      case 'edge-splarrow': 
        LineHelper.updateSplarrow(...args);
        break;
    }
  }

  remove(){
    this.#graph.removeEdge(this.id);  
    
    const line = this.#group.getObjectByName('line');

    line?.material.dispose();
    line?.geometry.dispose();

    const spline = this.#group.getObjectByName('spline');
    spline?.material.dispose();
    spline?.geometry.dispose();

    const cone = this.#group.getObjectByName('cone');
    cone?.material.dispose();
    cone?.geometry.dispose();
  }
}
