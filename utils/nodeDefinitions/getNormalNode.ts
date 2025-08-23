import { nodeDefinition } from "../nodeTypes";
import { getInputValues } from "./nodeUtilFunctions";
import { getResultantNormal } from "../geometryProcessing/geometryHelpers";

export function getNormalNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "getters",
    type: "normal",
    inputs: [
      {
        type: "slot",
        name: "mesh",
        id: 0,
        slotValueType: "mesh",
      },
    ],
    outputs: [{ type: "vector", name: "normal", id: 1 }],
    function: (node, evalFunction) => {
      const [geom] = getInputValues(node.inputs, evalFunction, [0]);

      if (geom.type === "mesh") {
        const normal = getResultantNormal(geom.value);
        return {
          1: { type: "vector", value: normal },
        };
      }
      throw new Error("Invalid inputs to circle node");
    },
  };
}
