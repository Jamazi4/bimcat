import { nodeDefinition } from "../nodeTypes";

export function linestringNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "generator",
    type: "linestring",
    inputs: [
      { type: "slot", name: "start", id: 0, slotValueType: "vector" },
      { type: "slot", name: "end", id: 1, slotValueType: "vector" },
    ],
    outputs: [{ type: "linestring", name: "linestring", id: 2 }],
    function: (node, evalFunction) => {
      const p1Input = node.inputs[0];
      const p1 = evalFunction(p1Input.ast)[p1Input.fromOutputId];

      const p2Input = node.inputs[1];
      const p2 = evalFunction(p2Input.ast)[p2Input.fromOutputId];

      if (p1.type === "vector" && p2.type === "vector") {
        return { 2: { type: "linestring", value: [[p1.value, p2.value]] } };
      }
      throw new Error("Invalid inputs to edgeByPoints");
    },
  };
}
