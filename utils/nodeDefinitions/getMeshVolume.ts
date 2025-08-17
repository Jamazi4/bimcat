import { nodeDefinition } from "../nodeTypes";
import * as THREE from "three";
import { getInputValues, smartRound } from "./nodeUtilFunctions";

export function getMeshVolumeNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "getters",
    type: "volume",
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
        const index = geometry.value.index;
        if (!index) throw new Error("Volume node needs indexed geometry");

        const posAttr = geometry.value.attributes.position;

        // Calculate mesh centroid (average of all vertices)
        const centroid = new THREE.Vector3();
        for (let i = 0; i < posAttr.count; i++) {
          const v = new THREE.Vector3().fromBufferAttribute(posAttr, i);
          centroid.add(v);
        }
        centroid.divideScalar(posAttr.count);

        // Calculate volume using centroid as reference point
        let volume = 0;
        for (let i = 0; i < index.count; i += 3) {
          const a = new THREE.Vector3()
            .fromBufferAttribute(posAttr, index.getX(i))
            .sub(centroid);
          const b = new THREE.Vector3()
            .fromBufferAttribute(posAttr, index.getX(i + 1))
            .sub(centroid);
          const c = new THREE.Vector3()
            .fromBufferAttribute(posAttr, index.getX(i + 2))
            .sub(centroid);

          volume += Math.abs(a.dot(b.clone().cross(c)) / 6);
        }
        volume = +smartRound(volume);

        return { 1: { type: "number", value: volume } };
      }

      throw new Error("Invalid inputs to plane node");
    },
  };
}
