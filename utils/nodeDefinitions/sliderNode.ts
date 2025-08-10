import { nodeDefinition } from "../nodeTypes";

export function sliderNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "variable",
    type: "slider",
    inputs: [
      { type: "number", isSlider: true, id: 0, value: 0, name: "number" },
    ],
    outputs: [{ type: "number", name: "number", id: 1 }],
    function: (node, _) => {
      return {
        1: { type: "number", value: (node.values["0"] as number) ?? 0 },
      };
    },
  };
}
