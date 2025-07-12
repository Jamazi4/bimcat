import { nodeDefinition } from "../nodeTypes";

export function numberNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "variable",
    type: "number",
    inputs: [{ type: "number", id: 0, value: 0, name: "number" }],
    outputs: [{ type: "number", name: "number", id: 1 }],
    function: (node, _) => {
      return {
        1: { type: "number", value: (node.values["0"] as number) ?? 0 },
      };
    },
  };
}
