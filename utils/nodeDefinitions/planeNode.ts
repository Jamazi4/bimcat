import { nodeDefinition } from "../nodeTypes";
import * as THREE from "three";
import { defaultTransformContructor } from "./defaultNodes";
import { getComboValues, getInputValues } from "./nodeUtilFunctions";
import { composeTransformMatrix } from "../geometryProcessing/geometryHelpers";
import { extractOrderedBoundaryLoop } from "../geometryProcessing/extrusion";

export function planeNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
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
        name: "transform",
        id: 2,
        slotValueType: "transform",
        defaultValue: defaultTransformContructor(),
      },
    ],
    outputs: [
      { type: "mesh", name: "mesh", id: 3 },
      { type: "linestring", name: "linestring", id: 4 },
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
