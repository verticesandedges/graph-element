import { Graph } from '../layout/scene-graph';
import { VertexOptions } from '../layout/scene-vertex';
import { EdgeOptions } from '../layout/scene-edge';
import { VertexElement } from './vertex-element';
import { EdgeElement } from './edge-element';

import { Constants } from '../layout/dynamic-matching';

function propName(attrStr: string){
  return attrStr.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

export class GraphElement extends HTMLElement {
  static observedAttributes = ['background-color'];
  graph!: Graph;
  defaults!: {
    vertex: VertexOptions,
    edge: EdgeOptions
  }

  qs: (query: string) => HTMLElement;
  qsa: (query: string) => NodeList;

  constructor(){
    super();

    this.attachShadow({mode: "open"});
    this.qs = this.shadowRoot!.querySelector.bind(this.shadowRoot);
    this.qsa = this.shadowRoot!.querySelectorAll.bind(this.shadowRoot);

    // element setup, fetchStyle (css), fetchTemplate (html)
    this.fetchStyle()
    .then(() => this.fetchTemplate())
    .then(() => {
      const div = this.shadowRoot!.querySelector('div')!;
      this.graph = new Graph( div );
      this.defaults = Object.assign({}, this.graph.defaults);
    })
    .then(() => {
      this.querySelectorAll('vertex-el').forEach((vertex) => {
        this.graph.addVertex((vertex as VertexElement).readAttributes());
      })
      this.querySelectorAll('edge-el').forEach((edge => {
        const options = (edge as EdgeElement).readAttributes();
        const sourceId = options.sourceId;
        const targetId = options.targetId;

        this.graph.addEdge(sourceId, targetId, options);
      }))
    });
  }

  constants = {
    set f0(val: number){ Constants.f0 = val; },
    set K(val: number){ Constants.K = val; },
    set dt(val: number){ Constants.dt = val; },
    set D(val: number){ Constants.D = val; },
    set epsilon(val: number){ Constants.epsilon = val; },
    set theta(val: number){ Constants.theta = val; },
    set phi(val: number){ Constants.phi = val; },
    set innerDistance(val: number){ Constants.innerDistance = val; },

    get f0(){ return Constants.f0; },
    get K(){ return Constants.K; },
    get dt(){ return Constants.dt; },
    get D(){ return Constants.D; },
    get epsilon(){ return Constants.epsilon; },
    get theta(){ return Constants.theta; },
    get phi(){ return Constants.phi; },
    get innerDistance(){ return Constants.innerDistance; }
  }

  toJSON(title: string="Untitled Graph"){
    const V = [...this.querySelectorAll('vertex-el')].map(el => (el as VertexElement).toJSON());
    const E = [...this.querySelectorAll('edge-el')].map(el => (el as EdgeElement).toJSON());
    const constants = Constants.toJSON();
    const defaults = Object.assign({}, this.defaults);

    return {
      title,
      V,
      E,
      constants,
      defaults
    };
  }

  async fromJSON(graph: any, clearFirst: boolean=false){
    if(clearFirst) this.clear();
    // const wait = (delay) => new Promise((resolve, _) => setTimeout(resolve, delay));

    Constants.fromJSON(graph.constants);
    Object.assign(this.defaults, graph.defaults);

    const map = new Map();

    for(const vertex of graph.V){
      const v = this.addVertex(vertex);
      if(v.id !== vertex.id){
        map.set(vertex.id, v.id);
      }
    }

    for(const edge of graph.E){
      const sourceId = map.get(edge.sourceId) ?? edge.sourceId
      const targetId = map.get(edge.targetId) ?? edge.targetId;
      this.addEdge(sourceId, targetId, edge);
    }
  }

  async fetchStyle(): Promise<void> {
    const sheet = new CSSStyleSheet();
    const file = await fetch(new URL('./graph-element.css', import.meta.url));
    const css = await file.text();
    sheet.replaceSync(css);
    this.shadowRoot!.adoptedStyleSheets = [sheet];
  }

  async fetchTemplate(): Promise<void> {
    this.shadowRoot!.innerHTML = '<div></div>';
  }

  attributeChangedCallback(attr: string, old: string, value: string){
    const prop = propName(attr);
    (this.graph as any)[prop] = value;
  }

  get vertices(): VertexElement[] {
    return this.querySelectorAll('vertex-el') as unknown as VertexElement[];
  }

  get edges(): EdgeElement[] {
    return this.querySelectorAll('edge-el') as unknown as EdgeElement[];
  }

  get selectedVertices(): VertexElement[] {
    return [...this.vertices].filter((el => (el as VertexElement).selected)) as unknown as  VertexElement[];
  }

  get selectedEdges(): EdgeElement[] {
    return [...this.edges].filter((el => (el as EdgeElement).selected)) as unknown as EdgeElement[];
  }

  private hasChildWithId(id: string): boolean {
    return this.querySelector(`[id="${CSS.escape(id)}"]`) !== null;
  }

  private nextId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }

  addVertex(options: VertexOptions = {}){
    const vertexEl = document.createElement('vertex-el') as VertexElement;
    if(!options.id){
      options.id = this.nextId('vertex');
    }
    while(this.hasChildWithId(String(options.id))){
      options.id = this.nextId('vertex');
    }
    for(let prop of Object.keys(options)){
      if((options as any)[prop] !== null){
        vertexEl.setAttribute(prop, String((options as any)[prop]));
      }
    }
    
    this.appendChild(vertexEl);
    return vertexEl;
  }

  addEdge(sourceSel: string | VertexElement, targetSel: string | VertexElement, options: EdgeOptions = {}){
    sourceSel = sourceSel instanceof VertexElement ? `#${sourceSel.getAttribute('id')}` : sourceSel.startsWith('#') ? sourceSel : `#${sourceSel}`;
    targetSel = targetSel instanceof VertexElement ? `#${targetSel.getAttribute('id')}` : targetSel.startsWith('#') ? targetSel : `#${targetSel}`;

    const edgeEl = document.createElement('edge-el') as EdgeElement;

    edgeEl.setAttribute('source', sourceSel);
    edgeEl.setAttribute('target', targetSel);

    if(!options.id){
      options.id = this.nextId('edge');
    }
    while(this.hasChildWithId(String(options.id))){
      options.id = this.nextId('edge');
    }

    for(let prop of Object.keys(options)){
      if(prop === 'sourceId' || prop === 'targetId') continue;
      if((options as any)[prop] !== null){
        edgeEl.setAttribute(prop, (options as any)[prop]);
      }
    }

    this.appendChild(edgeEl);
    return edgeEl;
  }

  removeVertex(sel: string | VertexElement): void {
    let vertex: VertexElement | null = null;

    if(typeof sel === 'string'){
      const selector = sel.startsWith('#') ? sel : `#${sel}`;
      vertex = this.querySelector(selector) as VertexElement;
    }else if(sel instanceof VertexElement){
      vertex = sel;
    }

    if(!vertex) return;

    vertex.edges.forEach(edge => edge.remove())
    vertex.remove();
  }

  removeEdge(sel: string | EdgeElement): void {
    let edge: EdgeElement | null = null;

    if(typeof sel === 'string'){
      const selector = sel.startsWith('#') ? sel : `#${sel}`;
      edge = this.querySelector(selector) as EdgeElement;
    }else if(sel instanceof EdgeElement){
      edge = sel;
    }

    if(!edge) return;

    edge.source?.edges.delete(edge);
    edge.target?.edges.delete(edge);
    
    edge.remove();
  }

  clear(): void {
    for(let edge of this.graph.edges){
      edge.remove();
    }

    for(let vertex of this.graph.vertices){
      vertex.remove();
    }
  }

  get backgroundColor(): string {
    return this.getAttribute('background-color') ?? 'white';
  }

  set backgroundColor(val: string | number){
    this.setAttribute('background-color', String(val));
  }
}

if(!customElements.get('graph-el')){
  customElements.define('graph-el', GraphElement);
}