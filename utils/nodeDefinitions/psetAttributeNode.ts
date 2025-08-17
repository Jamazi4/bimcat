import { nodeDefinition } from "../nodeTypes";

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
    function: (_, __) => {
      return {};
    },
  };
}
