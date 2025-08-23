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
        type: "boolean",
        name: "custom origin",
        id: 0,
        value: false,
      },
      {
        type: "slot",
        name: "position",
        id: 1,
        slotValueType: "vector",
        defaultValue: defaultVectorContructor(0, 0, 0),
      },
      {
        type: "slot",
        name: "scale",
        id: 2,
        slotValueType: "vector",
        defaultValue: defaultVectorContructor(1, 1, 1),
      },
      {
        type: "slot",
        name: "rotation",
        id: 3,
        slotValueType: "vector",
        defaultValue: defaultVectorContructor(0, 0, 0),
      },
      {
        type: "slot",
        name: "origin",
        id: 4,
        slotValueType: "vector",
        defaultValue: defaultVectorContructor(0, 0, 0),
        onBooleanTrueId: 0,
      },
    ],
    outputs: [{ type: "transform", name: "transform", id: 5 }],
    function: (node, evalFunction) => {
      const [position, scale, rotation, origin] = getInputValues(
        node.inputs,
        evalFunction,
        [1, 2, 3, 4],
      );
      const customOrigin = node.values[0];

      const transform: TransformObject = {
        position: new THREE.Vector3(0, 0, 0),
        scale: new THREE.Vector3(1, 1, 1),
        rotation: new THREE.Vector3(0, 0, 0),
      };

      if (
        position.type === "vector" &&
        scale.type === "vector" &&
        rotation.type === "vector" &&
        origin.type === "vector"
      ) {
        transform.position = position.value;
        transform.scale = scale.value;

        transform.rotation = new THREE.Vector3(
          toRadians(rotation.value.x),
          toRadians(rotation.value.y),
          toRadians(rotation.value.z),
        );

        if (customOrigin !== false) {
          transform.origin = origin.value;
        }
      }

      return { 5: { type: "transform", value: transform } };
    },
  };
}
