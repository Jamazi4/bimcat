import { nodeDefinition } from "../nodeTypes";
import * as THREE from "three";
import { getComboValues } from "./nodeUtilFunctions";

export function vectorNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
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
  };
}
