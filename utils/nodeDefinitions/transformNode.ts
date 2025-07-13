import { nodeDefinition, TransformObject } from "../nodeTypes";
import * as THREE from "three";
import { getInputValues } from "./nodeUtilFunctions";
import { defaultVectorContructor } from "./defaultNodes";
import { toRadians } from "../geometryProcessing/geometryHelpers";

export function transformNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "variable",
    type: "transform",
    inputs: [
      {
        type: "slot",
        name: "position",
        id: 0,
        slotValueType: "vector",
        defaultValue: defaultVectorContructor(0, 0, 0),
      },
      {
        type: "slot",
        name: "scale",
        id: 1,
        slotValueType: "vector",
        defaultValue: defaultVectorContructor(1, 1, 1),
      },
      {
        type: "slot",
        name: "rotation",
        id: 2,
        slotValueType: "vector",
        defaultValue: defaultVectorContructor(0, 0, 0),
      },
    ],
    outputs: [{ type: "transform", name: "transform", id: 3 }],
    function: (node, evalFunction) => {
      const [position, scale, rotation] = getInputValues(
        node.inputs,
        evalFunction,
        [0, 1, 2],
      );

      const transform: TransformObject = {
        position: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        rotation: new THREE.Vector3(0, 0, 0),
      };

      if (
        position.type === "vector" &&
        scale.type === "vector" &&
        rotation.type === "vector"
      ) {
        transform.position = position.value;
        transform.scale = scale.value;

        transform.rotation = new THREE.Vector3(
          toRadians(rotation.value.x),
          toRadians(rotation.value.y),
          toRadians(rotation.value.z),
        );
      }

      return { 3: { type: "transform", value: transform } };
    },
  };
}
