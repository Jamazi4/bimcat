import * as THREE from "three";
import { ConvexGeometry } from "three/addons/geometries/ConvexGeometry.js";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import {
  ASTNode,
  ASTNodeInput,
  nodeDefinition,
  NodeEvalResult,
} from "./nodeTypes";
import { createNodeId } from "./utilFunctions";

export const defaultNumber: ASTNode = {
  type: "number",
  id: createNodeId(),
  inputs: [],
  values: { "0": 0 },
};

export const defaultBoolean: ASTNode = {
  type: "boolean",
  id: createNodeId(),
  inputs: [],
  values: { "0": true },
};

export const defaultVector: ASTNode = {
  type: "vector",
  id: createNodeId(),
  inputs: [
    {
      inputId: 0,
      ast: defaultNumber,
      fromOutputId: 1,
    },
    {
      inputId: 1,
      ast: defaultNumber,
      fromOutputId: 1,
    },
    {
      inputId: 2,
      ast: defaultNumber,
      fromOutputId: 1,
    },
  ],
  values: {},
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
      const outputInput = node.inputs[0];
      const input = evalFunction(outputInput.ast)[outputInput.fromOutputId];

      switch (input.type) {
        case "vector": {
          const geom = new THREE.BufferGeometry().setFromPoints([input.value]);
          const mat = new THREE.PointsMaterial({
            color: 0x7aadfa,
            size: 0.05,
          });
          const mesh = new THREE.Points(geom, mat);
          return { 1: { type: "geometry", value: mesh } };
        }
        case "linestring": {
          const geom = new THREE.BufferGeometry().setFromPoints(input.value);
          const mat = new THREE.LineBasicMaterial({ color: 0x7aadfa });
          const linestring = new THREE.Line(geom, mat);
          return { 1: { type: "geometry", value: linestring } };
        }
        case "mesh": {
          const mat = new THREE.MeshStandardMaterial({
            color: 0x7aadfa,
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(input.value, mat);
          return { 1: { type: "geometry", value: mesh } };
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
    inputs: [{ type: "number", id: 0, value: 0, name: "number" }],
    outputs: [{ type: "number", name: "number", id: 1 }],
    function: (node, _) => {
      return {
        1: { type: "number", value: (node.values["0"] as number) ?? 0 },
      };
    },
  },
  {
    nodeDefId: 3,
    category: "generator",
    type: "linestring",
    inputs: [
      { type: "slot", name: "start", id: 0, slotValueType: "vector" },
      { type: "slot", name: "end", id: 1, slotValueType: "vector" },
    ],
    outputs: [{ type: "linestring", name: "linestring", id: 2 }],
    function: (node, evalFunction) => {
      const p1Input = node.inputs[0];
      const p1 = evalFunction(p1Input.ast)[p1Input.fromOutputId];

      const p2Input = node.inputs[1];
      const p2 = evalFunction(p2Input.ast)[p2Input.fromOutputId];

      if (p1.type === "vector" && p2.type === "vector") {
        return { 2: { type: "linestring", value: [p1.value, p2.value] } };
      }
      throw new Error("Invalid inputs to edgeByPoints");
    },
  },
  {
    nodeDefId: 4,
    category: "generator",
    type: "plane",
    inputs: [
      {
        type: "combo",
        value: 1,
        name: "width",
        id: 0,
        slotValueType: "number",
      },
      {
        type: "combo",
        value: 1,
        name: "height",
        id: 1,
        slotValueType: "number",
      },
      {
        type: "slot",
        name: "position",
        id: 2,
        slotValueType: "vector",
        defaultValue: defaultVector,
      },
    ],
    outputs: [
      { type: "mesh", name: "mesh", id: 4 },
      { type: "linestring", name: "linestring", id: 5 },
    ],
    function: (node, evalFunction) => {
      const [dim1, dim2] = getComboValues(node, evalFunction, [0, 1]);
      const [p] = getInputValues(node.inputs, evalFunction, [2]);

      if (
        p.type === "vector" &&
        typeof dim1 === "number" &&
        typeof dim2 === "number"
      ) {
        const x = p.value.x;
        const y = p.value.y;
        const z = p.value.z;

        const w = dim1;
        const h = dim2;
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
        const mesh = new THREE.BufferGeometry();
        mesh.setIndex(indices);
        mesh.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
        mesh.computeVertexNormals();

        const linestring = [
          new THREE.Vector3(x, y, z),
          new THREE.Vector3(x + w, y, z),
          new THREE.Vector3(x + w, y, z + h),
          new THREE.Vector3(x, y, z + h),

          new THREE.Vector3(x, y, z),
        ];

        return {
          4: { type: "mesh", value: mesh },
          5: { type: "linestring", value: linestring },
        };
      }
      throw new Error("Invalid inputs to plane node");
    },
  },
  {
    nodeDefId: 5,
    category: "modifier",
    type: "extrude mesh",
    inputs: [
      { type: "slot", name: "vector", id: 0, slotValueType: "vector" },
      { type: "slot", name: "mesh", id: 1, slotValueType: "mesh" },
    ],
    outputs: [{ type: "mesh", name: "mesh", id: 2 }],
    function: (node, evalFunction) => {
      const vectorInput = node.inputs[0];
      const vector = evalFunction(vectorInput.ast)[vectorInput.fromOutputId];

      const initGeomInput = node.inputs[1];
      const initGeom = evalFunction(initGeomInput.ast)[
        initGeomInput.fromOutputId
      ];

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

        return { 2: { type: "mesh", value: indexed } };
      }
      throw new Error("Invalid inputs to extrude node");
    },
  },
  {
    nodeDefId: 6,
    category: "generator",
    type: "circle",
    inputs: [
      {
        type: "combo",
        value: 1,
        name: "radius",
        id: 0,
        slotValueType: "number",
      },
      {
        type: "combo",
        value: 16,
        name: "resolution",
        id: 1,
        slotValueType: "number",
      },
    ],
    outputs: [
      { type: "mesh", name: "mesh", id: 2 },
      { type: "linestring", name: "linestring", id: 3 },
    ],
    function: (node, evalFunction) => {
      const [radius, segments] = getComboValues(node, evalFunction, [0, 1]);

      if (typeof radius === "number" && typeof segments === "number") {
        const geom = new THREE.CircleGeometry(radius, segments);
        const positionAttr = geom.getAttribute("position");

        const linestring: THREE.Vector3[] = [];

        for (let i = 0; i < positionAttr.count; i++) {
          const x = positionAttr.getX(i);
          const y = positionAttr.getY(i);
          const z = positionAttr.getZ(i);
          linestring.push(new THREE.Vector3(x, y, z));
        }

        const linestringClean = linestring.slice(1);

        return {
          2: { type: "mesh", value: geom },
          3: { type: "linestring", value: linestringClean },
        };
      }
      throw new Error("Invalid inputs to circle node");
    },
  },
  {
    nodeDefId: 7,
    category: "variable",
    type: "boolean",
    inputs: [{ type: "boolean", name: "boolean", id: 0, value: false }],
    outputs: [{ type: "boolean", name: "boolean", id: 1 }],
    function: (node, _) => {
      return {
        1: {
          type: "boolean",
          value: node.values["0"] as boolean,
        },
      };
    },
  },
  {
    nodeDefId: 8,
    category: "variable",
    type: "vector",
    inputs: [
      { type: "combo", value: 0, name: "X", id: 0, slotValueType: "number" },
      { type: "combo", value: 0, name: "Y", id: 1, slotValueType: "number" },
      { type: "combo", value: 0, name: "Z", id: 2, slotValueType: "number" },
    ],
    outputs: [{ type: "vector", name: "vector", id: 3 }],
    function: (node, evalFunction) => {
      const [x, y, z] = getComboValues(node, evalFunction, [0, 1, 2]);

      if (
        typeof x === "number" &&
        typeof y === "number" &&
        typeof z === "number"
      ) {
        return {
          3: {
            type: "vector",
            value: new THREE.Vector3(x, y, z),
          },
        };
      }
      throw new Error("Invalid inputs to vector");
    },
  },
  {
    nodeDefId: 9,
    category: "general",
    type: "extrudeTest",
    inputs: [
      {
        type: "group",
        name: "test1",
        id: 0,
        slotValueType: "mesh",
        groupIndex: 0,
        value: true,
      },
      {
        type: "group",
        name: "test2",
        id: 1,
        slotValueType: "linestring",
        groupIndex: 0,
        defaultValue: defaultBoolean,
        value: false,
      },
      {
        type: "group",
        name: "test4",
        id: 2,
        slotValueType: "mesh",
        groupIndex: 1,
        value: false,
      },
      {
        type: "group",
        name: "test3",
        id: 3,
        slotValueType: "linestring",
        groupIndex: 1,
        defaultValue: defaultBoolean,
        value: true,
      },
    ],
    outputs: [{ type: "mesh", name: "mesh", id: 4 }],
    function: (node, evalFunction) => {
      const activeInputs = Object.entries(node.values)
        .filter(([_, val]) => val === true)
        .map(([key, _]) => parseInt(key));

      console.log(`in eval ${activeInputs}`);

      const [v1, v2] = getInputValues(node.inputs, evalFunction, activeInputs);

      console.log(activeInputs);
      console.log(v1, v2);

      return { 4: { type: "number", value: 0 } };
    },
  },
];

const getComboValues = (
  node: ASTNode,
  evalFunction: (node: ASTNode) => NodeEvalResult,
  inputIds: number[],
) => {
  const inputs = node.inputs;
  const values = inputIds.map((id) => {
    const curInput = inputs.find((i) => i.inputId === id);
    if (!curInput) return node.values[id];
    else return evalFunction(curInput.ast)[curInput.fromOutputId].value;
  });
  return values;
};

const getInputValues = (
  inputs: ASTNodeInput[],
  evalFunction: (node: ASTNode) => NodeEvalResult,
  inputIds: number[],
) => {
  const values = inputs
    .flatMap((i) => {
      if (inputIds.includes(i.inputId)) {
        return evalFunction(i.ast)[i.fromOutputId];
      }
      return [];
    })
    .filter(Boolean);

  return values;
};
