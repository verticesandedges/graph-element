// dynamic-matching.ts
// Joshua M. Moore
// joshua.moore@verticesandedges.net
//
// Implemented after Dynamic Multilevel Graph Visualization
// by Dr. Todd Veldhuizen (2007)


import { Vector3, Matrix3, EdgesGeometry } from "three";
// import { Vector3, Matrix3 } from "../../node_modules/three/build/three.module";

//#region types
type VertexId = string;
type EdgeId = string;
type EdgeStrength = number;
type Priority = number;
//#endregion

//#region interfaces
interface locatable {
  position: Vector3;
}

// todo replace Vector3 with locatable
interface estimateable {
  source: locatable,
  target: locatable
  strength?: EdgeStrength
}

interface prioritizable {
  priority: Priority
}
//#endregion

//#region Vector3
Vector3.prototype.transpose = function(v2: Vector3){
  return new Matrix3().set(
    this.x * v2.x, this.x * v2.y, this.x * v2.z,
    this.y * v2.x, this.y * v2.y, this.y * v2.z,
    this.z * v2.x, this.z * v2.y, this.z * v2.z
  );

  // return new Matrix3(
  //   this.x, 0, 0,
  //   0, this.y, 0,
  //   0, 0, this.z
  // );
}

Vector3.prototype.zeros = function(){
  this.x = 0;
  this.y = 0;
  this.z = 0;
}
//#endregion

//#region Matrix3

Matrix3.prototype.add = function(other: Matrix3): Matrix3 {
  for(let i=0; i<9; i++){
    this.elements[i] = (this.elements[i] ?? 0.0) + (other.elements[i] ?? 0.0);
  } 
  return this;
}

Matrix3.prototype.sub = function(other: Matrix3): Matrix3 {
  for(let i=0; i<9; i++){
    this.elements[i] = (this.elements[i] ?? 0.0) - (other.elements[i] ?? 0.0);
  }
  return this;
}

Matrix3.prototype.multiplyVector = function(vector: Vector3): Vector3 {
  const e = this.elements;
  const x = vector.x, y = vector.y, z = vector.z;
  
  return new Vector3(
    e[0] * x + e[3] * y + e[6] * z,
    e[1] * x + e[4] * y + e[7] * z,
    e[2] * x + e[5] * y + e[8] * z
  );
}

Matrix3.prototype.addVector = function(vector: Vector3): Matrix3 {
  this.elements[0] += vector.x;
  this.elements[4] += vector.y;
  this.elements[8] += vector.z;
  return this;

  // for(let i=0; i<3; i++){
  //   this.elements[i] = (this.elements[i] ?? 0.0) + vector.x;
  //   this.elements[i + 3] = (this.elements[i + 3] ?? 0.0) + vector.y;
  //   this.elements[i + 6] = (this.elements[i + 6] ?? 0.0) + vector.z;
  // }
  // return this;
}

Matrix3.prototype.zeros = function(): Matrix3 {
  for(let i=0; i<9; i++) this.elements[i] = 0.0;
  return this;
}
//#endregion

//#region Constants
export class Constants { 
  // For a connected pair, equilibrium is K*d ~= f0/d^2 => d ~= (f0/K)^(1/3).
  // With K=2.0e-2 and target d~25px, f0~3.125e2.
  static f0: number             = 3.125e+2; // repulsion (magnets) constant; more f0, more repulsion
  static K: number              = 2.0e-0; // attraction (spring) constant; more K, more attraction
  static dt: number             = 0.02; // time step; more dt, faster simulation
  static D: number              = 0.75; // damping constant; more D, more damping
  static epsilon: number        = 0.10; // minimum distance; to avoid division by zero
  static theta: number          = 0.50; // Barnes-Hut theta; more theta, less accuracy and more speed
  static phi: number            = 0.15; // Phi time dilation factor
  static innerDistance: number  = 100.0; // Inner distance: Used by the Barnes Hut Tree to determine proximity

  //#region serialization
  static reset(){
    Constants.fromJSON({
      K: 2.0e-2,
      f0: 3.125e+2,
      dt: 0.02,
      D: 0.75,
      epsilon: 0.1,
      theta: 0.5,
      phi: 0.15,
      innerDistance: 100.0
    })
  }

  static toJSON(): object {
    return {
      K:              Constants.K,
      f0:             Constants.f0,
      dt:             Constants.dt,
      D:              Constants.D,
      epsilon:        Constants.epsilon,
      theta:          Constants.theta,
      phi:            Constants.phi,
      innerDistance:  Constants.innerDistance
    };
  }

  static fromJSON(c: any){
    Constants.K             = c.K;
    Constants.f0            = c.f0;
    Constants.dt            = c.dt;
    Constants.D             = c.D;
    Constants.epsilon       = c.epsilon;
    Constants.theta         = c.theta;
    Constants.phi           = c.phi;
    Constants.innerDistance = c.innerDistance;
  }

  static stringify(): string {
    return JSON.stringify(Constants.toJSON());
  }

  static parse(s: string): void {
    Constants.fromJSON(JSON.parse(s))
  }
  //#endregion
}
//#endregion

export class Vertex implements locatable {
  private static nextId: number = 0;
  public static id(): VertexId { return `vertex-${++Vertex.nextId}`; }
  private static S = 10.0; // random initial spread

  public acceleration = new Vector3();
  readonly velocity = new Vector3();
  readonly position = new Vector3( 
    Math.random() * Vertex.S, 
    Math.random() * Vertex.S, 
    Math.random() * Vertex.S 
  );

  public projectedAcceleration = new Vector3();
  readonly projectedVelocity = new Vector3();
  readonly projectedPosition = new Vector3( 
    Math.random(), 
    Math.random(), 
    Math.random() 
  );

  public __displacement = new Vector3();
  readonly _displacement = new Vector3();
  readonly displacement = new Vector3( 
    Math.random(), 
    Math.random(), 
    Math.random() 
  );

  public finers = new Set<Vertex>();
  public coarser?: Vertex | undefined;
  public edges = new Set<Edge>();

  constructor(public id: VertexId=Vertex.id(), finers=new Set<Vertex>()){
    finers.forEach((finer: Vertex) => {
      this.finers.add(finer);
      finer.coarser = this;
    });
  }

  static repel(args: estimateable): Vector3 {
    const posA = args.source.position;
    const posB = args.target.position;
    const difference = new Vector3().subVectors(posA, posB);
    const distance = Math.max(difference.length(), Constants.epsilon);
    // Scale by 1/r^3 on the direction vector so force magnitude becomes 1/r^2.
    return difference.multiplyScalar(Constants.f0 / Math.pow(distance, 3));
  }

  merge(other: Vertex){
    // this.finers = this.finers.union(other.finers);
  }

  updateSingle(){
    this.acceleration.multiplyScalar(Constants.dt);
    this.velocity.add(this.acceleration);
    this.velocity.multiplyScalar(Constants.D);
    this.position.add(this.velocity);
    this.acceleration.set(0, 0, 0);
  }
}

export class Edge {
  private static nextId: number = 0;
  public static id(): EdgeId { return `edge-${++Edge.nextId}` }

  public priority: Priority = Math.random();
  public count: number = 1;
  public coarser?: Edge;
  #strength: number = 1.0;

  constructor(public id: EdgeId=Edge.id(), public source: Vertex, public target: Vertex, strength: EdgeStrength=1.0){
    this.#strength = strength;
  }

  get strength(): number {
    return this.#strength;
  }

  set strength(val: number){
    this.#strength = val;
  }

  // static attract(args: estimateable): Vector3 {  
  //   const { source, target, strength } = args;
  //   const difference = new Vector3().subVectors(target.position, source.position);
  //   const distance = difference.length() || Constants.epsilon
  //   return difference.normalize().multiplyScalar(Constants.K * distance * (strength ?? 1.0));
  // }

  // static attract(args: estimateable): Vector3 {
  //   const { source, target, strength } = args;
  //   const difference = new Vector3().subVectors(target.position, source.position);
  //   const distance = difference.length() || Constants.epsilon;
  //   let distSq = difference.lengthSq();
  //   if(distSq < Constants.epsilon) return new Vector3(0, 0, 0);
  //   return difference.normalize().multiplyScalar(Constants.K * distance * (strength ?? 1.0));
  // }

  static attract(args: estimateable): Vector3 {
    const v1 = args.source.position;
    const v2 = args.target.position;
    const difference = new Vector3().subVectors(v2, v1);
    const distance = Math.max(difference.length(), Constants.epsilon);
    const strength = (args as Edge).strength;

    // Hooke-like spring attraction: linear in distance.
    return difference
      .normalize()
      .multiplyScalar(Constants.K * distance * strength);
  }

  sharesVertex(other: Edge): boolean {
    return this.source.id === other.source.id
        || this.source.id === other.target.id
        || this.target.id === other.source.id
        || this.target.id === other.target.id;
  }

  implies(other: Edge): boolean {
    return this.priority < other.priority
        && this.sharesVertex(other);
  }
}

export class Octree implements locatable {
  inners = new Set<Vertex>();
  outers = new Map<string, Octree>();
  centerSum = new Vector3(0, 0 ,0)
  #size = 0;

  constructor(
    public boundaryCenter: Vector3 = new Vector3(0, 0, 0),
    public width: number = 2000,
    private depth: number = 0
  ){}

  center(): Vector3 {
    if(this.#size === 0) return this.boundaryCenter.clone();
    return this.centerSum.clone().divideScalar(this.#size);
  }
  
  get position(): Vector3 {
    return this.center();
  }

  get size(): number {
    return this.#size;
  }

  getOctant(pos: Vector3): string {
    var c = this.boundaryCenter;
    var x = pos.x >= c.x ? 'r' : 'l';
    var y = pos.y >= c.y ? 'u' : 'd';
    var z = pos.z >= c.z ? 'i' : 'o';
    return `${x}${y}${z}`;
  }

  ensureChildren(){
    if(this.width < 0.000001 || this.depth > 20) return;

    if(this.outers.size === 0){
      const childWidth = this.width / 2
      const offset = this.width / 4;
      const c = this.boundaryCenter;
      const shifts = {
        l: -offset, r: offset,
        d: -offset, u: offset,
        o: -offset, i: offset
      };

      for(let x of ['l', 'r'] as const){
        for(let y of ['d', 'u'] as const){
          for(let z of ['o', 'i'] as const){
            const key = `${x}${y}${z}`;
            this.outers.set(key, new Octree(
              new Vector3(c.x + shifts[x], c.y + shifts[y], c.z + shifts[z]),
              childWidth,
              this.depth + 1
            ));
          }
        }
      }
    }
  }

  insert(vertex: Vertex): void {
    this.centerSum.add(vertex.position);

    if(this.#size === 0){
      this.inners.add(vertex);
      this.#size = 1;
      return;
    }

    if(this.depth >= 20 || this.width < 0.000001){
      this.inners.add(vertex);
      this.#size++;
      return;
    }

    if(this.#size === 1 && this.inners.size > 0){
      const resident = [...this.inners.values()][0];
      this.inners.clear();
      this.ensureChildren();

      const resOct = this.getOctant(resident.position);
      this.outers.get(resOct)!.insert(resident);
    }

    this.ensureChildren();
    const octant = this.getOctant(vertex.position);
    const child = this.outers.get(octant);

    if(child){
      child.insert(vertex);
    }else{
      this.inners.add(vertex);
    }

    this.#size++;
  }

  estimate(v: Vertex, forceFn: (args: estimateable) => Vector3): Vector3 {
    const f = new Vector3();

    if(this.inners.size > 0){
      this.inners.forEach(inner => {
        if(inner.id !== v.id){
          f.add(forceFn({ source: v, target: inner }));
        }
      });
      return f;
    }

    const dist = v.position.distanceTo(this.position);
    if(dist > 0 && (this.width / dist) < Constants.theta){
      f.add(forceFn({source: v, target: this}).multiplyScalar(this.#size));
    }else{
      this.outers.forEach(child => {
        if(child.#size > 0) f.add(child.estimate(v, forceFn));
      })
    }

    return f;
  }

  dispose(){
    this.outers.forEach(o => o.dispose());
    this.outers.clear();
    this.inners.clear();
    this.#size = 0;
    this.centerSum.set( 0, 0, 0 );
  }
}

export class PriorityQueue<P extends prioritizable> {
  data = new  Array<P>();
  
  constructor(){}

  enqueue(item: P): void {
    const index = this.data.findIndex((v: P) => item.priority >= v.priority);
    this.data.splice(index - 1, 0, item)
  }

  dequeue(): P | undefined { return this.data.shift(); }
  get empty(): boolean { return this.data.length === 0; }
}

export class DynamicMatching {
  private octree: Octree = new Octree();
  private pq = new PriorityQueue<Edge>(); 
  private matching = new Set<Edge>;
  
  public vertices = new Map<VertexId, Vertex>();
  public edges = new Map<EdgeId, Edge>();
  public coarser?: DynamicMatching;
  
  public __alpha = new Matrix3();
  public _alpha = new Matrix3();
  public alpha = new Matrix3();

  public __beta = new Vector3();
  public _beta = new Vector3();
  public beta = new Vector3();
  
  constructor(public levels: number=0){
    if(levels > 0){
      this.coarser = new DynamicMatching(this.levels - 1);
    }
  }

  singleLevelLayoutCPU(){
    // estimate repulsion forces
    const vertices = Array.from(this.vertices.values());
    const octree = new Octree();

    for(const vertex of vertices){
      octree.insert(vertex);
    }

    for(const vertex of vertices){
      const force = octree.estimate(vertex, Vertex.repel);
      vertex.acceleration.add(force);
    }

    // calculate attraction forces
    const edges = Array.from(this.edges.values());

    for(const edge of edges){
      const force = Edge.attract(edge);
      edge.source.acceleration.add(force);
      edge.target.acceleration.sub(force);
    }

    // add acceleration to velocity to position
    vertices.forEach((v: Vertex) => v.updateSingle());
  }

  singleLevelLayoutGPU(){
    
  }

  multiLevelLayout(){
    this.__alpha.zeros()
    this.__beta.set(0, 0, 0);

    this._alpha.zeros();
    this._beta.set(0, 0, 0);

    this.alpha.zeros();
    this.beta.set(0, 0, 0);

    this.vertices.forEach((y: Vertex) => {
      this.__alpha
      .add(y.position.transpose(y.displacement))
      .add(y.displacement.transpose(y.position));

      this.__beta
      .add(y.displacement);
    });

    this.__alpha.multiplyScalar(1.0/this.vertices.size);
    this.__beta.multiplyScalar(1.0/this.vertices.size);

    this._alpha.add(this.__alpha);
    this._beta.add(this.__beta);

    this.alpha.add(this._alpha);
    this.beta.add(this._beta);

    const __alpha = this.__alpha.clone() as Matrix3;
    const _alpha = this._alpha.clone() as Matrix3;
    const alpha = this.alpha.clone() as Matrix3;

    const __beta = this.__beta.clone() as Vector3;
    const _beta = this._beta.clone() as Vector3;
    const beta = this.beta.clone() as Vector3;

    this.vertices.forEach((y: Vertex) => {
      y.finers.forEach((x: Vertex) => {
        const F: Vector3 = x.acceleration.clone();
        const Fd: Vector3 = x._displacement.clone().multiplyScalar(-Constants.D);

        const acceleration = y.acceleration as Vector3;  // __position
        const velocity = y.velocity as Vector3;          // _position
        const position = y.position as Vector3;          // position

        x.projectedAcceleration
        .set(0, 0, 0)
        .add(__beta)
        .add(__alpha.multiplyVector(position) )
        .add(_alpha.multiplyVector(velocity).multiplyScalar(2.0 * Constants.phi))
        .add(alpha.multiplyVector(acceleration).multiplyScalar(Math.pow(Constants.phi, 2)));
        x.projectedVelocity.add(x.projectedAcceleration);
        x.projectedPosition.add(x.projectedVelocity);

        x.__displacement.copy(F.sub(x.projectedAcceleration).add(Fd));
        x._displacement.add(x.__displacement);
        x._displacement.multiplyScalar(Constants.D);
        x.displacement.add(x._displacement);

        x.position.copy(
          x.displacement
          .add(beta)
          .add(
            __alpha.clone()
            .multiplyVector(y.position))
          .add(
            _alpha.clone()
            .multiplyVector(y.velocity)
            .multiplyScalar(Constants.phi))
          .add(
            alpha.clone()
            .multiplyVector(y.acceleration)
            .multiplyScalar(Math.pow(Constants.phi, 2)))
        );

        x.acceleration.set(0, 0, 0);
        x.projectedAcceleration.set(0, 0, 0);
      })
    })
  }

  addVertex(id: VertexId=Vertex.id(), finers=new Set<Vertex>()){
    const vertex = new Vertex(id, finers);

    this.octree.insert(vertex);
    this.vertices.set(vertex.id, vertex);
    if(this.coarser){
      this.processPQ();
    }
    return vertex.id;
  }

  getVertex(id: VertexId): Vertex | undefined {
    return this.vertices.get(id);
  }

  addEdge(id: EdgeId=Edge.id(), sourceId: VertexId, targetId: VertexId, strength: EdgeStrength=1.0): EdgeId {
    const source: Vertex | undefined = this.vertices.get(sourceId);
    const target: Vertex | undefined = this.vertices.get(targetId);
    if(!source || !target) return "";

    let parentEdge: Edge | undefined;

    if(this.coarser){
      let csid, ctid, ceid, coarseSource, coarseTarget, coarseEdge;

      // Source coarse representative
      if(source.coarser){
        coarseSource = source.coarser;
        csid = source.coarser.id;
      }else{
        const coarseSourceId = this.coarser.addVertex(Vertex.id());
        coarseSource = this.coarser.vertices.get(coarseSourceId) as Vertex;
        coarseSource.finers.add(source);
        source.coarser = coarseSource;
        csid = coarseSource.id;
      }

      // Target coarse representative
      if(target.coarser){
        coarseTarget = target.coarser;
        ctid = target.coarser.id;
      }else{
        const coarseTargetId = this.coarser.addVertex(Vertex.id());
        coarseTarget = this.coarser.vertices.get(coarseTargetId) as Vertex;
        coarseTarget.finers.add(target);
        target.coarser = coarseTarget;
        ctid = coarseTarget.id;
      }

      // Handle coarse dge strength accumulation
      coarseEdge = this.findEdge(coarseSource, coarseTarget);
      if(coarseEdge){
        coarseEdge.count++;
        coarseEdge.strength += strength;
      }else{
        const newCeid = Edge.id();
        this.coarser.addEdge(newCeid, csid, ctid, strength);
        coarseEdge = this.coarser.edges.get(newCeid);
      }

      parentEdge = coarseEdge;
    }
    
    // Create the actual edge for this level
    const edge = new Edge(id, source, target, strength);
    if(parentEdge){
      edge.coarser = parentEdge;
    }

    this.edges.set(id, edge);
    source.edges.add(edge);
    target.edges.add(edge);
    
    if(this.coarser){
      this.pq.enqueue(edge);
      this.processPQ();
    }

    return edge.id;
  }

  getEdge(id: EdgeId): Edge | undefined {
    return this.edges.get(id);
  }

  findEdge(ySource: Vertex, yTarget: Vertex): Edge | undefined {
    const edges = new Set<Edge>();
    ySource.edges.forEach((item: Edge) => {
      if(yTarget.edges.has(item)) edges.add(item);
    });

    return [...edges.values()][0];
  }

  removeVertex(id: VertexId){
    const vertex = this.vertices.get(id);
    vertex?.edges.forEach(e => this.removeEdge(e.id));
    this.vertices.delete(id);
    if(this.coarser) this.processPQ();
  }

  removeEdge(id: EdgeId): void {
    const e: Edge | undefined = this.edges.get(id);
    if(!e) return;

    if(this.coarser){
      if(this.matching.has(e)){
        this.unmatch(e);
        const ce = this.coarser!.findEdge(e.source.coarser!, e.target.coarser!);
        ce!.count--;
        ce!.strength -= e.strength;
        if(ce!.count === 0) this.coarser!.edges.delete(ce!.id);

        if(e.source.edges.size === 1) this.coarser?.removeVertex(e.source.coarser!.id);
        if(e.target.edges.size === 1) this.coarser?.removeVertex(e.target.coarser!.id);
      }

      this.edges.forEach((e_: Edge) => {
        if(e.implies(e_)) this.pq.enqueue(e_);
      })
    }

    e!.source.edges.delete(e);
    e!.target.edges.delete(e);
    this.edges.delete(e.id);

    if(this.coarser) this.processPQ();
  }

  match(e: Edge): void {
    if(this.coarser){
      this.edges.forEach((e_: Edge) => {
        if(e.implies(e_) && this.matching.has(e_)) this.unmatch(e_);
      });
      
      // Remove the old coarse vertex
      this.coarser!.removeVertex(e.source.coarser!.id);
      this.coarser!.removeVertex(e.target.coarser!.id);

      // Create new union vertex
      const vsutid = this.coarser!.addVertex(); // union between source and target vertices
      const vsut = this.coarser!.vertices.get(vsutid);
      
      vsut!.finers.add(e.source);
      vsut!.finers.add(e.target);
      e.source.coarser = vsut;
      e.target.coarser = vsut;

      const incidentEdges = new Set([...e.source.edges, ...e.target.edges]);

      incidentEdges.forEach((incident: Edge) => {
        if(incident.id === e.id) return;

        const neighbor = incident.source === e.source || incident.source === e.target
                          ? incident.target
                          : incident.source;

        if(neighbor.coarser){
          this.coarser!.addEdge(Edge.id(), vsutid, neighbor.coarser.id, incident.strength);
        }
      });
    }

    this.edges.forEach((e_: Edge) => {
      if(e.implies(e_)) this.pq.enqueue(e_);
    })
  }

  unmatch(e: Edge): void {
    const sut = e.source!.coarser!;

    // clear the coarse incident edges
    sut.edges.forEach((ie: Edge) => {
      this.coarser!.removeEdge(ie.id);
    })
    this.coarser!.removeVertex(sut.id);

    // re-create the two distinct coarse vertices
    const sid = this.coarser!.addVertex();
    const tid = this.coarser!.addVertex();

    e.source.coarser = this.coarser!.vertices.get(sid);
    e.target.coarser = this.coarser!.vertices.get(tid);

    // Re-add the fine edges between them them with original strengths
    e.source.edges.forEach(fe => {
      const neighbor = fe.source === e.source ? fe.target : fe.source;
      if(neighbor.coarser){
        this.coarser!.addEdge(Edge.id(), sid, neighbor.coarser.id, fe.strength);
      }
    });

    e.target.edges.forEach(fe => {
      const neighbor = fe.source === e.target ? fe.target : fe.source;
      if(neighbor.coarser){
        this.coarser!.addEdge(Edge.id(), tid, neighbor.coarser.id, fe.strength);
      }
    });

    this.edges.forEach((e_: Edge) => {
      if(e.implies(e_)) this.pq.enqueue(e_)
    })
  }

  matchEquation(e: Edge): boolean {
    let m = true;
    this.edges.forEach((e_: Edge) => {
      if(e_.implies(e)) m = m && !this.matching.has(e_);
    })
    return m;
  }

  processPQ(){
    while(!this.pq.empty){
      const e = this.pq.dequeue()!;
      const m = this.matchEquation(e);
      if(m !== this.matching.has(e)){
        if(m) this.match(e);
        else this.unmatch(e);
      }
    }
  }

  update(): void {
    if(this.coarser){
      this.coarser.update();
      this.multiLevelLayout();
    }else{
      this.singleLevelLayoutCPU()
    }
  }
}

