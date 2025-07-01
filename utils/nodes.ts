import { ASTNode, NodeEvalResult } from "./customHooks/useNodesRuntime";
import * as THREE from "three";

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
];
