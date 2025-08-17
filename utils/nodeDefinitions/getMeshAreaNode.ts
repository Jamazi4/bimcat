import { nodeDefinition } from "../nodeTypes";
import * as THREE from "three";
import { getInputValues, smartRound } from "./nodeUtilFunctions";

export function getMeshAreaNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "getters",
    type: "area",
    inputs: [
      {
        type: "slot",
        name: "mesh",
        id: 0,
        slotValueType: "mesh",
      },
    ],
    outputs: [{ type: "number", name: "number", id: 1 }],
    function: (node, evalFunction) => {
      const [geometry] = getInputValues(node.inputs, evalFunction, [0]);

      if (geometry.type === "mesh") {
        const posAttr = geometry.value.attributes.position;

        let area = 0;
        const pA = new THREE.Vector3();
        const pB = new THREE.Vector3();
        const pC = new THREE.Vector3();
        const v1 = new THREE.Vector3();
        const v2 = new THREE.Vector3();
        const index = geometry.value.index;
        if (!index) throw new Error("Get mesh area needs indexed mesh");
        for (let i = 0; i < index.count; i += 3) {
          pA.fromBufferAttribute(posAttr, index.getX(i));
          pB.fromBufferAttribute(posAttr, index.getX(i + 1));
          pC.fromBufferAttribute(posAttr, index.getX(i + 2));

          v1.subVectors(pB, pA);
          v2.subVectors(pC, pA);
          area += v1.cross(v2).length() * 0.5;
        }
        area = +smartRound(area);
        return {
          1: { type: "number", value: area },
        };
      }

      throw new Error("Invalid inputs to plane node");
    },
  };
}
