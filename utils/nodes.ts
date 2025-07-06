import * as THREE from "three";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { ASTNode, nodeDefinition, NodeEvalResult } from "./nodeTypes";
import { createNodeId } from "./utilFunctions";

export const defaultNumber: ASTNode = {
  type: "number",
  id: createNodeId(),
  inputs: [],
  values: ["0"],
};

export const defaultBoolean: ASTNode = {
  type: "boolean",
  id: createNodeId(),
  inputs: [],
  values: ["true"],
};

export const defaultVector: ASTNode = {
  type: "vector",
  id: createNodeId(),
  inputs: [
    {
      inputId: 0,
      ast: defaultNumber,
    },
    {
      inputId: 1,
      ast: defaultNumber,
    },
    {
      inputId: 2,
      ast: defaultNumber,
    },
  ],
  values: [],
};

export const nodeDefinitions: nodeDefinition[] = [
  {
    nodeDefId: 1,
    category: "general",
    type: "output",
    inputs: [
      { type: "slot", id: 0, name: "geometry", slotValueType: "geometry" },
    ],
    outputs: [],
    function: (node, evalFunction) => {
      const input = evalFunction(node.inputs[0].ast);

      switch (input.type) {
        case "vector": {
          const geom = new THREE.BufferGeometry().setFromPoints([input.value]);
          const mat = new THREE.PointsMaterial({
            color: 0x7aadfa,
            size: 0.05,
          });
          const mesh = new THREE.Points(geom, mat);
          return { type: "geometry", value: mesh };
        }
        case "linestring": {
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
    nodeDefId: 2,
    category: "variable",
    type: "number",
    inputs: [{ type: "number", id: 0, value: "0", name: "number" }],
    outputs: [{ type: "number", name: "number", id: 1 }],
    function: (node, _) => {
      return { type: "number", value: parseFloat(node.values[0] ?? "0") };
    },
  },
  {
    nodeDefId: 3,
    category: "variable",
    type: "vector",
    inputs: [
      { type: "slot", name: "X", id: 0, slotValueType: "number" },
      { type: "slot", name: "Y", id: 1, slotValueType: "number" },
      { type: "slot", name: "Z", id: 2, slotValueType: "number" },
    ],
    outputs: [{ type: "vector", name: "vector", id: 3 }],
    function: (node, evalFunction) => {
      const x = evalFunction(node.inputs[0].ast);
      const y = evalFunction(node.inputs[1].ast);
      const z = evalFunction(node.inputs[2].ast);

      if (x.type === "number" && y.type === "number" && z.type === "number") {
        return {
          type: "vector",
          value: new THREE.Vector3(x.value, y.value, z.value),
        };
      }
      throw new Error("Invalid inputs to pointByXYZ");
    },
  },
  {
    nodeDefId: 4,
    category: "generator",
    type: "linestring",
    inputs: [
      { type: "slot", name: "start", id: 0, slotValueType: "vector" },
      { type: "slot", name: "end", id: 1, slotValueType: "vector" },
    ],
    outputs: [{ type: "linestring", name: "linestring", id: 2 }],
    function: (node, evalFunction) => {
      const p1 = evalFunction(node.inputs[0].ast);
      const p2 = evalFunction(node.inputs[1].ast);

      if (p1.type === "vector" && p2.type === "vector") {
        return { type: "linestring", value: [p1.value, p2.value] };
      }
      throw new Error("Invalid inputs to edgeByPoints");
    },
  },
  {
    nodeDefId: 5,
    category: "generator",
    type: "plane",
    inputs: [
      {
        type: "slot",
        name: "position",
        id: 0,
        slotValueType: "vector",
        defaultValue: defaultVector,
      },
      { type: "slot", name: "width", id: 1, slotValueType: "number" },
      { type: "slot", name: "height", id: 2, slotValueType: "number" },
    ],
    outputs: [{ type: "mesh", name: "mesh", id: 3 }],
    function: (node, evalFunction) => {
      const p = evalFunction(node.inputs[0].ast);
      const dim1 = evalFunction(node.inputs[1].ast);
      const dim2 = evalFunction(node.inputs[2].ast);

      console.log(node.inputs[0]);
      console.log(p);

      if (
        p.type === "vector" &&
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
    nodeDefId: 6,
    category: "modifier",
    type: "extrude mesh",
    inputs: [
      { type: "slot", name: "vector", id: 0, slotValueType: "vector" },
      { type: "slot", name: "mesh", id: 1, slotValueType: "mesh" },
    ],
    outputs: [{ type: "mesh", name: "mesh", id: 2 }],
    function: (node, evalFunction) => {
      const vector = evalFunction(node.inputs[0].ast);
      const initGeom = evalFunction(node.inputs[1].ast);

      if (vector.type === "vector" && initGeom.type === "mesh") {
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
    nodeDefId: 7,
    category: "generator",
    type: "circle",
    inputs: [
      { type: "slot", name: "radius", id: 0, slotValueType: "number" },
      { type: "slot", name: "resolution", id: 1, slotValueType: "number" },
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
  {
    nodeDefId: 8,
    category: "variable",
    type: "boolean",
    inputs: [{ type: "boolean", name: "boolean", id: 0, value: "false" }],
    outputs: [{ type: "boolean", name: "boolean", id: 1 }],
    function: (node, _) => {
      return {
        type: "boolean",
        value: node.values[0] === "true" ? true : false,
      };
    },
  },
];
