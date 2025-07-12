import { nodeDefinition } from "../nodeTypes";
import * as THREE from "three";
import { defaultVector } from "./defaultNodes";
import { getComboValues, getInputValues } from "./nodeUtilFunctions";

export function planeNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "generator",
    type: "plane",
    inputs: [
      {
        type: "combo",
        value: 1,
        name: "width",
        id: 0,
        slotValueType: "number",
      },
      {
        type: "combo",
        value: 1,
        name: "height",
        id: 1,
        slotValueType: "number",
      },
      {
        type: "slot",
        name: "position",
        id: 2,
        slotValueType: "vector",
        defaultValue: defaultVector,
      },
    ],
    outputs: [
      { type: "mesh", name: "mesh", id: 4 },
      { type: "linestring", name: "linestring", id: 5 },
    ],
    function: (node, evalFunction) => {
      const [dim1, dim2] = getComboValues(node, evalFunction, [0, 1]);
      const [p] = getInputValues(node.inputs, evalFunction, [2]);

      if (
        p.type === "vector" &&
        typeof dim1 === "number" &&
        typeof dim2 === "number"
      ) {
        const x = p.value.x;
        const y = p.value.y;
        const z = p.value.z;

        const w = dim1;
        const h = dim2;
        const vertices = new Float32Array([
          x,
          y,
          z,
          x + w,
          y,
          z,
          x + w,
          y,
          z + h,
          x,
          y,
          z + h,
        ]);

        const indices = [0, 1, 2, 2, 3, 0];
        const mesh = new THREE.BufferGeometry();
        mesh.setIndex(indices);
        mesh.setAttribute("position", new THREE.BufferAttribute(vertices, 3));
        mesh.computeVertexNormals();

        const linestring = [
          new THREE.Vector3(x, y, z),
          new THREE.Vector3(x + w, y, z),
          new THREE.Vector3(x + w, y, z + h),
          new THREE.Vector3(x, y, z + h),
          new THREE.Vector3(x, y, z),
        ];

        return {
          4: { type: "mesh", value: mesh },
          5: { type: "linestring", value: linestring },
        };
      }
      throw new Error("Invalid inputs to plane node");
    },
  };
}
