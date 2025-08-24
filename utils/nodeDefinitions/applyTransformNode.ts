import { nodeDefinition } from "../nodeTypes";
import * as THREE from "three";
import { getActiveInputIds, getInputValues } from "./nodeUtilFunctions";
import { defaultTransformContructor } from "./defaultNodes";
import {
  applyTransform,
  applyTransformToLinestring,
  composeRelativeTransformMatrix,
} from "../geometryProcessing/geometryHelpers";

export function applyTransformNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "modifier",
    type: "apply transform",
    inputs: [
      {
        type: "group",
        name: "mesh",
        id: 0,
        slotValueType: "mesh",
        value: true,
        groupIndex: 0,
      },
      {
        type: "group",
        value: false,
        name: "linestring",
        id: 1,
        slotValueType: "linestring",
        groupIndex: 0,
      },
      {
        type: "slot",
        name: "transform",
        id: 2,
        slotValueType: "transform",
        defaultValue: defaultTransformContructor(),
      },
    ],
    outputs: [
      { type: "mesh", name: "mesh", id: 3, onInputSelectedId: 0 },
      { type: "linestring", name: "linestring", id: 4, onInputSelectedId: 1 },
    ],
    function: (node, evalFunction) => {
      const activeInputs = getActiveInputIds(node.values, [0, 1]);
      const [geom] = getInputValues(node.inputs, evalFunction, activeInputs);
      const [transform] = getInputValues(node.inputs, evalFunction, [2]);

      let outputMesh = new THREE.BufferGeometry();
      let outputLinestring: THREE.Vector3[][] = [];
      if (geom.type === "mesh" && transform.type === "transform") {
        outputMesh = geom.value.clone();
        applyTransform(outputMesh, transform.value);
      } else if (geom.type === "linestring" && transform.type === "transform") {
        const positionMatrix = new THREE.Matrix4().makeTranslation(
          transform.value.position.x,
          transform.value.position.y,
          transform.value.position.z,
        );
        const tempGeom = new THREE.BufferGeometry().setFromPoints(
          geom.value[0],
        );
        const relativeMatrix = composeRelativeTransformMatrix(
          tempGeom,
          transform.value,
        );

        outputLinestring = applyTransformToLinestring(
          geom.value,
          positionMatrix,
          relativeMatrix,
        );
      }
      return {
        3: { type: "mesh", value: outputMesh },
        4: { type: "linestring", value: outputLinestring },
      };
    },
  };
}
