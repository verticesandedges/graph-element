import * as three from "three";
import { Edge } from "./scene-edge.ts";
import { Graph } from "./scene-graph.ts";

export type VertexId = string;
type Color = string | number | three.Color;
export type VertexOptions = {      
  id?: VertexId;
  color?: Color;
  texture?: string | null;
  selectionColor?: Color;
  size?: number;
  label?: HTMLLabelElement | string | null;
  visible?: boolean;
  selected?: boolean;
  spline?: boolean;
}

export class Vertex {
  static nextId: number = 0;
  static resetId(){ Vertex.nextId = 0};
  static id(): VertexId { return `vertex-${++Vertex.nextId}` }
  
  #id: VertexId | null = null;
  #edges: Set<Edge> = new Set<Edge>();
  
  #graph: Graph;
  #cube: three.Mesh | null = null;
  #wire: three.Mesh | null = null;
  #group: three.Group | null = null;
  #texture: string | null = null;
  #label: HTMLElement | string | null = null;
  #color: Color;
  #size: number | null = null;
  #spline: boolean | null = null;

  constructor( graph: Graph, options?: VertexOptions){
    this.#graph = graph;
    this.#id = options?.id ?? Vertex.id();
    options = Object.assign({}, graph.defaults.vertex, options);

    this.#cube = new three.Mesh(
      new three.BoxGeometry( 1, 1, 1 ),
      new three.MeshPhongMaterial( { "color": options.color } )
    );
    this.#cube.name = 'cube';
    
    this.#spline = options.spline ?? false;

    this.#wire = new three.Mesh( 
      new three.BoxGeometry( 1.25, 1.25, 1.25 ),
      new three.MeshPhongMaterial({ wireframe: true, "color": options.selectionColor })
    );
    this.#wire.visible = false;
    this.#wire.name = 'wire';

    this.#group = new three.Group();
    this.#group.name = 'vertex-cube'
    this.#group.add(this.#cube);
    this.#group.add(this.#wire);
    this.#group.userData.id = this.id;
    this.#group.userData.vertex = this;

    Object.assign(this, options);
  }

  // returns true if this is a vertex meant for calculating splines and is thus not rendered nor listed
  get spline(): boolean {
    return this.#spline!;
  }

  set spline(val: boolean){
    this.#spline = val;
  }

  get edges(): Set<Edge> {
    return this.#edges;
  }

  get graph(): Graph {
    return this.#graph;
  }

  get group(): three.Group {
    return this.#group!;
  }

  get id(): VertexId {
    return this.#id!;
  }

  set id(val: VertexId){ 
    this.#id = val;
  }

  get color(): number {
    return (this.#cube?.material as three.MeshPhongMaterial).color.getHex();
  }

  set color( color: string | number | three.Color ){
    (this.#cube?.material as three.MeshPhongMaterial).color.set( color );
    this.#color = color;
  }

  resetColor( color: number | string | three.Color ){
    console.assert(this.#cube !== null, "Cube not defined")
    const material = new three.MeshPhongMaterial({ color })
    this.#cube!.material = material;
    this.#cube!.material.needsUpdate = true;
  }

  get texture(): string | null {
    return this.#texture;
  }

  set texture(src: string | null){
    if(!src){
      const material = new three.MeshPhongMaterial({ color: this.color });
      this.#cube!.material = material;
      this.#cube!.material.needsUpdate = true;
      this.#texture = null;
      return;
    }

    const loader = new three.TextureLoader();
    const texture = loader.load(src);
    const material = new three.MeshPhongMaterial({ map: texture });
    this.#cube!.material = material;
    this.#cube!.material.needsUpdate = true;
    this.#texture = src;
  }

  get selectionColor(): number {
    return (this.#wire!.material as three.MeshPhongMaterial).color.getHex();
  }

  set selectionColor( color: string | number | three.Color ){
    (this.#wire!.material as three.MeshPhongMaterial).color.set( color );
  }

  get size(): number {
    return this.#size!;
  }

  set size( value: number ){
    this.#size = value;
    this.#group!.scale.set( value, value, value );
  }

  get selected(): boolean {
    return this.#wire!.visible;
  }
  
  set selected( value: boolean ){
    this.#wire!.visible = value;
    if(value){
      this.#graph.selected.add(this);
    }else{
      this.#graph.selected.delete(this);
    }
  }

  get visible(): boolean {
    if(typeof this.#group!.visible === 'boolean'){
      return this.#group!.visible;
    }else if(typeof this.#group!.visible === 'string'){
      return this.#group!.visible === 'true';
    }else if(typeof this.#group!.visible === 'number'){
      return this.#group!.visible !== 0;
    }

    return false;
  }

  set visible(value: boolean | string | number){
    if(typeof value === 'boolean'){
      this.#group!.visible = value;
    }else if(typeof value === 'string'){
      this.#group!.visible = value === 'true';
    }else if(typeof value === 'number'){
      this.#group!.visible = value !== 0;
    }
  }

  toJSON(): VertexOptions {
    return {
      id: this.id,
      color: this.color,
      texture: this.texture,
      selectionColor: this.selectionColor,
      size: this.size,
      label: this.label,
      visible: this.visible,
      selected: this.selected
    };
  }
  
  get pos(): three.Vector3 | undefined {
    return this.#group?.position;
  }
  
  set pos( val: three.Vector3 ){
    this.#group!.position.copy(val);
  }

  get label(): HTMLLabelElement | null {
    return this.#label as HTMLLabelElement;
  }

  set label(text: string | HTMLLabelElement | null){
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

  update(): void {
    this.pos = this.#graph?.dynamicMatching.vertices.get(this.id)?.position;
  }

  remove(): void {
    this.#graph.removeVertex(this.id);
    this.#cube?.geometry.dispose();
    (this.#cube?.material as three.MeshPhongMaterial).dispose();
    this.#wire?.geometry.dispose();
    (this.#wire?.material as three.MeshPhongMaterial).dispose();
  }

  // aliases
  get position(){
    return this.pos;
  }
  
  set position(pos: three.Vector3){
    this.pos.set(pos.x, pos.y, pos.z);
  }
}
