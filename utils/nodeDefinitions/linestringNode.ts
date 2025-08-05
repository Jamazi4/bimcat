import { nodeDefinition } from "../nodeTypes";
import { getListInputValues } from "./nodeUtilFunctions";

export function linestringNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "generator",
    type: "linestring",
    inputs: [
      { type: "slot", name: "vector", id: 0, slotValueType: "vector" },
      {
        type: "slot",
        name: "vector",
        id: 1,
        slotValueType: "vector",
        isList: true,
      },
    ],
    outputs: [{ type: "linestring", name: "linestring", id: 2 }],
    function: (node, evalFunction) => {
      const p1Input = node.inputs[0];
      const p1 = evalFunction(p1Input.ast)[p1Input.fromOutputId];

      const p2Input = node.inputs[1];
      const p2 = evalFunction(p2Input.ast)[p2Input.fromOutputId];

      const listValues = getListInputValues(
        node.values,
        node.inputs,
        evalFunction,
      );

      if (p1.type === "vector" && p2.type === "vector") {
        const finalLinestring = [[p1.value, p2.value]];
        listValues.forEach((l) => {
          if (l && l.type === "vector") {
            finalLinestring[0].push(l.value);
          }
        });
        return { 2: { type: "linestring", value: finalLinestring } };
      }
      throw new Error("Invalid inputs to edgeByPoints");
    },
  };
}
