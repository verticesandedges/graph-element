import { Edge, EdgeId, EdgeOptions } from '../layout/scene-edge';
import './vertex-element';
import type { VertexElement } from './vertex-element';
import './graph-element';
import type { GraphElement } from './graph-element';

function propName(attrStr: string){
  return attrStr.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

function readColor(value: string | null, fallback: any) {
  if (value == null) return fallback;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : value;
}

export class EdgeElement extends HTMLElement {
  static observedAttributes = ['arrow', 'spline', 'visible', 'color', 'width', 'label', 'strength'];
  edge!: Edge;
  source!: VertexElement;
  target!: VertexElement;

  constructor(){
    super();

    // for(let attr of EdgeElement.observedAttributes){
    //   const prop = propName(attr);
    //   Object.defineProperty(this, prop, {
    //     get: () => this.edge[prop],
    //     set: (value: any) => this.edge[prop] = value
    //   });
    // }
  }

  get arrow(){ return this.edge.arrow; }
  set arrow(v){ this.edge.arrow = v; }

  get spline(){ return this.edge.spline; }
  set spline(v){ this.edge.spline = v; }

  get visible(){ return this.edge.visible; }
  set visible(v){ this.edge.visible = v; }

  get color(){ return this.edge.color; }
  set color(v){ 
    if(!this.edge){
      this.setAttribute('color', String(v));
      return;
    }  
    
    this.edge.color = v; 
  }

  get width(){ return this.edge.width; }
  set width(v){ this.edge.width = v; }

  get label(){ return (this.edge.label instanceof HTMLElement ? this.edge.label.innerHTML : this.edge.label) ?? null; }
  set label(v){ if(v !== null) this.edge.label = v; }

  get strength(){ return this.edge.strength; }
  set strength(v){ this.edge.strength = v; }

  get selected(){
    return this.source.selected && this.target.selected;
  }

  toJSON(){
    return {
      sourceId: this.source.id,
      targetId: this.target.id,
      id: this.edge.id,
      color: this.color,
      arrow: this.arrow,
      width: this.width,      
      label: this.label,
      strength: this.strength,
      visible: this.visible,
      spline: this.spline
    }
  }

  connectedCallback(){
    const parent = this.parentElement as GraphElement;

    const initialize = () => {
      if(!parent?.graph) return;
      
      const [sourceId, targetId]= this.readPoints();
      if(!sourceId || !targetId) return;

      const options = this.readAttributes();
      this.edge = parent.graph.addEdge(sourceId, targetId, options);

      this.source = parent.querySelector(`#${CSS.escape(sourceId)}`) as VertexElement;
      this.target = parent.querySelector(`#${CSS.escape(targetId)}`) as VertexElement;

      this.source?.edges.add(this);
      this.target?.edges.add(this);
    };

    if(parent?.graph){
      initialize();
    }else{
      setTimeout(initialize, 0);
    }
  }

  attributeChangedCallback(attr: string, old: string, value: string){
    if(!this.isConnected || !this.edge || value === null) return;

    const prop = propName(attr);
    if(attr === 'arrow' || attr === "spline" || attr === "visible"){
      (this.edge as any)[prop] = value === 'true';
      return;
    }

    if(attr === 'width'){
      this.edge.width = parseFloat(value);
      return;
    }

    (this.edge as any)[prop] = value;
  }

  disconnectedCallback(){
    this.edge.remove();
    // const parent = this.parentElement;
    // (parent as GraphElement)?.removeEdge(this);
  }

  readPoints(): string[] {
    const sourceSel = this.getAttribute('source')!;
    const targetSel = this.getAttribute('target')!;

    const sourceEl = this.parentElement?.querySelector(sourceSel)!;
    const targetEl = this.parentElement?.querySelector(targetSel)!;

    const sourceId = sourceEl.getAttribute('id');
    const targetId = targetEl.getAttribute('id');

    // const sourceEl = this.parentElement?.querySelector<VertexElement>(sourceSel);
    // const targetEl = this.parentElement?.querySelector<VertexElement>(targetSel);
    // const sourceId: string = sourceEl!.vertex.id;
    // const targetId: string = targetEl!.vertex.id;

    return [sourceId, targetId];
  }

  readAttributes(){
    const parent = this.parentElement as GraphElement;

    const [sourceId, targetId] = this.readPoints();
    const options: EdgeOptions = {
      id: this.getAttribute('id') ?? Edge.id(),
      sourceId,
      targetId,
      arrow: this.hasAttribute('arrow') ? this.getAttribute('arrow') == 'true' : parent.graph.defaults.edge.arrow,
      spline: this.hasAttribute('spline') ? this.getAttribute('spline') == 'true' : parent.graph.defaults.edge.spline,
      visible: this.hasAttribute('visible') ? this.getAttribute('visible') == 'true' : parent.graph.defaults.edge.visible,
      color: readColor(this.getAttribute('color'), parent.graph.defaults.edge.color),
      width: this.hasAttribute('width') ? parseFloat(this.getAttribute('width')!) : parent.graph.defaults.edge.width,
      label: this.getAttribute('label') ?? parent.graph.defaults.edge.label,
      strength: this.hasAttribute('strength') ? parseFloat(this.getAttribute('strength')!) : parent.graph.defaults.edge.strength
    }

    return options;
  }
}

if(!customElements.get('edge-el')){
  customElements.define('edge-el', EdgeElement);
}