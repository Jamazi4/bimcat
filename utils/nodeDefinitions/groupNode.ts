import { nodeDefinition } from "../nodeTypes";
import * as THREE from "three";
import { getComboValues, getInputValues } from "./nodeUtilFunctions";
import { composeTransformMatrix } from "../geometryProcessing/geometryHelpers";
import { extractOrderedBoundaryLoop } from "../geometryProcessing/extrusion";

export function groupNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "general",
    type: "group",
    inputs: [
      {
        type: "group",
        slotValueType: "linestring",
        groupIndex: 0,
        name: "linestring",
        id: 0,
        value: true,
        isList: true,
      },
      {
        type: "group",
        slotValueType: "mesh",
        groupIndex: 0,
        name: "mesh",
        id: 1,
        value: false,
        isList: true,
      },
    ],
    outputs: [
      { type: "linestring", name: "linestring", id: 2, onInputSelectedId: 0 },
      { type: "mesh", name: "mesh", id: 3, onInputSelectedId: 1 },
    ],
    function: (node, evalFunction) => {
      const [dim1, dim2] = getComboValues(node, evalFunction, [0, 1]);
      const [transform] = getInputValues(node.inputs, evalFunction, [2]);

      if (
        transform.type === "transform" &&
        typeof dim1 === "number" &&
        typeof dim2 === "number"
      ) {
        const geom = new THREE.PlaneGeometry(dim1, dim2);

        const transformMatrix = composeTransformMatrix(transform.value);

        geom.applyMatrix4(transformMatrix);

        const linestring = extractOrderedBoundaryLoop(geom)[0];
        linestring.push(linestring[0]);
        return {
          3: { type: "mesh", value: geom },
          4: { type: "linestring", value: [linestring] },
        };
      }
      throw new Error("Invalid inputs to plane node");
    },
  };
}
