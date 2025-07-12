import { nodeDefinition } from "../nodeTypes";

export function booleanNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "variable",
    type: "boolean",
    inputs: [{ type: "boolean", name: "boolean", id: 0, value: false }],
    outputs: [{ type: "boolean", name: "boolean", id: 1 }],
    function: (node, _) => {
      return {
        1: {
          type: "boolean",
          value: node.values["0"] as boolean,
        },
      };
    },
  };
}

export default booleanNode;
