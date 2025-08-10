import { nodeDefinition } from "../nodeTypes";

export function uiControlNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "UI",
    type: "ui control",
    inputs: [
      {
        type: "string",
        name: "name",
        id: 0,
        value: "",
      },
      {
        type: "group",
        value: true,
        name: "number",
        id: 1,
        groupIndex: 1,
        slotValueType: "number",
      },
      {
        type: "group",
        value: false,
        name: "boolean",
        id: 2,
        groupIndex: 1,
        slotValueType: "boolean",
      },
    ],
    outputs: [],
    function: (_, __) => {
      return {};
    },
  };
}
