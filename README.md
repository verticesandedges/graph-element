# graph-element
This is a 3D force directed graph visualization web component written in three.js. It is not complete. It could benefit from the dynamic matching integration mentioned in Veldhuizen (2007), and I am currently working on getting the single level logic ported to gpu shader language. This means I'm learning gpu shader language. 

But back to this library. To create the graph-element, you can use either HTML or Javascript:

```html
<link rel="stylesheet" href="graph-element.[hash].css">
<script type="module" src="dist/index.js"></script>
<div class="container">
  <graph-el></graph-el>
</div>
```

You can also include initial vertex and edge elements.

```html
<style>
  graph-el {
    width: 500px;
    height: 350px;
    border: 1px solid black;
  }
</style>

<!-- include the graph-el web component definition -->
<script type="module" src="dist/index.js"></script>

<!-- graph-element -->
<graph-el>
  <!-- vertices -->
  <vertex-el id="a"></vertex-el>
  <vertex-el id="b"></vertex-el>
  <vertex-el id="c"></vertex-el>
  <vertex-el id="d"></vertex-el>
  
  <!-- edges -->
  <edge-el source="#a" target="#b"></edge-el>
  <edge-el source="#b" target="#c"></edge-el>
  <edge-el source="#c" target="#a"></edge-el>
  <edge-el source="#d" target="#a"></edge-el>
  <edge-el source="#d" target="#b"></edge-el>
  <edge-el source="#d" target="#c"></edge-el>
</graph-el>
```

Here's some examples:

* [Hardcoded tetrahedron source code](src/index.html)
* [Hardcoded tetrahedron live example](https://verticesandedges.github.io/graph-element/demo/index.html)
* [Tests](https://verticesandedges.github.io/graph-element/test/index.html)

## Usage
To use the library, get an instance of a GraphElement (aka `<graph-el>`), and call `addVertex()`, `addEdge(sel/vertex, sel/vertex)`, `removeVertex(sel/vertex)`, and `removeEdge(sel/edge)`, where sel stands for selector, ie id or className or similar.

### Vertices
To create a vertex, you call `addVertex()` from your `graph` variable.

```js
const graph = document.querySelector('graph-el');
const vertex = graph.addVertex()
```

This will give you a vertex on a screen. By passing in options, you can change the appearance of the vertex created. 

You can specify an object of vertex options with 
```js
const vertex = graph.addVertex({
  id: css-selector-valid string,
  color: css color string,
  selectionColor: css color string,
  size: number,
  texture: image path,
  label: string,
  visible: boolean
  selected: boolean
});

// or
vertex.setAttribute('color', 'green');
```

Or via HTML attributes:
```html
<vertex-el id="ref" color="green" size="3.0"></vertex-el>
```

Mix and match attributes as you see fit!


### Edges
To create an edge, you pass two vertices, or their ids to `graph.addEdge()`:

```js
const graph = document.querySelector('graph-el');
const va = graph.addVertex();
const vb = graph.addVertex();

const edge = graph.addEdge(va, vb);
// or
const edge = graph.addEdge(va.id, vb.id);
```

Again, you can pass options to `addEdge`:

```js
const edge = graph.addEdge(va, vb, {
  id: string,
  color: css color string,
  arrow: boolean,
  width: number,
  label: string,
  strength: number,
  visible: number,
  spline: boolean
});

// or 

edge.setAttribute('color', 'black');
```

or in HTML:

```html
<edge-el source="#a" target=".b" color="green"></edge-el>
```

## Development
I am quite proud of this library already. Although it is still missing some features, I am proud of the direction this is going.

### Getting Started
Run 
```bash
# Do these at least once
git clone git@github.com:verticesandedges/graph-element.git
cd graph-element
npm install
npm run build:all

# Then you can run 
npm run start:test # or:
npm run start:demo
```

### Scripts
There are several scripts defined in package.json:

**watch commands**
* watch:lib
* watch:demo
* watch:test

**build commands**
* build:lib
* build:demo
* build:test
* build

**start commands**
* start:demo
* start:test

You should be safe running

```bash
npm run build:all
```