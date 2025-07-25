import { nodeDefinition } from "../nodeTypes";
import * as THREE from "three";
import { getComboValues, getInputValues } from "./nodeUtilFunctions";
import { defaultTransformContructor } from "./defaultNodes";
import { composeTransformMatrix } from "../geometryProcessing/geometryHelpers";

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
      {
        type: "slot",
        name: "transform",
        id: 2,
        slotValueType: "transform",
        defaultValue: defaultTransformContructor(),
      },
    ],
    outputs: [
      { type: "mesh", name: "mesh", id: 3 },
      { type: "linestring", name: "linestring", id: 4 },
    ],
    function: (node, evalFunction) => {
      const [radius, segments] = getComboValues(node, evalFunction, [0, 1]);
      const [transform] = getInputValues(node.inputs, evalFunction, [2]);

      if (
        typeof radius === "number" &&
        typeof segments === "number" &&
        transform.type === "transform"
      ) {
        const geom = new THREE.CircleGeometry(radius, segments);

        const transformMatrix = composeTransformMatrix(transform.value);
        geom.applyMatrix4(transformMatrix);

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
          3: { type: "mesh", value: geom },
          4: { type: "linestring", value: [linestringClean] },
        };
      }
      throw new Error("Invalid inputs to circle node");
    },
  };
}
