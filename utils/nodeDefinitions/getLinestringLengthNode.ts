import { nodeDefinition } from "../nodeTypes";
import { getInputValues, smartRound } from "./nodeUtilFunctions";

export function getLinestringLengthNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "getters",
    type: "length",
    inputs: [
      {
        type: "slot",
        name: "linestring",
        id: 0,
        slotValueType: "linestring",
      },
    ],
    outputs: [{ type: "number", name: "number", id: 1 }],
    function: (node, evalFunction) => {
      const [linestring] = getInputValues(node.inputs, evalFunction, [0]);

      if (linestring.type === "linestring") {
        let total = 0;

        for (const line of linestring.value) {
          if (line.length < 2) continue; // need at least 2 points
          for (let i = 0; i < line.length - 1; i++) {
            total += line[i].distanceTo(line[i + 1]);
          }
        }
        total = +smartRound(total);
        return {
          1: { type: "number", value: total },
        };
      }

      throw new Error("Invalid inputs to plane node");
    },
  };
}
