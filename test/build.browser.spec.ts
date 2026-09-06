import { GraphElement, VertexElement, EdgeElement } from "../dist/index.js";
import { expect } from "chai";
import { Graph } from "../src/layout/scene-graph.js";

describe('graph', () => {
  it("should instantiate a graph, two vertices, and an edge", () => {
    const graph = document.createElement('graph-el') as GraphElement;
    const va = graph.addVertex();
    const vb = graph.addVertex();
    const e = graph.addEdge(va, vb);

    expect(graph.tagName).to.equal('GRAPH-EL');
    expect(va.tagName).to.equal('VERTEX-EL');
    expect(e.tagName).to.equal('EDGE-EL');
  })
})