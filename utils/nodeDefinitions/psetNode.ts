import { nodeDefinition } from "../nodeTypes";
import { getInputValues, getListInputValues } from "./nodeUtilFunctions";

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
    function: (node, evalFunction) => {
      const inputVal = getListInputValues(
        node.values,
        node.inputs,
        evalFunction,
      );
      const firstOne = getInputValues(node.inputs, evalFunction, [1])[0];

      let output = "";
      inputVal.forEach((v) => {
        if (v && v.value) {
          output += String(v.value) + "/";
        }
      });

      output += firstOne.value;

      return { 2: { type: "string", value: output } };
    },
  };
}
