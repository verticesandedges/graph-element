import { Vertex, Edge, DynamicMatching, Octree } from "../src/layout/dynamic-matching.ts";
import { Vector3 } from "three";
import { expect } from "chai";
import { GraphElement, VertexElement, EdgeElement } from "../src/index.ts";

mocha.setup('bdd')

describe('Vertex', () => {
  it('should instantiate', () => {
    const dm = new DynamicMatching(0);
    const id = dm.addVertex();
    const vertex = dm.vertices.get(id);
    console.assert(vertex !== undefined, 'is defined')
  });

  it('should have a random position', () => {
    const dm = new DynamicMatching(0);
    const id = dm.addVertex();
    const v = dm.vertices.get(id);
    if(v?.position.lengthSq() === 0) throw new Error("No random position")
  });

  it('should randomly position each vertex', () => {
    const dm = new DynamicMatching(0);
    const aid = dm.addVertex();
    const a = dm.vertices.get(aid);
    const bid = dm.addVertex();
    const b = dm.vertices.get(bid);

    if(a!.position.lengthSq() === b!.position.lengthSq()) throw new Error("a and b have same 'random' position")
  });

  it('should repel', () => {
    const dm = new DynamicMatching(0);
    const aid = dm.addVertex();
    const a = dm.vertices.get(aid);
    const bid = dm.addVertex();
    const b = dm.vertices.get(bid);

    const force = Vertex.repel({
      source: a,
      target: b
    })

    if(force.lengthSq() === 0.0) throw new Error("repel doesn't work");
  })
})

describe('Edge', () => {
  it('should instantiate', () => {
    const dm = new DynamicMatching(0);
    const a = dm.addVertex();
    const b = dm.addVertex();
    const eid = dm.addEdge(undefined, a, b, 1.0);
    const edge = dm.edges.get(eid);
    if(edge === undefined) throw new Error("No edge defined");
  });

  it('should attract', () => {
    const dm = new DynamicMatching(0);

    const aid = dm.addVertex();
    const bid = dm.addVertex();
    const eid = dm.addEdge(undefined, aid, bid, undefined);

    const e = dm.edges.get(eid);
    const a = dm.vertices.get(aid);
    const b = dm.vertices.get(bid);

    const force = Edge.attract({
      source: a,
      target: b,
      strength: 1.0
    });

    if(force.lengthSq() === 0) throw new Error("No attraction");
  })
});

describe('Octree', () => {
  let force: Vector3,
   octree: Octree,
   vertices: Array<Vertex>,
   start2: number, start3: number, time2: number, time3: number,
   NUM: number;
  
  it('should instantiate', () => {
    new Octree();
  });

  describe("Performance", () => {
    force = new Vector3();
    octree = new Octree();
    vertices = new Array<Vertex>();
    NUM = 2500;

    it(`should accept ${NUM} vertices`, () => {
      for(let i=0; i<NUM; i++){
        const vertex = new Vertex();
        octree.insert(vertex);
        vertices.push(vertex);
      }

      if(octree.size !== vertices.length) throw new Error("octree and array sizes not in agreement")
      if(octree.size !== NUM) throw new Error(`size does not match ${NUM}`);
    });

    it(`should process ${NUM} vertices`, () => {
      vertices.forEach((vertex: Vertex) => {
        const f = octree.estimate(vertex, Vertex.repel);
        force.add(f);

        if(f.lengthSq() === 0) throw new Error("no force estimated");
      })

      if(force.lengthSq() === 0) throw new Error("no forces summed")
    })
    
    it('should be faster than NxN', () => {
      start2 = performance.now();
      vertices.forEach((a: Vertex) => {
        vertices.forEach((b: Vertex) => {
          Vertex.repel({
            source: a, 
            target: b
          });
        })
      })
      time2 = performance.now() - start2;

      start3 = performance.now();
      vertices.forEach((a: Vertex) => {
        octree.estimate(a, Vertex.repel);
      });
      time3 = performance.now() - start3;

      if(time3 > time2) throw new Error(`octree (${time3}) took longer than NxN (${time2})`);
    });
  });
})

describe('Dynamic Matching', () => {
  describe("Single Level", () => {
    it('should instantiate', () => {
      new DynamicMatching(0);
    });

    it("should hold vertices", () => {
      const dm = new DynamicMatching(0);
      const aid = dm.addVertex();
      const bid = dm.addVertex();
      const eid = dm.addEdge(undefined, aid, bid, 1.0);
    });
    
    it("should calculate the layout", () => {
      const dm = new DynamicMatching(0);
      const aid = dm.addVertex();
      const bid = dm.addVertex();
      const eid = dm.addEdge(undefined, aid, bid, 1.0);

      const a = dm.vertices.get(aid);
      const b = dm.vertices.get(bid);

      const sumA = a!.position.lengthSq() + b!.position.lengthSq();
      dm.update();
      const sumB = a!.position.lengthSq() + b!.position.lengthSq();

      if(sumA === sumB) throw new Error("no change from update")
    });
  });

  describe("Multi Level", () => {
    it("should instantiate", () => {
      const dm = new DynamicMatching(1);
      if(dm.coarser === undefined) throw new Error("no additional coarser");

      const dm2 = new DynamicMatching(2);
      if(dm2.coarser.coarser === undefined) throw new Error("no additional 2 coarser");
    });

    it("should accept vertices and edges (1 level)", () => {
      const dm = new DynamicMatching(1);
      
      const aid = dm.addVertex();
      const bid = dm.addVertex();
      const cid = dm.addVertex();
      const eid = dm.addEdge(undefined, aid, bid, undefined);
      const fid = dm.addEdge(undefined, bid, cid, undefined);
      const gid = dm.addEdge(undefined, cid, aid, undefined);
    });

    it("should accept vertices and edges (3 level)", () => {
      const dm = new DynamicMatching(3);
      
      const aid = dm.addVertex();
      const bid = dm.addVertex();
      const cid = dm.addVertex();
      const eid = dm.addEdge(undefined, aid, bid, undefined);
      const fid = dm.addEdge(undefined, bid, cid, undefined);
      const gid = dm.addEdge(undefined, cid, aid, undefined);
    });

    it("should calculate layout (2 level)", () => {
      const dm = new DynamicMatching(2);
      
      const aid = dm.addVertex();
      const bid = dm.addVertex();
      const cid = dm.addVertex();
      const eid = dm.addEdge(undefined, aid, bid, undefined);
      const fid = dm.addEdge(undefined, bid, cid, undefined);
      const gid = dm.addEdge(undefined, cid, aid, undefined);

      const a = dm.vertices.get(aid);
      const b = dm.vertices.get(bid);
      const c = dm.vertices.get(cid);

      const sumA = 
        a!.position.lengthSq() +
        b!.position.lengthSq() +
        c!.position.lengthSq();

      dm.update();

      const sumB = 
        a!.position.lengthSq() +
        b!.position.lengthSq() +
        c!.position.lengthSq();

      if(sumA === sumB) throw new Error(`Nothing moved! ${[sumA, sumB]}`);
    });

    it("should calculate layout (3 level)", () => {
      const dm = new DynamicMatching(3);
      
      const aid = dm.addVertex();
      const bid = dm.addVertex();
      const cid = dm.addVertex();
      const eid = dm.addEdge(undefined, aid, bid, undefined);
      const fid = dm.addEdge(undefined, bid, cid, undefined);
      const gid = dm.addEdge(undefined, cid, aid, undefined);

      const a = dm.vertices.get(aid);
      const b = dm.vertices.get(bid);
      const c = dm.vertices.get(cid);

      const sumA = 
        a!.position.lengthSq() +
        b!.position.lengthSq() +
        c!.position.lengthSq();

      dm.update();

      const sumB = 
        a!.position.lengthSq() +
        b!.position.lengthSq() +
        c!.position.lengthSq();

      if(sumA === sumB) throw new Error(`Nothing moved! ${[sumA, sumB]}`);
    });
  })

  describe("Performance", () => {
    const NUM = 1000;

    it(`0-level should accept ${NUM} vertices`, () => {
      const dm = new DynamicMatching(0);

      for(let i=0; i<NUM; i++){
        dm.addVertex();
      }
    });

    it(`0-level should accept ${NUM} vertices and ${NUM} edges`, () => {
      const dm = new DynamicMatching(0);
      const vertexIds = new Array<string>();

      for(let i=0; i<NUM; i++){
        vertexIds.push(dm.addVertex());
      }

      for(let i=0; i<NUM; i++){
        const a = vertexIds[Math.floor(Math.random() * vertexIds.length)];
        const b = vertexIds[Math.floor(Math.random() * vertexIds.length)];
      }
    });

    it(`0-level should update ${2*NUM} elements`, () => {
      const dm = new DynamicMatching(0);
      const vertexIds = new Array<string>();

      for(let i=0; i<NUM; i++){
        vertexIds.push(dm.addVertex());
      }

      for(let i=0; i<NUM; i++){
        const a = vertexIds[Math.floor(Math.random() * vertexIds.length)];
        const b = vertexIds[Math.floor(Math.random() * vertexIds.length)];
      }

      const start = performance.now();
      const r = setInterval(() => {
        dm.update();
        if(performance.now() - start > 5000) clearInterval(r);
      }, 50)
    })

    it(`1-level should accept ${NUM} vertices`, () => {
      const dm = new DynamicMatching(1);

      for(let i=0; i<NUM; i++){
        dm.addVertex();
      }
    });

    it(`1-level should accept ${NUM} vertices and ${NUM} edges`, () => {
      const dm = new DynamicMatching(1);
      const vertexIds = new Array<string>();

      for(let i=0; i<NUM; i++){
        vertexIds.push(dm.addVertex());
      }

      for(let i=0; i<NUM; i++){
        const a = vertexIds[Math.floor(Math.random() * vertexIds.length)];
        const b = vertexIds[Math.floor(Math.random() * vertexIds.length)];
      }
    });

    it(`1-level should update ${2*NUM} elements`, () => {
      const dm = new DynamicMatching(1);
      const vertexIds = new Array<string>();

      for(let i=0; i<NUM; i++){
        vertexIds.push(dm.addVertex());
      }

      for(let i=0; i<NUM; i++){
        const a = vertexIds[Math.floor(Math.random() * vertexIds.length)];
        const b = vertexIds[Math.floor(Math.random() * vertexIds.length)];
      }

      const start = performance.now();
      const r = setInterval(() => {
        dm.update();
        if(performance.now() - start > 5000) clearInterval(r);
      }, 50)
    })

    it(`2-level should accept ${NUM} vertices`, () => {
      const dm = new DynamicMatching(2);

      for(let i=0; i<NUM; i++){
        dm.addVertex();
      }
    });

    it(`2-level should accept ${NUM} vertices and ${NUM} edges`, () => {
      const dm = new DynamicMatching(2);
      const vertexIds = new Array<string>();

      for(let i=0; i<NUM; i++){
        vertexIds.push(dm.addVertex());
      }

      for(let i=0; i<NUM; i++){
        const a = vertexIds[Math.floor(Math.random() * vertexIds.length)];
        const b = vertexIds[Math.floor(Math.random() * vertexIds.length)];
      }
    });

    it(`2-level should update ${2*NUM} elements`, () => {
      const dm = new DynamicMatching(2);
      const vertexIds = new Array<string>();

      for(let i=0; i<NUM; i++){
        vertexIds.push(dm.addVertex());
      }

      for(let i=0; i<NUM; i++){
        const a = vertexIds[Math.floor(Math.random() * vertexIds.length)];
        const b = vertexIds[Math.floor(Math.random() * vertexIds.length)];
      }

      const start = performance.now();
      const r = setInterval(() => {
        dm.update();
        if(performance.now() - start > 5000) clearInterval(r);
      }, 50)
    });
  });
});

describe('Elements', () => {
  describe('graph-element', () => {
    it('should instantiate', () => {
      const graph = document.createElement('graph-el');
      document.body.appendChild(graph);
      expect(graph).to.be.instanceof(GraphElement);
    });

    it('should add vertices', () => {
      const graph = document.createElement('graph-el') as GraphElement;
      document.body.appendChild(graph);
      const vertex = graph.addVertex({});
      expect(vertex).not.to.be.undefined;
      expect(vertex).to.be.instanceOf(VertexElement);

      // expect(vertex.tagName.toLowerCase()).to.be.instanceof(VertexElement);
    });
  })

  describe('vertex-element', () => {
    it("should instantiate", () => {
      const graph = document.createElement('graph-el') as GraphElement;
      document.body.appendChild(graph);
      const vertex = graph.addVertex();

      expect(vertex).to.be.instanceof(VertexElement);
      expect(vertex.tagName.toLowerCase()).to.equal('vertex-el');
    })

    it('should change color', () => {
      const graph = document.createElement('graph-el') as GraphElement;
      document.body.appendChild(graph);
      const vertex = graph.addVertex({color: 'red'});
      vertex.setAttribute('color', 'blue');
      
      expect(vertex).to.be.instanceof(VertexElement);
      expect(vertex.getAttribute('color')).to.equal('blue');
    });

    it('should change texture', () => {
      const graph = document.createElement('graph-el') as GraphElement;
      document.body.appendChild(graph);
      const vertex = graph.addVertex() as VertexElement;

      vertex.setAttribute('texture', './Board.png');
      expect(vertex.getAttribute('texture')).to.equal('./Board.png');
    });

    it('should change selection color', () => {
      const graph = document.createElement('graph-el') as GraphElement;
      document.body.appendChild(graph);
      const vertex = graph.addVertex() as VertexElement;

      vertex.setAttribute("selectionColor", '0xff0000');
      expect(vertex.getAttribute('selectionColor')).to.equal('0xff0000');
    });

    it('should change size', () => {
      const graph = document.createElement('graph-el') as GraphElement;
      document.body.appendChild(graph);
      const vertex = graph.addVertex() as VertexElement;

      vertex.setAttribute("size", "3.0");
      expect(vertex.getAttribute('size')).to.equal("3.0");
    });

    it('should create a label', () => {
      const graph = document.createElement('graph-el') as GraphElement;
      document.body.appendChild(graph);
      const vertex = graph.addVertex() as VertexElement;

      vertex.setAttribute('label', 'Hello, World!');
      expect(vertex.getAttribute('label')).to.equal("Hello, World!");
    });

    it('should change visibility', () => {
      const graph = document.createElement('graph-el') as GraphElement;
      document.body.appendChild(graph);
      const vertex = graph.addVertex() as VertexElement;

      vertex.setAttribute('visible', false);
      expect(vertex.getAttribute("visible")).to.equal('false');
    });

    it('should change selected', () => {
      const graph = document.createElement('graph-el') as GraphElement;
      document.body.appendChild(graph);
      const vertex = graph.addVertex() as VertexElement;

      vertex.setAttribute('selected', true);
      expect(vertex.getAttribute('selected')).to.equal('true');
    });

  })

  describe('edge-element', () => {
    it('should instantiate', () => {
      const graph = document.createElement('graph-el') as GraphElement;
      document.body.appendChild(graph);
      const a = graph.addVertex({id: 'a'}) as VertexElement;
      const b = graph.addVertex({id: 'b'}) as VertexElement;
      const edge = graph.addEdge('#a', '#b') as EdgeElement;

      expect(edge.tagName.toLowerCase()).to.equal('edge-el');
    });

    it('should change arrow', () => {
      const graph = document.createElement('graph-el') as GraphElement;
      document.body.appendChild(graph);
      const a = graph.addVertex({id: 'a'}) as VertexElement;
      const b = graph.addVertex({id: 'b'}) as VertexElement;
      const edge = graph.addEdge('#a', '#b') as EdgeElement;

      edge.setAttribute('arrow', true);
      expect(edge.getAttribute('arrow')).to.be.equal('true');

      edge.setAttribute('arrow', false);
      expect(edge.getAttribute('arrow')).to.be.equal('false');
    });

    it('should change spline', () => {
      const graph = document.createElement('graph-el') as GraphElement;
      document.body.appendChild(graph);
      const a = graph.addVertex({id: 'a'}) as VertexElement;
      const b = graph.addVertex({id: 'b'}) as VertexElement;
      const edge = graph.addEdge('#a', '#b') as EdgeElement;
      
      edge.setAttribute('spline', true);
      expect(edge.getAttribute('spline')).to.be.equal('true');

      edge.setAttribute('spline', false);
      expect(edge.getAttribute('spline')).to.be.equal('false');
    });

    it('should change visible', () => {
      const graph = document.createElement('graph-el') as GraphElement;
      document.body.appendChild(graph);
      const a = graph.addVertex({id: 'a'}) as VertexElement;
      const b = graph.addVertex({id: 'b'}) as VertexElement;
      const edge = graph.addEdge('#a', '#b') as EdgeElement;

      edge.setAttribute("visible", false);
      expect(edge.getAttribute('visible')).to.be.equal('false');

      edge.setAttribute('visible', true);
      expect(edge.getAttribute('visible')).to.be.equal('true');
    });

    it('should change color', () => {
      const graph = document.createElement('graph-el') as GraphElement;
      document.body.appendChild(graph);
      const a = graph.addVertex({id: 'a'}) as VertexElement;
      const b = graph.addVertex({id: 'b'}) as VertexElement;
      const edge = graph.addEdge('#a', '#b') as EdgeElement;

      edge.setAttribute('color', 'red');
      expect(edge.getAttribute('color')).to.equal('red');

      edge.setAttribute('color', 'blue');
      expect(edge.getAttribute('color')).to.equal('blue');
    });

    it('should change width', () => {
      const graph = document.createElement('graph-el') as GraphElement;
      document.body.appendChild(graph);
      const a = graph.addVertex({id: 'a'}) as VertexElement;
      const b = graph.addVertex({id: 'b'}) as VertexElement;
      const edge = graph.addEdge('#a', '#b') as EdgeElement;

      edge.setAttribute('width', 3.0);
      expect(edge.getAttribute('width')).to.be.equal('3');

      edge.setAttribute('width', 1.0);
      expect(edge.getAttribute('width')).to.be.equal('1');
    });

    it('should change label', () => {
      const graph = document.createElement('graph-el') as GraphElement;
      document.body.appendChild(graph);
      const a = graph.addVertex({id: 'a'}) as VertexElement;
      const b = graph.addVertex({id: 'b'}) as VertexElement;
      const edge = graph.addEdge('#a', '#b') as EdgeElement;

      edge.setAttribute('label', 'Hello, World!');
      expect(edge.getAttribute('label')).to.equal("Hello, World!");
    });

  })
});

mocha.run();