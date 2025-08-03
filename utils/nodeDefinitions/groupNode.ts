import { nodeDefinition } from "../nodeTypes";
import * as THREE from "three";
import { getComboValues, getInputValues } from "./nodeUtilFunctions";

export function groupNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "general",
    type: "group",
    inputs: [
      {
        type: "group",
        slotValueType: "linestring",
        groupIndex: 0,
        name: "linestring",
        id: 0,
        value: true,
        isList: true,
      },
      {
        type: "group",
        slotValueType: "mesh",
        groupIndex: 0,
        name: "mesh",
        id: 1,
        value: false,
        isList: true,
      },
    ],
    outputs: [
      { type: "linestring", name: "linestring", id: 2, onInputSelectedId: 0 },
      { type: "mesh", name: "mesh", id: 3, onInputSelectedId: 1 },
    ],
    function: (node, evalFunction) => {
      const initLinestring = getInputValues(node.inputs, evalFunction, [0]);
      const initMesh = getInputValues(node.inputs, evalFunction, [1]);

      Object.entries(node.values).forEach(([key, _]) => {
        const id = parseInt(key);
        if (id >= 100) {
          const data = getInputValues(node.inputs, evalFunction, [id]);
          console.log(data);
        }
      });

      console.log(node.values);

      console.log(initLinestring, initMesh);

      return {
        3: { type: "mesh", value: geom },
        4: { type: "linestring", value: [linestring] },
      };
    },
  };
}
