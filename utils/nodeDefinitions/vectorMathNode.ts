import * as THREE from "three";
import { nodeDefinition } from "../nodeTypes";
import { getInputValues } from "./nodeUtilFunctions";

export function vectorMathNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "math",
    type: "vector math",
    inputs: [
      {
        type: "select",
        id: 0,
        name: "operation",
        value: 0,
        options: ["add", "subtract", "cross"],
      },
      {
        type: "slot",
        id: 1,
        name: "vector",
        slotValueType: "vector",
      },
      {
        type: "slot",
        id: 2,
        value: 0,
        name: "vector",
        slotValueType: "vector",
      },
    ],
    outputs: [{ type: "vector", name: "vector", id: 3 }],
    function: (node, evalFunction) => {
      const [a, b] = getInputValues(node.inputs, evalFunction, [1, 2]);
      const operationId = node.values["0"];
      let result: THREE.Vector3 = new THREE.Vector3();

      if (a.type === "vector" && b.type === "vector") {
        if (operationId === 0) {
          result = a.value.clone().add(b.value.clone());
        } else if (operationId === 1) {
          result = a.value.clone().sub(b.value.clone());
        } else if (operationId === 2) {
          result = a.value.clone().cross(b.value.clone());
        }
      }

      return {
        3: { type: "vector", value: result },
      };
    },
  };
}
