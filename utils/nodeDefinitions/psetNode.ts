import { nodeDefinition } from "../nodeTypes";

export function psetNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "UI",
    type: "pset",
    inputs: [
      {
        type: "string",
        value: "",
        name: "pset name",
        id: 0,
      },
      {
        type: "slot",
        name: "attribute",
        id: 1,
        slotValueType: "string",
        isList: true,
      },
    ],
    outputs: [],
    function: (_, __) => {
      return {};
    },
  };
}
