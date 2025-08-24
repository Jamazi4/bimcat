import { nodeDefinition } from "../nodeTypes";
import { getComboValues, smartRound } from "./nodeUtilFunctions";

export function scalarMathNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "math",
    type: "scalar math",
    inputs: [
      {
        type: "select",
        id: 0,
        name: "operation",
        value: 0,
        options: ["add", "subtract", "multiply", "divide"],
      },
      {
        type: "combo",
        id: 1,
        value: 0,
        name: "number",
        slotValueType: "number",
      },
      {
        type: "combo",
        id: 2,
        value: 0,
        name: "number",
        slotValueType: "number",
      },
    ],
    outputs: [{ type: "number", name: "number", id: 3 }],
    function: (node, evalFunction) => {
      const [a, b] = getComboValues(node, evalFunction, [1, 2]);
      const operationId = node.values["0"];
      let result: number = 0;

      if (typeof a === "number" && typeof b === "number") {
        if (operationId === 0) {
          result = a + b;
        } else if (operationId === 1) {
          result = a - b;
        } else if (operationId === 2) {
          result = a * b;
        } else if (operationId === 3) {
          result = a / b;
        }
      }

      const roundedResult = smartRound(result);

      return {
        3: { type: "number", value: Number(roundedResult) },
      };
    },
  };
}
