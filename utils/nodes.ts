import { ASTNode, NodeEvalResult } from "./customHooks/useNodesRuntime";
import * as THREE from "three";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
type NodeInputType = {
  type: "slot" | "number" | "boolean";
  name: string;
  id: number;
  value?: string;
};

type NodeOutputType = {
  type: "mesh" | "point" | "number" | "boolean";
  name: string;
  id: number;
};

interface InodeDefinition {
  nodeTypeId: number;
  type: string;
  inputs: NodeInputType[];
  outputs: NodeOutputType[];
  function?: (
    node: ASTNode,
    evalFunction: (node: ASTNode) => NodeEvalResult,
  ) => NodeEvalResult;
}

export const nodeDefinitions: InodeDefinition[] = [
  {
    nodeTypeId: 1,
    type: "output",
    inputs: [{ type: "slot", id: 0, name: "mesh" }],
    outputs: [],
    function: (node, evalFunction) => {
      const input = evalFunction(node.inputs[0].ast);

      switch (input.type) {
        case "point": {
          const geom = new THREE.BufferGeometry().setFromPoints([input.value]);
          const mat = new THREE.PointsMaterial({
            color: 0x7aadfa,
            size: 0.05,
          });
          const mesh = new THREE.Points(geom, mat);
          return { type: "geometry", value: mesh };
        }
        case "edge": {
          const geom = new THREE.BufferGeometry().setFromPoints(input.value);
          const mat = new THREE.LineBasicMaterial({ color: 0x7aadfa });
          const line = new THREE.Line(geom, mat);
          return { type: "geometry", value: line };
        }
        case "mesh": {
          const mat = new THREE.MeshStandardMaterial({
            color: 0x7aadfa,
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(input.value, mat);
          return { type: "geometry", value: mesh };
        }
        default:
          throw new Error("Unsupported input to output node");
      }
    },
  },
  {
    nodeTypeId: 2,
    type: "number",
    inputs: [{ type: "number", id: 0, value: "0", name: "number" }],
    outputs: [{ type: "number", name: "number", id: 1 }],
    function: (node, _) => {
      return { type: "number", value: parseFloat(node.values[0] ?? "0") };
    },
  },
  {
    nodeTypeId: 3,
    type: "pointByXYZ",
    inputs: [
      { type: "slot", name: "number(X)", id: 0 },
      { type: "slot", name: "number(Y)", id: 1 },
      { type: "slot", name: "number(Z)", id: 2 },
    ],
    outputs: [{ type: "point", name: "point", id: 3 }],
    function: (node, evalFunction) => {
      const x = evalFunction(node.inputs[0].ast);
      const y = evalFunction(node.inputs[1].ast);
      const z = evalFunction(node.inputs[2].ast);

      if (x.type === "number" && y.type === "number" && z.type === "number") {
        return {
          type: "point",
          value: new THREE.Vector3(x.value, y.value, z.value),
        };
      }
      throw new Error("Invalid inputs to pointByXYZ");
    },
  },
  {
    nodeTypeId: 4,
    type: "edgeByPoints",
    inputs: [
      { type: "slot", name: "Point start", id: 0 },
      { type: "slot", name: "Point end", id: 1 },
    ],
    outputs: [{ type: "mesh", name: "edge", id: 2 }],
    function: (node, evalFunction) => {
      const p1 = evalFunction(node.inputs[0].ast);
      const p2 = evalFunction(node.inputs[1].ast);

      if (p1.type === "point" && p2.type === "point") {
        return { type: "edge", value: [p1.value, p2.value] };
      }
      throw new Error("Invalid inputs to edgeByPoints");
    },
  },
  {
    nodeTypeId: 5,
    type: "plane",
    inputs: [
      { type: "slot", name: "point", id: 0 },
      { type: "slot", name: "number(width)", id: 1 },
      { type: "slot", name: "number(height)", id: 2 },
    ],
    outputs: [{ type: "mesh", name: "mesh", id: 3 }],
    function: (node, evalFunction) => {
      const p = evalFunction(node.inputs[0].ast);
      const dim1 = evalFunction(node.inputs[1].ast);
      const dim2 = evalFunction(node.inputs[2].ast);

      if (
        p.type === "point" &&
        dim1.type === "number" &&
        dim2.type === "number"
      ) {
        const x = p.value.x;
        const y = p.value.y;
        const z = p.value.z;

        const w = dim1.value;
        const h = dim2.value;
        const vertices = new Float32Array([
          x,
          y,
          z,
          x + w,
          y,
          z,
          x + w,
          y,
          z + h,
          x,
          y,
          z + h,
        ]);

        const indices = [0, 1, 2, 2, 3, 0];
        const geom = new THREE.BufferGeometry();
        geom.setIndex(indices);
        geom.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
        geom.computeVertexNormals();

        return { type: "mesh", value: geom };
      }
      throw new Error("Invalid inputs to plane node");
    },
  },
  {
    nodeTypeId: 6,
    type: "extrude",
    inputs: [
      { type: "slot", name: "point(vector)", id: 0 },
      { type: "slot", name: "mesh(plane)", id: 1 },
    ],
    outputs: [{ type: "mesh", name: "mesh", id: 2 }],
    function: (node, evalFunction) => {
      const vector = evalFunction(node.inputs[0].ast);
      const initGeom = evalFunction(node.inputs[1].ast);

      if (vector.type === "point" && initGeom.type === "mesh") {
        const baseGeom = initGeom.value;
        if (!baseGeom.index) throw new Error("lost original geom");
        baseGeom.computeVertexNormals();
        baseGeom.computeBoundingBox();

        const position = baseGeom.attributes.position;
        const vertexCount = position.count;

        const vertices = [];
        const extrudedVertices = [];

        for (let i = 0; i < vertexCount; i++) {
          const v = new THREE.Vector3().fromBufferAttribute(position, i);
          vertices.push(v);
          extrudedVertices.push(v.clone().add(vector.value));
        }
        const allVerts = [...vertices, ...extrudedVertices];

        const geom = new ConvexGeometry(allVerts);
        const indexed = BufferGeometryUtils.mergeVertices(geom);

        return { type: "mesh", value: indexed };
      }
      throw new Error("Invalid inputs to extrude node");
    },
  },
  {
    nodeTypeId: 7,
    type: "circle",
    inputs: [
      { type: "slot", name: "number(radius)", id: 0 },
      { type: "slot", name: "number(res)", id: 1 },
    ],
    outputs: [{ type: "mesh", name: "mesh", id: 2 }],
    function: (node, evalFunction) => {
      const radius = evalFunction(node.inputs[0].ast);
      const segments = evalFunction(node.inputs[1].ast);

      if (radius.type === "number" && segments.type === "number") {
        const geom = new THREE.CircleGeometry(radius.value, segments.value);

        return { type: "mesh", value: geom };
      }
      throw new Error("Invalid inputs to circle node");
    },
  },
];
