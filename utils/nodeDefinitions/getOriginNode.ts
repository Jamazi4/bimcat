import { nodeDefinition } from "../nodeTypes";
import { getActiveInputIds, getInputValues } from "./nodeUtilFunctions";
import {
  getBufferGeomCentroid,
  getLinestringCentroid,
} from "../geometryProcessing/geometryHelpers";

export function getOriginNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "getters",
    type: "origin",
    inputs: [
      {
        type: "group",
        name: "mesh",
        id: 0,
        value: true,
        slotValueType: "mesh",
        groupIndex: 0,
      },
      {
        type: "group",
        name: "linestring",
        id: 1,
        value: false,
        slotValueType: "linestring",
        groupIndex: 0,
      },
    ],
    outputs: [{ type: "vector", name: "origin", id: 2 }],
    function: (node, evalFunction) => {
      const activeInputs = getActiveInputIds(node.values, [0, 1]);
      const [geom] = getInputValues(node.inputs, evalFunction, activeInputs);

      if (geom.type === "mesh") {
        const origin = getBufferGeomCentroid(geom.value.attributes.position);
        return {
          2: { type: "vector", value: origin },
        };
      } else if (geom.type === "linestring") {
        const origin = getLinestringCentroid(geom.value);
        return { 2: { type: "vector", value: origin } };
      }
      throw new Error("Invalid inputs to circle node");
    },
  };
}
