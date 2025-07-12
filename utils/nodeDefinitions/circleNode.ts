import { nodeDefinition } from "../nodeTypes";
import * as THREE from "three";
import { getComboValues } from "./nodeUtilFunctions";

export function circleNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "generator",
    type: "circle",
    inputs: [
      {
        type: "combo",
        value: 1,
        name: "radius",
        id: 0,
        slotValueType: "number",
      },
      {
        type: "combo",
        value: 16,
        name: "resolution",
        id: 1,
        slotValueType: "number",
      },
    ],
    outputs: [
      { type: "mesh", name: "mesh", id: 2 },
      { type: "linestring", name: "linestring", id: 3 },
    ],
    function: (node, evalFunction) => {
      const [radius, segments] = getComboValues(node, evalFunction, [0, 1]);

      if (typeof radius === "number" && typeof segments === "number") {
        const geom = new THREE.CircleGeometry(radius, segments);
        const positionAttr = geom.getAttribute("position");

        const linestring: THREE.Vector3[] = [];

        for (let i = 0; i < positionAttr.count; i++) {
          const x = positionAttr.getX(i);
          const y = positionAttr.getY(i);
          const z = positionAttr.getZ(i);
          linestring.push(new THREE.Vector3(x, y, z));
        }

        const linestringClean = linestring.slice(1);

        return {
          2: { type: "mesh", value: geom },
          3: { type: "linestring", value: linestringClean },
        };
      }
      throw new Error("Invalid inputs to circle node");
    },
  };
}
