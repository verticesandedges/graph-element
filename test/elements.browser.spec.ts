import { GraphElement, VertexElement, EdgeElement } from "../dist/index.js";
import { expect } from "chai";

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
  });
});
