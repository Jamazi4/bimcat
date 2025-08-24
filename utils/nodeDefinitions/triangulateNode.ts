import * as THREE from "three";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { nodeDefinition } from "../nodeTypes";
import { getInputValues } from "./nodeUtilFunctions";
import { triangulateLinestringsWithHoles } from "../geometryProcessing/extrusion";
import { defaultLinestringConstructor } from "./defaultNodes";

export function triangulateNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "modifier",
    type: "triangulate",
    inputs: [
      {
        type: "slot",
        name: "linestring",
        id: 0,
        slotValueType: "linestring",
      },
      {
        type: "slot",
        name: "hole",
        id: 1,
        slotValueType: "linestring",
        defaultValue: defaultLinestringConstructor(),
      },
    ],
    outputs: [{ type: "mesh", name: "mesh", id: 2 }],
    function: (node, evalFunction) => {
      const [linestring] = getInputValues(node.inputs, evalFunction, [0]);
      const [holes] = getInputValues(node.inputs, evalFunction, [1]);

      if (
        linestring?.type === "linestring" &&
        Array.isArray(linestring.value) &&
        linestring.value.length > 0
      ) {
        if (linestring.value.length > 1) {
          throw new Error(
            "Triangulate accepts only a single, continuous linestring",
          );
        }

        const outer = linestring.value[0];

        let holePolys: THREE.Vector3[][] = [];
        if (holes?.type === "linestring" && Array.isArray(holes.value)) {
          holePolys = (holes.value as THREE.Vector3[][]).filter(
            (h: THREE.Vector3[]) => h.length >= 3,
          );
        }

        const geom = triangulateLinestringsWithHoles(outer, holePolys);
        if (!geom) throw new Error("Error triangulating linestring with holes");
        const final = BufferGeometryUtils.mergeVertices(geom);

        return {
          2: { type: "mesh", value: final },
        };
      }
      throw new Error("Invalid inputs to triangulate node");
    },
  };
}
