import { nodeDefinition } from "../nodeTypes";
import { getComboValues } from "./nodeUtilFunctions";

export function sliderNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "variable",
    type: "slider",
    inputs: [
      {
        type: "combo",
        slotValueType: "number",
        id: 0,
        value: 1,
        name: "start",
      },
      { type: "combo", slotValueType: "number", id: 1, value: 2, name: "stop" },
      {
        type: "combo",
        slotValueType: "number",
        id: 2,
        value: 0.01,
        name: "step",
      },
      { type: "number", isSlider: true, id: 3, value: 0, name: "number" },
    ],
    outputs: [{ type: "number", name: "number", id: 4 }],
    function: (node, evalFun) => {
      const start = +getComboValues(node, evalFun, [0]);
      const stop = +getComboValues(node, evalFun, [1]);
      const step = +getComboValues(node, evalFun, [2]);
      const val = parseFloat(node.values[3] as string);

      const range = stop - start;
      const ratio = val / 100;
      const cont = range * ratio + start;
      const stepsFromStart = Math.round((cont - start) / step);
      const final = start + stepsFromStart * step;
      const clampedFinal = Math.max(start, Math.min(stop, final));

      return {
        4: { type: "number", value: clampedFinal ?? 0 },
      };
    },
  };
}
