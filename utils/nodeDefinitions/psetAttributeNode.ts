import { nodeDefinition } from "../nodeTypes";
import { getActiveInputIds, getInputValues } from "./nodeUtilFunctions";

export function psetAttributeNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "UI",
    type: "attribute",
    inputs: [
      {
        type: "string",
        value: "",
        name: "attribute key",
        id: 0,
      },
      {
        type: "group",
        name: "number",
        id: 1,
        slotValueType: "number",
        groupIndex: 1,
        value: true,
      },
      {
        type: "group",
        name: "string",
        id: 2,
        slotValueType: "string",
        groupIndex: 1,
        value: false,
      },
      {
        type: "group",
        name: "boolean",
        id: 3,
        slotValueType: "boolean",
        groupIndex: 1,
        value: false,
      },
    ],
    outputs: [{ type: "string", name: "attribute", id: 4 }],
    function: (node, evalFunction) => {
      const activeInputs = getActiveInputIds(node.values, [1, 2, 3]);
      const val = getInputValues(node.inputs, evalFunction, activeInputs)[0];
      const key = node.values[0];
      const output = `${key}: ${val.value}`;
      return { 4: { type: "string", value: output } };
    },
  };
}
