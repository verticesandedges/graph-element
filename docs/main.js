import {Mesh as $8Jfye$Mesh, BoxGeometry as $8Jfye$BoxGeometry, MeshPhongMaterial as $8Jfye$MeshPhongMaterial, Group as $8Jfye$Group, TextureLoader as $8Jfye$TextureLoader, Color as $8Jfye$Color, Scene as $8Jfye$Scene, HemisphereLight as $8Jfye$HemisphereLight, PerspectiveCamera as $8Jfye$PerspectiveCamera, WebGLRenderer as $8Jfye$WebGLRenderer, Vector2 as $8Jfye$Vector2, Raycaster as $8Jfye$Raycaster, Vector3 as $8Jfye$Vector3, Matrix3 as $8Jfye$Matrix3} from "three";
import {Group as $8Jfye$Group1, CatmullRomCurve3 as $8Jfye$CatmullRomCurve3, CylinderGeometry as $8Jfye$CylinderGeometry, MeshBasicMaterial as $8Jfye$MeshBasicMaterial, Mesh as $8Jfye$Mesh1} from "three/build/three.module";
import {Line2 as $8Jfye$Line2} from "three/examples/jsm/lines/Line2";
import {LineGeometry as $8Jfye$LineGeometry} from "three/examples/jsm/lines/LineGeometry";
import {LineMaterial as $8Jfye$LineMaterial} from "three/examples/jsm/lines/LineMaterial";
import {OrbitControls as $8Jfye$OrbitControls} from "three/examples/jsm/controls/OrbitControls.js";
import {SelectionBox as $8Jfye$SelectionBox} from "three/examples/jsm/interactive/SelectionBox.js";
import {SelectionHelper as $8Jfye$SelectionHelper} from "three/examples/jsm/interactive/SelectionHelper.js";


class $7f86b8c0dd26ac2d$export$3e8a3cc8713efbec {
    static nextId = 0;
    static resetId() {
        $7f86b8c0dd26ac2d$export$3e8a3cc8713efbec.nextId = 0;
    }
    static id() {
        return `vertex-${++$7f86b8c0dd26ac2d$export$3e8a3cc8713efbec.nextId}`;
    }
    #id = null;
    #edges = new Set();
    #graph;
    #cube = null;
    #wire = null;
    #group = null;
    #texture = null;
    #label = null;
    #color;
    #size = null;
    #spline = null;
    constructor(graph, options){
        this.#graph = graph;
        this.#id = options?.id ?? $7f86b8c0dd26ac2d$export$3e8a3cc8713efbec.id();
        options = Object.assign({}, graph.defaults.vertex, options);
        this.#cube = new $8Jfye$Mesh(new $8Jfye$BoxGeometry(1, 1, 1), new $8Jfye$MeshPhongMaterial({
            "color": options.color
        }));
        this.#cube.name = 'cube';
        this.#spline = options.spline ?? false;
        this.#wire = new $8Jfye$Mesh(new $8Jfye$BoxGeometry(1.25, 1.25, 1.25), new $8Jfye$MeshPhongMaterial({
            wireframe: true,
            "color": options.selectionColor
        }));
        this.#wire.visible = false;
        this.#wire.name = 'wire';
        this.#group = new $8Jfye$Group();
        this.#group.name = 'vertex-cube';
        this.#group.add(this.#cube);
        this.#group.add(this.#wire);
        this.#group.userData.id = this.id;
        this.#group.userData.vertex = this;
        Object.assign(this, options);
    }
    // returns true if this is a vertex meant for calculating splines and is thus not rendered nor listed
    get spline() {
        return this.#spline;
    }
    set spline(val) {
        this.#spline = val;
    }
    get edges() {
        return this.#edges;
    }
    get graph() {
        return this.#graph;
    }
    get group() {
        return this.#group;
    }
    get id() {
        return this.#id;
    }
    set id(val) {
        this.#id = val;
    }
    get color() {
        return (this.#cube?.material).color.getHex();
    }
    set color(color) {
        (this.#cube?.material).color.set(color);
        this.#color = color;
    }
    resetColor(color) {
        console.assert(this.#cube !== null, "Cube not defined");
        const material = new $8Jfye$MeshPhongMaterial({
            color: color
        });
        this.#cube.material = material;
        this.#cube.material.needsUpdate = true;
    }
    get texture() {
        return this.#texture;
    }
    set texture(src) {
        if (!src) {
            const material = new $8Jfye$MeshPhongMaterial({
                color: this.color
            });
            this.#cube.material = material;
            this.#cube.material.needsUpdate = true;
            this.#texture = null;
            return;
        }
        const loader = new $8Jfye$TextureLoader();
        const texture = loader.load(src);
        const material = new $8Jfye$MeshPhongMaterial({
            map: texture
        });
        this.#cube.material = material;
        this.#cube.material.needsUpdate = true;
        this.#texture = src;
    }
    get selectionColor() {
        return this.#wire.material.color.getHex();
    }
    set selectionColor(color) {
        this.#wire.material.color.set(color);
    }
    get size() {
        return this.#size;
    }
    set size(value) {
        this.#size = value;
        this.#group.scale.set(value, value, value);
    }
    get selected() {
        return this.#wire.visible;
    }
    set selected(value) {
        this.#wire.visible = value;
        if (value) this.#graph.selected.add(this);
        else this.#graph.selected.delete(this);
    }
    get visible() {
        if (typeof this.#group.visible === 'boolean') return this.#group.visible;
        else if (typeof this.#group.visible === 'string') return this.#group.visible === 'true';
        else if (typeof this.#group.visible === 'number') return this.#group.visible !== 0;
        return false;
    }
    set visible(value) {
        if (typeof value === 'boolean') this.#group.visible = value;
        else if (typeof value === 'string') this.#group.visible = value === 'true';
        else if (typeof value === 'number') this.#group.visible = value !== 0;
    }
    toJSON() {
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
    get pos() {
        return this.#group?.position;
    }
    set pos(val) {
        this.#group.position.copy(val);
    }
    get label() {
        return this.#label;
    }
    set label(text) {
        this.#label?.remove();
        if (typeof text === 'string' && text.length > 0) {
            const label = document.createElement('label');
            label.innerText = text;
            (this.#graph?.parent).appendChild(label);
            label.style.display = 'block';
            label.style.zIndex = '1';
            label.style.position = 'fixed';
            this.#label = label;
        }
        if (text instanceof HTMLLabelElement) {
            const label = text;
            (this.#graph?.parent).appendChild(label);
            label.style.display = 'block';
            label.style.zIndex = '1';
            label.style.position = 'fixed';
            this.#label = label;
        }
    }
    update() {
        this.pos = this.#graph?.dynamicMatching.vertices.get(this.id)?.position;
    }
    remove() {
        this.#graph.removeVertex(this.id);
        this.#cube?.geometry.dispose();
        (this.#cube?.material).dispose();
        this.#wire?.geometry.dispose();
        (this.#wire?.material).dispose();
    }
    // aliases
    get position() {
        return this.pos;
    }
    set position(pos) {
        this.pos.set(pos.x, pos.y, pos.z);
    }
}


function $854bed0ac3c3a143$var$propName(attrStr) {
    return attrStr.replace(/-([a-z])/g, (match, letter)=>letter.toUpperCase());
}
function $854bed0ac3c3a143$var$readColor(value, fallback) {
    if (value == null) return fallback;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : value;
}
class $854bed0ac3c3a143$export$ed30cc242fc1c50a extends HTMLElement {
    static observedAttributes = [
        'color',
        'texture',
        'selection-color',
        'size',
        'label',
        'visible',
        'selected',
        'spline'
    ];
    vertex;
    edges = new Set();
    constructor(){
        super();
    // for(let attr of VertexElement.observedAttributes){
    //   const prop = propName(attr);
    //   Object.defineProperty(this, prop, {
    //     get: () => this.vertex[prop],
    //     set: (value: any) => this.vertex[prop] = value
    //   });
    // }
    }
    get color() {
        return this.vertex.color;
    }
    set color(v) {
        this.vertex.color = v;
    }
    get texture() {
        return this.vertex.texture;
    }
    set texture(v) {
        this.vertex.texture = v;
    }
    get selectionColor() {
        return this.vertex.selectionColor;
    }
    set selectionColor(v) {
        this.vertex.selectionColor = v;
    }
    get size() {
        return this.vertex.size;
    }
    set size(v) {
        this.vertex.size = v;
    }
    get label() {
        return (this.vertex.label instanceof HTMLElement ? this.vertex.label.innerHTML : this.vertex.label) ?? null;
    }
    set label(v) {
        if (v !== null) this.vertex.label = v;
    }
    get visible() {
        return this.vertex.visible;
    }
    set visible(v) {
        this.vertex.visible = v;
    }
    get selected() {
        return this.vertex.selected;
    }
    set selected(v) {
        this.toggleAttribute('selected', v);
        this.vertex.selected = v;
    }
    get spline() {
        return this.vertex.spline;
    }
    set spline(v) {
        this.vertex.spline = v;
    }
    toJSON() {
        return {
            id: this.vertex.id,
            color: this.color,
            texture: this.texture,
            size: this.size,
            label: this.label,
            visible: this.visible,
            spline: this.spline,
            selected: this.selected,
            selectionColor: this.selectionColor
        };
    }
    connectedCallback() {
        const parent = this.parentElement;
        if (parent && parent.graph) {
            const options = this.readAttributes();
            this.vertex = parent.graph.addVertex(options);
            this.setAttribute('id', this.vertex.id);
        } else setTimeout(()=>{
            if (parent?.graph) {
                const options = this.readAttributes();
                this.vertex = parent.graph.addVertex(options);
                this.setAttribute('id', this.vertex.id);
            }
        }, 0);
    }
    disconnectedCallback() {
        this.vertex.remove();
    }
    attributeChangedCallback(attr, old, value) {
        if (!this.isConnected || !this.vertex) return;
        const prop = $854bed0ac3c3a143$var$propName(attr);
        this.vertex[prop] = value;
    }
    readAttributes() {
        const parent = this.parentElement;
        const vo = {
            id: this.getAttribute('id') ?? (0, $7f86b8c0dd26ac2d$export$3e8a3cc8713efbec).id(),
            color: $854bed0ac3c3a143$var$readColor(this.getAttribute('color'), parent.graph.defaults.vertex.color),
            texture: this.getAttribute('texture') ?? parent.graph.defaults.vertex.texture,
            selectionColor: $854bed0ac3c3a143$var$readColor(this.getAttribute('selection-color'), parent.graph.defaults.vertex.selectionColor),
            size: this.hasAttribute('size') ? parseFloat(this.getAttribute('size')) : parent.graph.defaults.vertex.size,
            label: this.getAttribute('label') ?? parent.graph.defaults.vertex.label,
            visible: this.hasAttribute('visible') ? this.getAttribute('visible') == 'true' : parent.graph.defaults.vertex.visible,
            selected: this.hasAttribute('selected') ? this.getAttribute('selected') == 'true' : parent.graph.defaults.vertex.selected,
            spline: this.hasAttribute('spline') ? this.getAttribute('spline') == 'true' : parent.graph.defaults.vertex.spline
        };
        return vo;
    }
}
if (!customElements.get('vertex-el')) customElements.define('vertex-el', $854bed0ac3c3a143$export$ed30cc242fc1c50a);








class $93afb3fc7beadade$export$a94506fb574265ab {
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
   */ static generateLine(from, to, options) {
        const group = new $8Jfye$Group1();
        group.name = 'edge-line';
        const geometry = new (0, $8Jfye$LineGeometry)();
        geometry.setFromPoints([
            from.position,
            to.position
        ]);
        const material = new (0, $8Jfye$LineMaterial)({
            color: options.color,
            linewidth: options.width
        });
        const line = new (0, $8Jfye$Line2)(geometry, material);
        line.name = 'line';
        group.add(line);
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
   */ static generateSpline(from, to, options, graph) {
        const group = new $8Jfye$Group1();
        group.name = 'edge-spline';
        // dynamicMatching.addVertex returns ids
        const stopA = graph.dynamicMatching.addVertex();
        const stopB = graph.dynamicMatching.addVertex();
        const stops = [
            graph.dynamicMatching.getVertex(stopA).position,
            graph.dynamicMatching.getVertex(stopB).position
        ];
        const edgeFromA = graph.dynamicMatching.addEdge((0, $10c5cfb2786d5ccb$export$b9d9805c9b77a56d).id(), from.id, stopA, 1.0);
        const edgeAB = graph.dynamicMatching.addEdge((0, $10c5cfb2786d5ccb$export$b9d9805c9b77a56d).id(), stopA, stopB, 1.0);
        const edgeBTo = graph.dynamicMatching.addEdge((0, $10c5cfb2786d5ccb$export$b9d9805c9b77a56d).id(), stopB, to.id, 1.0);
        const curve = new $8Jfye$CatmullRomCurve3([
            from.position,
            ...stops,
            to.position
        ], false, 'centripetal', 0.1);
        const geometry = new (0, $8Jfye$LineGeometry)();
        const points = curve.getPoints(20);
        geometry.setFromPoints(points);
        const material = new (0, $8Jfye$LineMaterial)({
            color: options.color,
            linewidth: options.width
        });
        const line = new (0, $8Jfye$Line2)(geometry, material);
        line.name = 'spline'; // todo search for line
        group.add(line);
        group.userData.stops = [
            stopA,
            stopB
        ];
        group.userData.segments = [
            edgeFromA,
            edgeAB,
            edgeBTo
        ];
        return group;
    }
    /**
   * @name generateArrow
   * Generates an arrow edge.
   * 
   * @param (LayoutVertex) from 
   * @param (LayoutVertex) to
   * @param (object) options 
   */ static generateArrow(from, to, options) {
        const group = new $8Jfye$Group1();
        group.name = 'edge-arrow';
        // create line
        const lineGeo = new (0, $8Jfye$LineGeometry)();
        lineGeo.setFromPoints([
            from.position,
            to.position
        ]);
        const lineMat = new (0, $8Jfye$LineMaterial)({
            color: options.color,
            linewidth: options.width
        });
        const line = new (0, $8Jfye$Line2)(lineGeo, lineMat);
        line.name = 'line';
        // create cone
        // const coneGeo = new three.CylinderGeometry(0, 0.5, 1);
        const coneGeo = new $8Jfye$CylinderGeometry(0, 0.2, 0.7);
        coneGeo.translate(0, -1, 0);
        coneGeo.rotateX(-Math.PI / 2);
        const coneMat = new $8Jfye$MeshBasicMaterial({
            color: options.color,
            toneMapped: false
        });
        const cone = new $8Jfye$Mesh1(coneGeo, coneMat);
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
   */ static generateSplarrow(from, to, options, graph) {
        const group = new $8Jfye$Group1();
        group.name = 'edge-splarrow';
        // line geometry & material
        const stopA = graph.dynamicMatching.addVertex();
        const stopB = graph.dynamicMatching.addVertex();
        const stops = [
            graph.dynamicMatching.getVertex(stopA).position,
            graph.dynamicMatching.getVertex(stopB).position
        ];
        const edgeFromA = graph.dynamicMatching.addEdge((0, $10c5cfb2786d5ccb$export$b9d9805c9b77a56d).id(), from.id, stopA);
        const edgeAB = graph.dynamicMatching.addEdge((0, $10c5cfb2786d5ccb$export$b9d9805c9b77a56d).id(), stopA, stopB);
        const edgeBTo = graph.dynamicMatching.addEdge((0, $10c5cfb2786d5ccb$export$b9d9805c9b77a56d).id(), stopB, to.id);
        const curve = new $8Jfye$CatmullRomCurve3([
            from.position,
            ...stops,
            to.position
        ], false, 'centripetal', 0.1);
        const splineGeo = new (0, $8Jfye$LineGeometry)();
        const points = curve.getPoints(20);
        splineGeo.setFromPoints(points);
        const splineMat = new (0, $8Jfye$LineMaterial)({
            color: options.color,
            linewidth: options.width
        });
        const spline = new (0, $8Jfye$Line2)(splineGeo, splineMat);
        spline.name = 'spline';
        // cone geometry & material
        const coneGeo = new $8Jfye$CylinderGeometry(0, 0.2, 0.7);
        coneGeo.translate(0, -1, 0);
        coneGeo.rotateX(-Math.PI / 2);
        const coneMat = new $8Jfye$MeshBasicMaterial({
            color: options.color,
            toneMapped: false
        });
        const cone = new $8Jfye$Mesh1(coneGeo, coneMat);
        cone.name = 'cone';
        group.add(spline);
        group.userData.stops = [
            stopA,
            stopB
        ];
        group.userData.segments = [
            edgeFromA,
            edgeAB,
            edgeBTo
        ];
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
   */ static updateArrow(group, from, to) {
        const line = group.getObjectByName('line');
        const cone = group.getObjectByName('cone');
        line.geometry.setFromPoints([
            from.pos,
            to.pos
        ]);
        cone.position.copy(to.pos);
        cone.lookAt(from.pos);
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
   */ static updateLine(group, from, to) {
        const line = group.getObjectByName('line');
        line.geometry.setFromPoints([
            from.pos,
            to.pos
        ]);
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
   */ static updateSpline(group, from, to, graph) {
        const spline = group.getObjectByName('spline');
        const stops = group.userData.stops.map((id)=>{
            return graph.dynamicMatching.getVertex(id).position;
        });
        const curve = new $8Jfye$CatmullRomCurve3([
            from.pos,
            ...stops,
            to.pos
        ], false, 'centripetal', 0.1);
        spline.geometry.setFromPoints(curve.getPoints(20));
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
   */ static updateSplarrow(group, from, to, graph) {
        const spline = group.getObjectByName('spline');
        const stops = group.userData.stops.map((id)=>{
            return graph.dynamicMatching.getVertex(id).position;
        });
        const curve = new $8Jfye$CatmullRomCurve3([
            from.pos,
            ...stops,
            to.pos
        ], false, 'centripetal', 0.1);
        spline.geometry.setFromPoints(curve.getPoints(20));
        // spline.geometry.needsUpdate = true;
        spline.geometry.attributes.instanceStart.needsUpdate = true;
        spline.geometry.attributes.instanceEnd.needsUpdate = true;
        const cone = group.getObjectByName('cone');
        cone.position.copy(to.pos);
        cone.lookAt(stops.at(-1));
    }
}



class $10c5cfb2786d5ccb$export$b9d9805c9b77a56d {
    static nextId = 0;
    static resetId() {
        $10c5cfb2786d5ccb$export$b9d9805c9b77a56d.nextId = 0;
    }
    static id() {
        return `edge-${++$10c5cfb2786d5ccb$export$b9d9805c9b77a56d.nextId}`;
    }
    #id;
    #graph;
    #line = null;
    #group;
    #source;
    #target;
    // visible -- access state through getters and setters
    #arrow = false;
    #color = 0x000;
    #width = 1.0;
    #label = null;
    #strength = 1.0;
    #spline = false;
    #splineVertices = new Array();
    #splineCurve = null;
    constructor(graph, source, target, options){
        console.assert(source instanceof (0, $7f86b8c0dd26ac2d$export$3e8a3cc8713efbec), 'Edge should have a source');
        console.assert(target instanceof (0, $7f86b8c0dd26ac2d$export$3e8a3cc8713efbec), 'Edge should have a target');
        this.#graph = graph;
        options = Object.assign({
            id: options?.id ?? $10c5cfb2786d5ccb$export$b9d9805c9b77a56d.id()
        }, options);
        this.#id = options.id ?? $10c5cfb2786d5ccb$export$b9d9805c9b77a56d.id();
        if (!this.#spline) this.#graph.dynamicMatching.addEdge(this.#id, source.id, target.id, options.strength);
        this.#source = source;
        this.#target = target;
        this.#arrow = options.arrow ?? false;
        this.#spline = options.spline ?? false;
        this.#strength = options.strength ?? 1.0;
        // choose a LineHelper fn to draw edge
        let fn;
        if (this.#arrow && !this.#spline) fn = (0, $93afb3fc7beadade$export$a94506fb574265ab).generateArrow;
        else if (this.#spline && !this.#arrow) fn = (0, $93afb3fc7beadade$export$a94506fb574265ab).generateSpline;
        else if (this.#spline && this.#arrow) fn = (0, $93afb3fc7beadade$export$a94506fb574265ab).generateSplarrow;
        else fn = (0, $93afb3fc7beadade$export$a94506fb574265ab).generateLine;
        // call the previously chosen LineHelper function
        this.#group = fn(this.#source, this.#target, options, this.#graph);
        this.#group.userData.id = this.id;
        this.#group.userData.edge = this;
        this.#source.edges.add(this);
        this.#target.edges.add(this);
        Object.assign(this, graph.defaults.edge, options);
    }
    get label() {
        return this.#label;
    }
    set label(text) {
        this.#label?.remove();
        if (typeof text === 'string' && text.length > 0) {
            const label = document.createElement('label');
            label.innerText = text;
            (this.#graph?.parent).appendChild(label);
            label.style.display = 'block';
            label.style.zIndex = '1';
            label.style.position = 'fixed';
            this.#label = label;
        }
        if (text instanceof HTMLLabelElement) {
            const label = text;
            (this.#graph?.parent).appendChild(label);
            label.style.display = 'block';
            label.style.zIndex = '1';
            label.style.position = 'fixed';
            this.#label = label;
        }
    }
    get source() {
        return this.#source;
    }
    get target() {
        return this.#target;
    }
    get options() {
        return {
            id: this.id,
            color: this.color,
            width: this.width,
            strength: this.strength,
            visible: this.visible,
            arrow: this.arrow,
            label: this.label
        };
    }
    get id() {
        return this.#id;
    }
    set id(val) {
        this.#id = val;
    }
    get group() {
        return this.#group;
    }
    get color() {
        return this.#color;
    }
    set color(color) {
        const c = new $8Jfye$Color(color).getHex();
        let line;
        if (this.#spline) line = this.#group.getObjectByName('spline');
        else line = this.#group.getObjectByName('line');
        line.material.color.set(color);
        line.material.needsUpdate = true;
        if (this.#arrow) {
            const cone = this.#group.getObjectByName('cone');
            cone.material.color.set(color);
            cone.material.needsUpdate = true;
        }
        this.#color = c;
    }
    get width() {
        return this.#width;
    }
    set width(value) {
        if (this.#spline) return;
        this.#width = value;
        const line = this.#group.getObjectByName('line');
        line.material.linewidth = value;
        line.material.needsUpdate = true;
    }
    get strength() {
        return this.#strength;
    // return this.#graph.dynamicMatching.edges.get( this.#id )!.strength;
    }
    set strength(val) {
        const edge = this.#graph.dynamicMatching.edges.get(this.#id);
        edge.strength = val;
        this.#strength = val;
    }
    get visible() {
        return this.#group.visible;
    }
    set visible(val) {
        this.#group.visible = val;
    }
    get arrow() {
        return this.#arrow;
    }
    set arrow(val) {
        if (val === this.#arrow) return;
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
        if (this.#spline) fn = val ? (0, $93afb3fc7beadade$export$a94506fb574265ab).generateSplarrow : (0, $93afb3fc7beadade$export$a94506fb574265ab).generateSpline;
        else fn = val ? (0, $93afb3fc7beadade$export$a94506fb574265ab).generateArrow : (0, $93afb3fc7beadade$export$a94506fb574265ab).generateLine;
        this.#group = fn(this.#source, this.#target, this.options, this.#graph);
        this.#group.userData.edge = this;
        parent?.add(this.#group);
        this.#arrow = val;
    }
    get spline() {
        return this.#spline;
    }
    set spline(val) {
        if (val === this.#spline) return;
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
        if (this.#arrow) fn = val ? (0, $93afb3fc7beadade$export$a94506fb574265ab).generateSplarrow : (0, $93afb3fc7beadade$export$a94506fb574265ab).generateArrow;
        else fn = val ? (0, $93afb3fc7beadade$export$a94506fb574265ab).generateSpline : (0, $93afb3fc7beadade$export$a94506fb574265ab).generateLine;
        this.#group = fn(this.#source, this.#target, this.options, this.#graph);
        this.#group.userData.edge = this;
        parent?.add(this.#group);
        this.#spline = val;
    }
    toJSON() {
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
    update() {
        const args = [
            this.#group,
            this.#source,
            this.#target,
            this.#graph
        ];
        switch(this.#group.name){
            case 'edge-line':
                (0, $93afb3fc7beadade$export$a94506fb574265ab).updateLine(...args);
                break;
            case 'edge-arrow':
                (0, $93afb3fc7beadade$export$a94506fb574265ab).updateArrow(...args);
                break;
            case 'edge-spline':
                (0, $93afb3fc7beadade$export$a94506fb574265ab).updateSpline(...args);
                break;
            case 'edge-splarrow':
                (0, $93afb3fc7beadade$export$a94506fb574265ab).updateSplarrow(...args);
                break;
        }
    }
    remove() {
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



/*
  layout.mjs
  
  Joshua M. Moore (2026)
  joshua.moore@verticesandedges.net


*/ 



// dynamic-matching.ts
// Joshua M. Moore
// joshua.moore@verticesandedges.net
//
// Implemented after Dynamic Multilevel Graph Visualization
// by Dr. Todd Veldhuizen (2007)

//#endregion
//#region Vector3
(0, $8Jfye$Vector3).prototype.transpose = function(v2) {
    return new (0, $8Jfye$Matrix3)().set(this.x * v2.x, this.x * v2.y, this.x * v2.z, this.y * v2.x, this.y * v2.y, this.y * v2.z, this.z * v2.x, this.z * v2.y, this.z * v2.z);
// return new Matrix3(
//   this.x, 0, 0,
//   0, this.y, 0,
//   0, 0, this.z
// );
};
(0, $8Jfye$Vector3).prototype.zeros = function() {
    this.x = 0;
    this.y = 0;
    this.z = 0;
};
//#endregion
//#region Matrix3
(0, $8Jfye$Matrix3).prototype.add = function(other) {
    for(let i = 0; i < 9; i++)this.elements[i] = (this.elements[i] ?? 0.0) + (other.elements[i] ?? 0.0);
    return this;
};
(0, $8Jfye$Matrix3).prototype.sub = function(other) {
    for(let i = 0; i < 9; i++)this.elements[i] = (this.elements[i] ?? 0.0) - (other.elements[i] ?? 0.0);
    return this;
};
(0, $8Jfye$Matrix3).prototype.multiplyVector = function(vector) {
    const e = this.elements;
    const x = vector.x, y = vector.y, z = vector.z;
    return new (0, $8Jfye$Vector3)(e[0] * x + e[3] * y + e[6] * z, e[1] * x + e[4] * y + e[7] * z, e[2] * x + e[5] * y + e[8] * z);
};
(0, $8Jfye$Matrix3).prototype.addVector = function(vector) {
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
};
(0, $8Jfye$Matrix3).prototype.zeros = function() {
    for(let i = 0; i < 9; i++)this.elements[i] = 0.0;
    return this;
};
class $40f3f8b290647dff$export$a002182e51710d39 {
    // For a connected pair, equilibrium is K*d ~= f0/d^2 => d ~= (f0/K)^(1/3).
    // With K=2.0e-2 and target d~25px, f0~3.125e2.
    static f0 = 3.125e+2;
    static K = 2.0e-0;
    static dt = 0.02;
    static D = 0.75;
    static epsilon = 0.10;
    static theta = 0.50;
    static phi = 0.15;
    static innerDistance = 100.0;
    //#region serialization
    static reset() {
        $40f3f8b290647dff$export$a002182e51710d39.fromJSON({
            K: 2.0e-2,
            f0: 3.125e+2,
            dt: 0.02,
            D: 0.75,
            epsilon: 0.1,
            theta: 0.5,
            phi: 0.15,
            innerDistance: 100.0
        });
    }
    static toJSON() {
        return {
            K: $40f3f8b290647dff$export$a002182e51710d39.K,
            f0: $40f3f8b290647dff$export$a002182e51710d39.f0,
            dt: $40f3f8b290647dff$export$a002182e51710d39.dt,
            D: $40f3f8b290647dff$export$a002182e51710d39.D,
            epsilon: $40f3f8b290647dff$export$a002182e51710d39.epsilon,
            theta: $40f3f8b290647dff$export$a002182e51710d39.theta,
            phi: $40f3f8b290647dff$export$a002182e51710d39.phi,
            innerDistance: $40f3f8b290647dff$export$a002182e51710d39.innerDistance
        };
    }
    static fromJSON(c) {
        $40f3f8b290647dff$export$a002182e51710d39.K = c.K;
        $40f3f8b290647dff$export$a002182e51710d39.f0 = c.f0;
        $40f3f8b290647dff$export$a002182e51710d39.dt = c.dt;
        $40f3f8b290647dff$export$a002182e51710d39.D = c.D;
        $40f3f8b290647dff$export$a002182e51710d39.epsilon = c.epsilon;
        $40f3f8b290647dff$export$a002182e51710d39.theta = c.theta;
        $40f3f8b290647dff$export$a002182e51710d39.phi = c.phi;
        $40f3f8b290647dff$export$a002182e51710d39.innerDistance = c.innerDistance;
    }
    static stringify() {
        return JSON.stringify($40f3f8b290647dff$export$a002182e51710d39.toJSON());
    }
    static parse(s) {
        $40f3f8b290647dff$export$a002182e51710d39.fromJSON(JSON.parse(s));
    }
}
class $40f3f8b290647dff$export$3e8a3cc8713efbec {
    id;
    static nextId = 0;
    static id() {
        return `vertex-${++$40f3f8b290647dff$export$3e8a3cc8713efbec.nextId}`;
    }
    static S = 10.0;
    acceleration;
    velocity;
    position;
    projectedAcceleration;
    projectedVelocity;
    projectedPosition;
    __displacement;
    _displacement;
    displacement;
    finers;
    coarser;
    edges;
    constructor(id = $40f3f8b290647dff$export$3e8a3cc8713efbec.id(), finers = new Set()){
        this.id = id;
        this.acceleration = new (0, $8Jfye$Vector3)();
        this.velocity = new (0, $8Jfye$Vector3)();
        this.position = new (0, $8Jfye$Vector3)(Math.random() * $40f3f8b290647dff$export$3e8a3cc8713efbec.S, Math.random() * $40f3f8b290647dff$export$3e8a3cc8713efbec.S, Math.random() * $40f3f8b290647dff$export$3e8a3cc8713efbec.S);
        this.projectedAcceleration = new (0, $8Jfye$Vector3)();
        this.projectedVelocity = new (0, $8Jfye$Vector3)();
        this.projectedPosition = new (0, $8Jfye$Vector3)(Math.random(), Math.random(), Math.random());
        this.__displacement = new (0, $8Jfye$Vector3)();
        this._displacement = new (0, $8Jfye$Vector3)();
        this.displacement = new (0, $8Jfye$Vector3)(Math.random(), Math.random(), Math.random());
        this.finers = new Set();
        this.edges = new Set();
        finers.forEach((finer)=>{
            this.finers.add(finer);
            finer.coarser = this;
        });
    }
    static repel(args) {
        const posA = args.source.position;
        const posB = args.target.position;
        const difference = new (0, $8Jfye$Vector3)().subVectors(posA, posB);
        const distance = Math.max(difference.length(), $40f3f8b290647dff$export$a002182e51710d39.epsilon);
        // Scale by 1/r^3 on the direction vector so force magnitude becomes 1/r^2.
        return difference.multiplyScalar($40f3f8b290647dff$export$a002182e51710d39.f0 / Math.pow(distance, 3));
    }
    merge(other) {
    // this.finers = this.finers.union(other.finers);
    }
    updateSingle() {
        this.acceleration.multiplyScalar($40f3f8b290647dff$export$a002182e51710d39.dt);
        this.velocity.add(this.acceleration);
        this.velocity.multiplyScalar($40f3f8b290647dff$export$a002182e51710d39.D);
        this.position.add(this.velocity);
        this.acceleration.set(0, 0, 0);
    }
}
class $40f3f8b290647dff$export$b9d9805c9b77a56d {
    id;
    source;
    target;
    static nextId = 0;
    static id() {
        return `edge-${++$40f3f8b290647dff$export$b9d9805c9b77a56d.nextId}`;
    }
    priority;
    count;
    coarser;
    #strength;
    constructor(id = $40f3f8b290647dff$export$b9d9805c9b77a56d.id(), source, target, strength = 1.0){
        this.id = id;
        this.source = source;
        this.target = target;
        this.priority = Math.random();
        this.count = 1;
        this.#strength = 1.0;
        this.#strength = strength;
    }
    get strength() {
        return this.#strength;
    }
    set strength(val) {
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
    static attract(args) {
        const v1 = args.source.position;
        const v2 = args.target.position;
        const difference = new (0, $8Jfye$Vector3)().subVectors(v2, v1);
        const distance = Math.max(difference.length(), $40f3f8b290647dff$export$a002182e51710d39.epsilon);
        const strength = args.strength;
        // Hooke-like spring attraction: linear in distance.
        return difference.normalize().multiplyScalar($40f3f8b290647dff$export$a002182e51710d39.K * distance * strength);
    }
    sharesVertex(other) {
        return this.source.id === other.source.id || this.source.id === other.target.id || this.target.id === other.source.id || this.target.id === other.target.id;
    }
    implies(other) {
        return this.priority < other.priority && this.sharesVertex(other);
    }
}
class $40f3f8b290647dff$export$496119a8707366b3 {
    boundaryCenter;
    width;
    depth;
    inners;
    outers;
    centerSum;
    #size;
    constructor(boundaryCenter = new (0, $8Jfye$Vector3)(0, 0, 0), width = 2000, depth = 0){
        this.boundaryCenter = boundaryCenter;
        this.width = width;
        this.depth = depth;
        this.inners = new Set();
        this.outers = new Map();
        this.centerSum = new (0, $8Jfye$Vector3)(0, 0, 0);
        this.#size = 0;
    }
    center() {
        if (this.#size === 0) return this.boundaryCenter.clone();
        return this.centerSum.clone().divideScalar(this.#size);
    }
    get position() {
        return this.center();
    }
    get size() {
        return this.#size;
    }
    getOctant(pos) {
        var c = this.boundaryCenter;
        var x = pos.x >= c.x ? 'r' : 'l';
        var y = pos.y >= c.y ? 'u' : 'd';
        var z = pos.z >= c.z ? 'i' : 'o';
        return `${x}${y}${z}`;
    }
    ensureChildren() {
        if (this.width < 0.000001 || this.depth > 20) return;
        if (this.outers.size === 0) {
            const childWidth = this.width / 2;
            const offset = this.width / 4;
            const c = this.boundaryCenter;
            const shifts = {
                l: -offset,
                r: offset,
                d: -offset,
                u: offset,
                o: -offset,
                i: offset
            };
            for (let x of [
                'l',
                'r'
            ]){
                for (let y of [
                    'd',
                    'u'
                ])for (let z of [
                    'o',
                    'i'
                ]){
                    const key = `${x}${y}${z}`;
                    this.outers.set(key, new $40f3f8b290647dff$export$496119a8707366b3(new (0, $8Jfye$Vector3)(c.x + shifts[x], c.y + shifts[y], c.z + shifts[z]), childWidth, this.depth + 1));
                }
            }
        }
    }
    insert(vertex) {
        this.centerSum.add(vertex.position);
        if (this.#size === 0) {
            this.inners.add(vertex);
            this.#size = 1;
            return;
        }
        if (this.depth >= 20 || this.width < 0.000001) {
            this.inners.add(vertex);
            this.#size++;
            return;
        }
        if (this.#size === 1 && this.inners.size > 0) {
            const resident = [
                ...this.inners.values()
            ][0];
            this.inners.clear();
            this.ensureChildren();
            const resOct = this.getOctant(resident.position);
            this.outers.get(resOct).insert(resident);
        }
        this.ensureChildren();
        const octant = this.getOctant(vertex.position);
        const child = this.outers.get(octant);
        if (child) child.insert(vertex);
        else this.inners.add(vertex);
        this.#size++;
    }
    estimate(v, forceFn) {
        const f = new (0, $8Jfye$Vector3)();
        if (this.inners.size > 0) {
            this.inners.forEach((inner)=>{
                if (inner.id !== v.id) f.add(forceFn({
                    source: v,
                    target: inner
                }));
            });
            return f;
        }
        const dist = v.position.distanceTo(this.position);
        if (dist > 0 && this.width / dist < $40f3f8b290647dff$export$a002182e51710d39.theta) f.add(forceFn({
            source: v,
            target: this
        }).multiplyScalar(this.#size));
        else this.outers.forEach((child)=>{
            if (child.#size > 0) f.add(child.estimate(v, forceFn));
        });
        return f;
    }
    dispose() {
        this.outers.forEach((o)=>o.dispose());
        this.outers.clear();
        this.inners.clear();
        this.#size = 0;
        this.centerSum.set(0, 0, 0);
    }
}
class $40f3f8b290647dff$export$8fbd1ac8e83536df {
    data = new Array();
    constructor(){}
    enqueue(item) {
        const index = this.data.findIndex((v)=>item.priority >= v.priority);
        this.data.splice(index - 1, 0, item);
    }
    dequeue() {
        return this.data.shift();
    }
    get empty() {
        return this.data.length === 0;
    }
}
class $40f3f8b290647dff$export$cd8999526d73645f {
    levels;
    octree;
    pq;
    matching;
    vertices;
    edges;
    coarser;
    __alpha;
    _alpha;
    alpha;
    __beta;
    _beta;
    beta;
    constructor(levels = 0){
        this.levels = levels;
        this.octree = new $40f3f8b290647dff$export$496119a8707366b3();
        this.pq = new $40f3f8b290647dff$export$8fbd1ac8e83536df();
        this.matching = new Set;
        this.vertices = new Map();
        this.edges = new Map();
        this.__alpha = new (0, $8Jfye$Matrix3)();
        this._alpha = new (0, $8Jfye$Matrix3)();
        this.alpha = new (0, $8Jfye$Matrix3)();
        this.__beta = new (0, $8Jfye$Vector3)();
        this._beta = new (0, $8Jfye$Vector3)();
        this.beta = new (0, $8Jfye$Vector3)();
        if (levels > 0) this.coarser = new $40f3f8b290647dff$export$cd8999526d73645f(this.levels - 1);
    }
    singleLevelLayoutCPU() {
        // estimate repulsion forces
        const vertices = Array.from(this.vertices.values());
        const octree = new $40f3f8b290647dff$export$496119a8707366b3();
        for (const vertex of vertices)octree.insert(vertex);
        for (const vertex of vertices){
            const force = octree.estimate(vertex, $40f3f8b290647dff$export$3e8a3cc8713efbec.repel);
            vertex.acceleration.add(force);
        }
        // calculate attraction forces
        const edges = Array.from(this.edges.values());
        for (const edge of edges){
            const force = $40f3f8b290647dff$export$b9d9805c9b77a56d.attract(edge);
            edge.source.acceleration.add(force);
            edge.target.acceleration.sub(force);
        }
        // add acceleration to velocity to position
        vertices.forEach((v)=>v.updateSingle());
    }
    singleLevelLayoutGPU() {}
    multiLevelLayout() {
        this.__alpha.zeros();
        this.__beta.set(0, 0, 0);
        this._alpha.zeros();
        this._beta.set(0, 0, 0);
        this.alpha.zeros();
        this.beta.set(0, 0, 0);
        this.vertices.forEach((y)=>{
            this.__alpha.add(y.position.transpose(y.displacement)).add(y.displacement.transpose(y.position));
            this.__beta.add(y.displacement);
        });
        this.__alpha.multiplyScalar(1.0 / this.vertices.size);
        this.__beta.multiplyScalar(1.0 / this.vertices.size);
        this._alpha.add(this.__alpha);
        this._beta.add(this.__beta);
        this.alpha.add(this._alpha);
        this.beta.add(this._beta);
        const __alpha = this.__alpha.clone();
        const _alpha = this._alpha.clone();
        const alpha = this.alpha.clone();
        const __beta = this.__beta.clone();
        const _beta = this._beta.clone();
        const beta = this.beta.clone();
        this.vertices.forEach((y)=>{
            y.finers.forEach((x)=>{
                const F = x.acceleration.clone();
                const Fd = x._displacement.clone().multiplyScalar(-$40f3f8b290647dff$export$a002182e51710d39.D);
                const acceleration = y.acceleration; // __position
                const velocity = y.velocity; // _position
                const position = y.position; // position
                x.projectedAcceleration.set(0, 0, 0).add(__beta).add(__alpha.multiplyVector(position)).add(_alpha.multiplyVector(velocity).multiplyScalar(2.0 * $40f3f8b290647dff$export$a002182e51710d39.phi)).add(alpha.multiplyVector(acceleration).multiplyScalar(Math.pow($40f3f8b290647dff$export$a002182e51710d39.phi, 2)));
                x.projectedVelocity.add(x.projectedAcceleration);
                x.projectedPosition.add(x.projectedVelocity);
                x.__displacement.copy(F.sub(x.projectedAcceleration).add(Fd));
                x._displacement.add(x.__displacement);
                x._displacement.multiplyScalar($40f3f8b290647dff$export$a002182e51710d39.D);
                x.displacement.add(x._displacement);
                x.position.copy(x.displacement.add(beta).add(__alpha.clone().multiplyVector(y.position)).add(_alpha.clone().multiplyVector(y.velocity).multiplyScalar($40f3f8b290647dff$export$a002182e51710d39.phi)).add(alpha.clone().multiplyVector(y.acceleration).multiplyScalar(Math.pow($40f3f8b290647dff$export$a002182e51710d39.phi, 2))));
                x.acceleration.set(0, 0, 0);
                x.projectedAcceleration.set(0, 0, 0);
            });
        });
    }
    addVertex(id = $40f3f8b290647dff$export$3e8a3cc8713efbec.id(), finers = new Set()) {
        const vertex = new $40f3f8b290647dff$export$3e8a3cc8713efbec(id, finers);
        this.octree.insert(vertex);
        this.vertices.set(vertex.id, vertex);
        if (this.coarser) this.processPQ();
        return vertex.id;
    }
    getVertex(id) {
        return this.vertices.get(id);
    }
    addEdge(id = $40f3f8b290647dff$export$b9d9805c9b77a56d.id(), sourceId, targetId, strength = 1.0) {
        const source = this.vertices.get(sourceId);
        const target = this.vertices.get(targetId);
        if (!source || !target) return "";
        let parentEdge;
        if (this.coarser) {
            let csid, ctid, ceid, coarseSource, coarseTarget, coarseEdge;
            // Source coarse representative
            if (source.coarser) {
                coarseSource = source.coarser;
                csid = source.coarser.id;
            } else {
                const coarseSourceId = this.coarser.addVertex($40f3f8b290647dff$export$3e8a3cc8713efbec.id());
                coarseSource = this.coarser.vertices.get(coarseSourceId);
                coarseSource.finers.add(source);
                source.coarser = coarseSource;
                csid = coarseSource.id;
            }
            // Target coarse representative
            if (target.coarser) {
                coarseTarget = target.coarser;
                ctid = target.coarser.id;
            } else {
                const coarseTargetId = this.coarser.addVertex($40f3f8b290647dff$export$3e8a3cc8713efbec.id());
                coarseTarget = this.coarser.vertices.get(coarseTargetId);
                coarseTarget.finers.add(target);
                target.coarser = coarseTarget;
                ctid = coarseTarget.id;
            }
            // Handle coarse dge strength accumulation
            coarseEdge = this.findEdge(coarseSource, coarseTarget);
            if (coarseEdge) {
                coarseEdge.count++;
                coarseEdge.strength += strength;
            } else {
                const newCeid = $40f3f8b290647dff$export$b9d9805c9b77a56d.id();
                this.coarser.addEdge(newCeid, csid, ctid, strength);
                coarseEdge = this.coarser.edges.get(newCeid);
            }
            parentEdge = coarseEdge;
        }
        // Create the actual edge for this level
        const edge = new $40f3f8b290647dff$export$b9d9805c9b77a56d(id, source, target, strength);
        if (parentEdge) edge.coarser = parentEdge;
        this.edges.set(id, edge);
        source.edges.add(edge);
        target.edges.add(edge);
        if (this.coarser) {
            this.pq.enqueue(edge);
            this.processPQ();
        }
        return edge.id;
    }
    getEdge(id) {
        return this.edges.get(id);
    }
    findEdge(ySource, yTarget) {
        const edges = new Set();
        ySource.edges.forEach((item)=>{
            if (yTarget.edges.has(item)) edges.add(item);
        });
        return [
            ...edges.values()
        ][0];
    }
    removeVertex(id) {
        const vertex = this.vertices.get(id);
        vertex?.edges.forEach((e)=>this.removeEdge(e.id));
        this.vertices.delete(id);
        if (this.coarser) this.processPQ();
    }
    removeEdge(id) {
        const e = this.edges.get(id);
        if (!e) return;
        if (this.coarser) {
            if (this.matching.has(e)) {
                this.unmatch(e);
                const ce = this.coarser.findEdge(e.source.coarser, e.target.coarser);
                ce.count--;
                ce.strength -= e.strength;
                if (ce.count === 0) this.coarser.edges.delete(ce.id);
                if (e.source.edges.size === 1) this.coarser?.removeVertex(e.source.coarser.id);
                if (e.target.edges.size === 1) this.coarser?.removeVertex(e.target.coarser.id);
            }
            this.edges.forEach((e_)=>{
                if (e.implies(e_)) this.pq.enqueue(e_);
            });
        }
        e.source.edges.delete(e);
        e.target.edges.delete(e);
        this.edges.delete(e.id);
        if (this.coarser) this.processPQ();
    }
    match(e) {
        if (this.coarser) {
            this.edges.forEach((e_)=>{
                if (e.implies(e_) && this.matching.has(e_)) this.unmatch(e_);
            });
            // Remove the old coarse vertex
            this.coarser.removeVertex(e.source.coarser.id);
            this.coarser.removeVertex(e.target.coarser.id);
            // Create new union vertex
            const vsutid = this.coarser.addVertex(); // union between source and target vertices
            const vsut = this.coarser.vertices.get(vsutid);
            vsut.finers.add(e.source);
            vsut.finers.add(e.target);
            e.source.coarser = vsut;
            e.target.coarser = vsut;
            const incidentEdges = new Set([
                ...e.source.edges,
                ...e.target.edges
            ]);
            incidentEdges.forEach((incident)=>{
                if (incident.id === e.id) return;
                const neighbor = incident.source === e.source || incident.source === e.target ? incident.target : incident.source;
                if (neighbor.coarser) this.coarser.addEdge($40f3f8b290647dff$export$b9d9805c9b77a56d.id(), vsutid, neighbor.coarser.id, incident.strength);
            });
        }
        this.edges.forEach((e_)=>{
            if (e.implies(e_)) this.pq.enqueue(e_);
        });
    }
    unmatch(e) {
        const sut = e.source.coarser;
        // clear the coarse incident edges
        sut.edges.forEach((ie)=>{
            this.coarser.removeEdge(ie.id);
        });
        this.coarser.removeVertex(sut.id);
        // re-create the two distinct coarse vertices
        const sid = this.coarser.addVertex();
        const tid = this.coarser.addVertex();
        e.source.coarser = this.coarser.vertices.get(sid);
        e.target.coarser = this.coarser.vertices.get(tid);
        // Re-add the fine edges between them them with original strengths
        e.source.edges.forEach((fe)=>{
            const neighbor = fe.source === e.source ? fe.target : fe.source;
            if (neighbor.coarser) this.coarser.addEdge($40f3f8b290647dff$export$b9d9805c9b77a56d.id(), sid, neighbor.coarser.id, fe.strength);
        });
        e.target.edges.forEach((fe)=>{
            const neighbor = fe.source === e.target ? fe.target : fe.source;
            if (neighbor.coarser) this.coarser.addEdge($40f3f8b290647dff$export$b9d9805c9b77a56d.id(), tid, neighbor.coarser.id, fe.strength);
        });
        this.edges.forEach((e_)=>{
            if (e.implies(e_)) this.pq.enqueue(e_);
        });
    }
    matchEquation(e) {
        let m = true;
        this.edges.forEach((e_)=>{
            if (e_.implies(e)) m = m && !this.matching.has(e_);
        });
        return m;
    }
    processPQ() {
        while(!this.pq.empty){
            const e = this.pq.dequeue();
            const m = this.matchEquation(e);
            if (m !== this.matching.has(e)) {
                if (m) this.match(e);
                else this.unmatch(e);
            }
        }
    }
    update() {
        if (this.coarser) {
            this.coarser.update();
            this.multiLevelLayout();
        } else this.singleLevelLayoutCPU();
    }
}




const $25151b2351682303$var$wait = async function(delay) {
    return new Promise((resolve, reject)=>setTimeout(resolve, delay));
};
class $25151b2351682303$export$614db49f3febe941 {
    //#region fields
    #parent;
    #scene;
    #skyColor;
    #groundColor;
    #intensity;
    #light;
    #camera;
    #renderer;
    #controls;
    #vertices = new Map();
    #edges = new Map();
    dynamicMatching = new (0, $40f3f8b290647dff$export$cd8999526d73645f)(0);
    selected = new Set();
    #selectionBox;
    #selectionHelper;
    #constants = (0, $40f3f8b290647dff$export$a002182e51710d39).toJSON();
    //#endregion
    constructor(elem){
        this.#parent = elem;
        // using the threejs library to create a scene
        this.#scene = new $8Jfye$Scene();
        // light
        this.#skyColor = 0xffffff;
        this.#groundColor = 0x878787;
        this.#intensity = 85.0;
        this.#light = new $8Jfye$HemisphereLight(this.#skyColor, this.#groundColor);
        this.#scene.add(this.#light);
        // the camera lets us look into the scene
        this.#camera = new $8Jfye$PerspectiveCamera(75, elem.clientWidth / elem.clientHeight, 0.1, 1000);
        this.#camera.position.z = 25;
        // the renderer renders the scene onto a canvas element
        this.#renderer = new $8Jfye$WebGLRenderer({
            antialias: true
        });
        this.#renderer.setSize(elem.clientWidth, elem.clientHeight);
        this.#renderer.setPixelRatio(elem.clientWidth / elem.clientHeight);
        // this.#renderer.setClearColor( 'transparent' );
        this.#renderer.setClearAlpha(0x00000000);
        this.#renderer.domElement.style.width = '100%';
        this.#renderer.domElement.style.height = '100%';
        this.#renderer.domElement.style.display = 'block';
        this.#renderer.domElement.style.backgroundColor = 'rgba(ff, ff, ff, 0%)';
        this.#renderer.setAnimationLoop(this.#animate.bind(this));
        this.#controls = new (0, $8Jfye$OrbitControls)(this.#camera, this.#renderer.domElement);
        elem.appendChild(this.#renderer.domElement);
        elem.addEventListener('resize', this.resize.bind(this));
        this.#renderer.domElement.addEventListener('click', this.#onClick.bind(this), false);
        this.#selectionBox = new (0, $8Jfye$SelectionBox)(this.#camera, this.#scene);
        this.#selectionHelper = new (0, $8Jfye$SelectionHelper)(this.#renderer, 'selectBox');
        this.canvas.addEventListener('pointerdown', this.onPointerdown.bind(this));
        this.canvas.addEventListener('pointermove', this.onPointermove.bind(this));
        this.canvas.addEventListener('pointerup', this.onPointerup.bind(this));
    }
    addVertex(options) {
        options.id ??= (0, $7f86b8c0dd26ac2d$export$3e8a3cc8713efbec).id();
        const vertex = new (0, $7f86b8c0dd26ac2d$export$3e8a3cc8713efbec)(this, options);
        this.#scene.add(vertex.group);
        this.#vertices.set(vertex.id, vertex);
        this.dynamicMatching?.addVertex(vertex.id);
        return vertex;
    }
    removeVertex(id) {
        try {
            // retrieve vertex
            const vertex = this.#vertices.get(id);
            if (!vertex) return false;
            // remove incident edges
            [
                ...this.#edges.values()
            ].filter((edge)=>edge.source.id === vertex.id || edge.target.id === vertex.id).forEach((edge)=>this.removeEdge(edge.id));
            // remove vertex
            this.#vertices.delete(vertex.id);
            // undraw vertex
            vertex.group.removeFromParent();
            this.dynamicMatching.removeVertex(vertex.id);
            vertex.label?.remove?.();
            return true;
        } catch (e) {
            console.error(e);
        }
        return false;
    }
    addEdge(sourceId, targetId, options) {
        options.id ??= (0, $10c5cfb2786d5ccb$export$b9d9805c9b77a56d).id();
        options = Object.assign({}, this.defaults.edge, options);
        const source = typeof sourceId === 'string' ? this.#vertices.get(sourceId) : sourceId;
        const target = typeof targetId === 'string' ? this.#vertices.get(targetId) : targetId;
        const edge = new (0, $10c5cfb2786d5ccb$export$b9d9805c9b77a56d)(this, source, target, options);
        this.#scene.add(edge.group);
        this.#edges.set(edge.id, edge);
        this.dynamicMatching?.addEdge(edge.id, edge.source.id, edge.target.id, options.strength);
        // await wait(10);
        return edge;
    }
    removeEdge(id) {
        try {
            // retrieve edge
            const edge = this.#edges.get(id);
            if (!edge) return false;
            // delete edge
            this.#edges.delete(edge.id);
            // undraw edge
            edge.group.removeFromParent();
            this.dynamicMatching.removeEdge(edge.id);
            edge.label?.remove();
            if (edge.spline) edge.group.userData.stops.forEach((iv)=>this.dynamicMatching.removeVertex(iv.id));
            return true;
        } catch (e) {
            console.error(e);
        }
    }
    clear() {
        this.#vertices.forEach((v)=>this.removeVertex(v.id));
        (0, $7f86b8c0dd26ac2d$export$3e8a3cc8713efbec).resetId();
        (0, $10c5cfb2786d5ccb$export$b9d9805c9b77a56d).resetId();
    }
    remove() {
        while(this.#scene.children.length > 0)this.#scene.remove(this.#scene.children[0]);
        this.#scene.clear();
    }
    defaults = {
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
    };
    onPointerdown(e) {
        if (!e.altKey) {
            this.#controls.enabled = true;
            this.#selectionHelper.enabled = false;
            return;
        }
        e.preventDefault();
        this.#controls.enabled = false;
        this.#selectionHelper.enabled = true;
        for (let item of this.#selectionBox.collection)if (item.name === 'cube') item.parent.userData.vertex.selected = false;
        this.#selectionBox.startPoint.set(e.clientX / this.#renderer.domElement.clientWidth * 2 - 1, -(e.clientY / this.#renderer.domElement.clientHeight) * 2 + 1, 0.5);
    }
    onPointermove(e) {
        e.preventDefault();
        if (!e.altKey) {
            this.#controls.enabled = true;
            this.#selectionHelper.enabled = false;
            return;
        }
        this.#controls.enabled = false;
        this.#selectionHelper.enabled = true;
        if (this.#selectionHelper.isDown) {
            for (let item of this.#selectionBox.collection)if (item.name === 'cube') item.parent.userData.vertex.selected = false;
            this.#selectionBox.endPoint.set(e.clientX / this.#renderer.domElement.clientWidth * 2 - 1, -(e.clientY / this.#renderer.domElement.clientHeight) * 2 + 1, 0.5);
            for (let selected of this.#selectionBox.select())if (selected.name === 'cube') selected.parent.userData.vertex.selected = true;
        }
    }
    onPointerup(e) {
        e.preventDefault();
        if (!e.altKey) {
            this.#controls.enabled = true;
            this.#selectionHelper.enabled = false;
            return;
        }
        this.#controls.enabled = false;
        this.#selectionHelper.enabled = true;
        this.#selectionBox.endPoint.set(e.clientX / this.#renderer.domElement.clientWidth * 2 - 1, -(e.clientY / this.#renderer.domElement.clientHeight) * 2 + 1, 0.5);
        const allSelected = this.#selectionBox.select();
        for (let selected of allSelected)if (selected.name === 'cube') selected.parent.userData.vertex.selected = true;
    }
    get constants() {
        return 0, $40f3f8b290647dff$export$a002182e51710d39;
    }
    fromJSON(json) {
        this.clear();
        (0, $40f3f8b290647dff$export$a002182e51710d39).fromJSON(json.constants);
        Object.assign(this.defaults, json.defaults);
        for (let vertex of json.V)this.addVertex(vertex);
        for (let edge of json.E)this.addEdge(edge.sourceId, edge.targetId, edge);
    }
    toJSON() {
        return {
            constants: (0, $40f3f8b290647dff$export$a002182e51710d39).toJSON(),
            defaults: this.defaults,
            V: [
                ...this.#vertices.values()
            ].filter((v)=>!v.spline).map((v)=>v.toJSON()),
            E: [
                ...this.#edges.values()
            ].map((e)=>e.toJSON())
        };
    }
    // vertices array for external use
    get vertices() {
        return [
            ...this.#vertices.values()
        ].filter((v)=>!v.spline);
    }
    get edges() {
        return [
            ...this.#edges.values()
        ];
    }
    get canvas() {
        return this.#renderer.domElement;
    }
    #animate() {
        this.dynamicMatching.update();
        // for(const [id, simVertex] of this.dynamicMatching.vertices){
        //   const renderVertex = this.#vertices.get(id);
        //   if(renderVertex){
        //     renderVertex.group.position.copy(simVertex.position);
        //   }
        // }
        this.#vertices.forEach((ov)=>ov.update());
        this.#edges.forEach((oe)=>oe.update());
        this.#updateLabels();
        this.#controls.update();
        this.#renderer.render(this.#scene, this.#camera);
    }
    set backgroundColor(color) {
        this.#renderer.setClearColor(color);
    }
    #onClick(e) {
        const mouse = new $8Jfye$Vector2();
        const raycaster = new $8Jfye$Raycaster();
        let intersects = [], vertex = null;
        if (!e.ctrlKey && !e.altKey) [
            ...this.selected.values()
        ].filter((v)=>!v.spline).forEach((v)=>v.selected = false);
        mouse.set(e.clientX / this.#renderer.domElement.clientWidth * 2 - 1, -(e.clientY / this.#renderer.domElement.clientHeight) * 2 + 1);
        raycaster.setFromCamera(mouse, this.#camera);
        intersects = raycaster.intersectObjects(this.#scene.children).filter((io)=>[
                'wire',
                'cube'
            ].includes(io.object.name)).filter((io)=>!io.object.spline);
        if (intersects.length) {
            vertex = intersects[0]?.object.parent.userData.vertex;
            vertex.selected = e.ctrlKey ? !vertex.selected : true;
            this.#renderer.domElement.dispatchEvent(new CustomEvent('vertex-click', {
                detail: vertex
            }));
            this.#renderer.domElement.dispatchEvent(new CustomEvent('vertex-select', {
                detail: this.selected
            }));
        }
    }
    resize() {
        this.#camera.aspect = this.#parent.clientWidth / this.#parent.clientHeight;
        this.#camera.updateProjectionMatrix();
        this.#renderer.setSize(this.#parent.clientWidth, this.#parent.clientHeight);
    }
    get parent() {
        return this.#parent;
    }
    #isObscured(object) {
        const cam = new $8Jfye$Vector3();
        this.#camera.getWorldPosition(cam);
        const point = new $8Jfye$Vector3();
        object.getWorldPosition(point);
        const raycaster = new $8Jfye$Raycaster();
        raycaster.setFromCamera(new $8Jfye$Vector2().copy(point), this.#camera);
        const intersects = raycaster.intersectObjects(this.#scene.children);
        if (intersects.length > 0) {
            const distance = cam.distanceTo(point);
            if (intersects[0].distance < distance - 0.01) return true;
        }
        return false;
    }
    // todo: middle of a spline curve
    #updateLabels() {
        const applicableObjectNames = new Set([
            'vertex-cube',
            'edge-line',
            'edge-arrow',
            'edge-spline',
            'edge-splarrow'
        ]);
        const raycaster = new $8Jfye$Raycaster();
        const canvas = this.#renderer.domElement;
        const camera = this.#camera;
        raycaster.ray.origin.copy(camera.position);
        this.#scene.traverseVisible((object)=>{
            if (!applicableObjectNames.has(object.name)) return;
            let label, pos;
            if (object.name === 'vertex-cube') {
                // vertex cubes
                label = object.userData.vertex?.label;
                if (!label) return;
                raycaster.ray.direction.copy(object.position.clone().sub(camera.position).normalize()); // ?
                pos = object.position.clone();
            } else if (object.name === 'edge-line' || object.name === 'edge-arrow') {
                // straight edges
                label = object.userData.edge?.label;
                if (!label) return;
                const start = object.userData.edge.source.position.clone();
                const end = object.userData.edge.target.position.clone();
                pos = start.clone().add(end).divideScalar(2.0);
            } else if (object.name === 'edge-spline' || object.name === 'edge-splarrow') {
                // spline edges
                label = object.userData.edge?.label;
                if (!label) return;
                const stopA = object.userData.stops[0];
                const stopB = object.userData.stops[1];
                const start = this.dynamicMatching.getVertex(stopA).position.clone();
                const end = this.dynamicMatching.getVertex(stopB).position.clone();
                pos = start.add(end).divideScalar(2.0);
            }
            if (this.#isObscured(object)) {
                if (label) label.style.display = 'none';
                return;
            } else if (label) label.style.display = 'block';
            pos.project(camera);
            const rect = canvas.getBoundingClientRect();
            const halfWidth = canvas.clientWidth / 2;
            const halfHeight = canvas.clientHeight / 2;
            label.style.left = `${rect.x + pos.x * halfWidth + halfWidth}px`;
            label.style.top = `${rect.y - pos.y * halfHeight + halfHeight}px`;
        });
    }
    #toClientCoords(scenePos, camera, canvas) {
        let position = scenePos.clone();
        position.project(camera);
        let x = Math.round(position.x + 1) / 2 * canvas.clientWidth;
        let y = Math.round(position.y + 1) / 2 * canvas.clientHeight;
        return new $8Jfye$Vector2(x, y);
    }
}





function $763303308f85086c$var$propName(attrStr) {
    return attrStr.replace(/-([a-z])/g, (match, letter)=>letter.toUpperCase());
}
class $763303308f85086c$export$2512fa2cfc4036cf extends HTMLElement {
    static observedAttributes = [
        'background-color'
    ];
    graph;
    defaults;
    qs;
    qsa;
    constructor(){
        super();
        this.attachShadow({
            mode: "open"
        });
        this.qs = this.shadowRoot.querySelector.bind(this.shadowRoot);
        this.qsa = this.shadowRoot.querySelectorAll.bind(this.shadowRoot);
        // element setup, fetchStyle (css), fetchTemplate (html)
        this.fetchStyle().then(()=>this.fetchTemplate()).then(()=>{
            const div = this.shadowRoot.querySelector('div');
            this.graph = new (0, $25151b2351682303$export$614db49f3febe941)(div);
            this.defaults = Object.assign({}, this.graph.defaults);
        }).then(()=>{
            this.querySelectorAll('vertex-el').forEach((vertex)=>{
                this.graph.addVertex(vertex.readAttributes());
            });
            this.querySelectorAll('edge-el').forEach((edge)=>{
                const options = edge.readAttributes();
                const sourceId = options.sourceId;
                const targetId = options.targetId;
                this.graph.addEdge(sourceId, targetId, options);
            });
        });
    }
    constants = {
        set f0 (val){
            (0, $40f3f8b290647dff$export$a002182e51710d39).f0 = val;
        },
        set K (val){
            (0, $40f3f8b290647dff$export$a002182e51710d39).K = val;
        },
        set dt (val){
            (0, $40f3f8b290647dff$export$a002182e51710d39).dt = val;
        },
        set D (val){
            (0, $40f3f8b290647dff$export$a002182e51710d39).D = val;
        },
        set epsilon (val){
            (0, $40f3f8b290647dff$export$a002182e51710d39).epsilon = val;
        },
        set theta (val){
            (0, $40f3f8b290647dff$export$a002182e51710d39).theta = val;
        },
        set phi (val){
            (0, $40f3f8b290647dff$export$a002182e51710d39).phi = val;
        },
        set innerDistance (val){
            (0, $40f3f8b290647dff$export$a002182e51710d39).innerDistance = val;
        },
        get f0 () {
            return (0, $40f3f8b290647dff$export$a002182e51710d39).f0;
        },
        get K () {
            return (0, $40f3f8b290647dff$export$a002182e51710d39).K;
        },
        get dt () {
            return (0, $40f3f8b290647dff$export$a002182e51710d39).dt;
        },
        get D () {
            return (0, $40f3f8b290647dff$export$a002182e51710d39).D;
        },
        get epsilon () {
            return (0, $40f3f8b290647dff$export$a002182e51710d39).epsilon;
        },
        get theta () {
            return (0, $40f3f8b290647dff$export$a002182e51710d39).theta;
        },
        get phi () {
            return (0, $40f3f8b290647dff$export$a002182e51710d39).phi;
        },
        get innerDistance () {
            return (0, $40f3f8b290647dff$export$a002182e51710d39).innerDistance;
        }
    };
    toJSON(title = "Untitled Graph") {
        const V = [
            ...this.querySelectorAll('vertex-el')
        ].map((el)=>el.toJSON());
        const E = [
            ...this.querySelectorAll('edge-el')
        ].map((el)=>el.toJSON());
        const constants = (0, $40f3f8b290647dff$export$a002182e51710d39).toJSON();
        const defaults = Object.assign({}, this.defaults);
        return {
            title: title,
            V: V,
            E: E,
            constants: constants,
            defaults: defaults
        };
    }
    async fromJSON(graph, clearFirst = false) {
        if (clearFirst) this.clear();
        // const wait = (delay) => new Promise((resolve, _) => setTimeout(resolve, delay));
        (0, $40f3f8b290647dff$export$a002182e51710d39).fromJSON(graph.constants);
        Object.assign(this.defaults, graph.defaults);
        const map = new Map();
        for (const vertex of graph.V){
            const v = this.addVertex(vertex);
            if (v.id !== vertex.id) map.set(vertex.id, v.id);
        }
        for (const edge of graph.E){
            const sourceId = map.get(edge.sourceId) ?? edge.sourceId;
            const targetId = map.get(edge.targetId) ?? edge.targetId;
            this.addEdge(sourceId, targetId, edge);
        }
    }
    async fetchStyle() {
        const sheet = new CSSStyleSheet();
        const file = await fetch(new URL("graph-element.8b6506f3.css", import.meta.url));
        const css = await file.text();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [
            sheet
        ];
    }
    async fetchTemplate() {
        this.shadowRoot.innerHTML = '<div></div>';
    }
    attributeChangedCallback(attr, old, value) {
        const prop = $763303308f85086c$var$propName(attr);
        this.graph[prop] = value;
    }
    get vertices() {
        return this.querySelectorAll('vertex-el');
    }
    get edges() {
        return this.querySelectorAll('edge-el');
    }
    get selectedVertices() {
        return [
            ...this.vertices
        ].filter((el)=>el.selected);
    }
    get selectedEdges() {
        return [
            ...this.edges
        ].filter((el)=>el.selected);
    }
    hasChildWithId(id) {
        return this.querySelector(`[id="${CSS.escape(id)}"]`) !== null;
    }
    nextId(prefix) {
        return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
    }
    addVertex(options = {}) {
        const vertexEl = document.createElement('vertex-el');
        if (!options.id) options.id = this.nextId('vertex');
        while(this.hasChildWithId(String(options.id)))options.id = this.nextId('vertex');
        for (let prop of Object.keys(options))if (options[prop] !== null) vertexEl.setAttribute(prop, String(options[prop]));
        this.appendChild(vertexEl);
        return vertexEl;
    }
    addEdge(sourceSel, targetSel, options = {}) {
        sourceSel = sourceSel instanceof (0, $854bed0ac3c3a143$export$ed30cc242fc1c50a) ? `#${sourceSel.getAttribute('id')}` : sourceSel.startsWith('#') ? sourceSel : `#${sourceSel}`;
        targetSel = targetSel instanceof (0, $854bed0ac3c3a143$export$ed30cc242fc1c50a) ? `#${targetSel.getAttribute('id')}` : targetSel.startsWith('#') ? targetSel : `#${targetSel}`;
        const edgeEl = document.createElement('edge-el');
        edgeEl.setAttribute('source', sourceSel);
        edgeEl.setAttribute('target', targetSel);
        if (!options.id) options.id = this.nextId('edge');
        while(this.hasChildWithId(String(options.id)))options.id = this.nextId('edge');
        for (let prop of Object.keys(options)){
            if (prop === 'sourceId' || prop === 'targetId') continue;
            if (options[prop] !== null) edgeEl.setAttribute(prop, options[prop]);
        }
        this.appendChild(edgeEl);
        return edgeEl;
    }
    removeVertex(sel) {
        let vertex = null;
        if (typeof sel === 'string') {
            const selector = sel.startsWith('#') ? sel : `#${sel}`;
            vertex = this.querySelector(selector);
        } else if (sel instanceof (0, $854bed0ac3c3a143$export$ed30cc242fc1c50a)) vertex = sel;
        if (!vertex) return;
        vertex.edges.forEach((edge)=>edge.remove());
        vertex.remove();
    }
    removeEdge(sel) {
        let edge = null;
        if (typeof sel === 'string') {
            const selector = sel.startsWith('#') ? sel : `#${sel}`;
            edge = this.querySelector(selector);
        } else if (sel instanceof (0, $8c48e9b7732a26f4$export$75516b100afd281b)) edge = sel;
        if (!edge) return;
        edge.source?.edges.delete(edge);
        edge.target?.edges.delete(edge);
        edge.remove();
    }
    clear() {
        for (let edge of this.graph.edges)edge.remove();
        for (let vertex of this.graph.vertices)vertex.remove();
    }
    get backgroundColor() {
        return this.getAttribute('background-color') ?? 'white';
    }
    set backgroundColor(val1) {
        this.setAttribute('background-color', String(val1));
    }
}
if (!customElements.get('graph-el')) customElements.define('graph-el', $763303308f85086c$export$2512fa2cfc4036cf);


function $8c48e9b7732a26f4$var$propName(attrStr) {
    return attrStr.replace(/-([a-z])/g, (match, letter)=>letter.toUpperCase());
}
function $8c48e9b7732a26f4$var$readColor(value, fallback) {
    if (value == null) return fallback;
    const numeric = Number(value);
    return Number.isFinite(numeric) ? numeric : value;
}
class $8c48e9b7732a26f4$export$75516b100afd281b extends HTMLElement {
    static observedAttributes = [
        'arrow',
        'spline',
        'visible',
        'color',
        'width',
        'label',
        'strength'
    ];
    edge;
    source;
    target;
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
    get arrow() {
        return this.edge.arrow;
    }
    set arrow(v) {
        this.edge.arrow = v;
    }
    get spline() {
        return this.edge.spline;
    }
    set spline(v) {
        this.edge.spline = v;
    }
    get visible() {
        return this.edge.visible;
    }
    set visible(v) {
        this.edge.visible = v;
    }
    get color() {
        return this.edge.color;
    }
    set color(v) {
        if (!this.edge) {
            this.setAttribute('color', String(v));
            return;
        }
        this.edge.color = v;
    }
    get width() {
        return this.edge.width;
    }
    set width(v) {
        this.edge.width = v;
    }
    get label() {
        return (this.edge.label instanceof HTMLElement ? this.edge.label.innerHTML : this.edge.label) ?? null;
    }
    set label(v) {
        if (v !== null) this.edge.label = v;
    }
    get strength() {
        return this.edge.strength;
    }
    set strength(v) {
        this.edge.strength = v;
    }
    get selected() {
        return this.source.selected && this.target.selected;
    }
    toJSON() {
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
        };
    }
    connectedCallback() {
        const parent = this.parentElement;
        const initialize = ()=>{
            if (!parent?.graph) return;
            const [sourceId, targetId] = this.readPoints();
            if (!sourceId || !targetId) return;
            const options = this.readAttributes();
            this.edge = parent.graph.addEdge(sourceId, targetId, options);
            this.source = parent.querySelector(`#${CSS.escape(sourceId)}`);
            this.target = parent.querySelector(`#${CSS.escape(targetId)}`);
            this.source?.edges.add(this);
            this.target?.edges.add(this);
        };
        if (parent?.graph) initialize();
        else setTimeout(initialize, 0);
    }
    attributeChangedCallback(attr, old, value) {
        if (!this.isConnected || !this.edge || value === null) return;
        const prop = $8c48e9b7732a26f4$var$propName(attr);
        if (attr === 'arrow' || attr === "spline" || attr === "visible") {
            this.edge[prop] = value === 'true';
            return;
        }
        if (attr === 'width') {
            this.edge.width = parseFloat(value);
            return;
        }
        this.edge[prop] = value;
    }
    disconnectedCallback() {
        this.edge.remove();
    // const parent = this.parentElement;
    // (parent as GraphElement)?.removeEdge(this);
    }
    readPoints() {
        const sourceSel = this.getAttribute('source');
        const targetSel = this.getAttribute('target');
        const sourceEl = this.parentElement?.querySelector(sourceSel);
        const targetEl = this.parentElement?.querySelector(targetSel);
        const sourceId = sourceEl.getAttribute('id');
        const targetId = targetEl.getAttribute('id');
        // const sourceEl = this.parentElement?.querySelector<VertexElement>(sourceSel);
        // const targetEl = this.parentElement?.querySelector<VertexElement>(targetSel);
        // const sourceId: string = sourceEl!.vertex.id;
        // const targetId: string = targetEl!.vertex.id;
        return [
            sourceId,
            targetId
        ];
    }
    readAttributes() {
        const parent = this.parentElement;
        const [sourceId, targetId] = this.readPoints();
        const options = {
            id: this.getAttribute('id') ?? (0, $10c5cfb2786d5ccb$export$b9d9805c9b77a56d).id(),
            sourceId: sourceId,
            targetId: targetId,
            arrow: this.hasAttribute('arrow') ? this.getAttribute('arrow') == 'true' : parent.graph.defaults.edge.arrow,
            spline: this.hasAttribute('spline') ? this.getAttribute('spline') == 'true' : parent.graph.defaults.edge.spline,
            visible: this.hasAttribute('visible') ? this.getAttribute('visible') == 'true' : parent.graph.defaults.edge.visible,
            color: $8c48e9b7732a26f4$var$readColor(this.getAttribute('color'), parent.graph.defaults.edge.color),
            width: this.hasAttribute('width') ? parseFloat(this.getAttribute('width')) : parent.graph.defaults.edge.width,
            label: this.getAttribute('label') ?? parent.graph.defaults.edge.label,
            strength: this.hasAttribute('strength') ? parseFloat(this.getAttribute('strength')) : parent.graph.defaults.edge.strength
        };
        return options;
    }
}
if (!customElements.get('edge-el')) customElements.define('edge-el', $8c48e9b7732a26f4$export$75516b100afd281b);






export {$854bed0ac3c3a143$export$ed30cc242fc1c50a as VertexElement, $8c48e9b7732a26f4$export$75516b100afd281b as EdgeElement, $763303308f85086c$export$2512fa2cfc4036cf as GraphElement, $40f3f8b290647dff$export$a002182e51710d39 as Constants};
//# sourceMappingURL=main.js.map
