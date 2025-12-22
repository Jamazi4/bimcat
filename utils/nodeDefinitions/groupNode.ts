import { nodeDefinition } from "../nodeTypes";
import * as THREE from "three";
import { getInputValues, getListInputValues } from "./nodeUtilFunctions";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import {
  cleanNonManifold,
  dedupeFaces,
} from "../geometryProcessing/geometryHelpers";

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
      const initLinestring = getInputValues(node.inputs, evalFunction, [0])[0];
      const initMesh = getInputValues(node.inputs, evalFunction, [1])[0];

      const childGeoms = getListInputValues(
        node.values,
        node.inputs,
        evalFunction,
      );

      let finalMesh: THREE.BufferGeometry = new THREE.BufferGeometry();
      if (initMesh && initMesh.type === "mesh") {
        const initMeshVal = initMesh.value;
        const childGeomValues = childGeoms.flatMap((c) => {
          if (c && c.type === "mesh" && c.value !== undefined) {
            return c.value;
          } else return [];
        });

        finalMesh = BufferGeometryUtils.mergeGeometries(
          [initMeshVal, ...childGeomValues],
          true,
        );
        finalMesh = BufferGeometryUtils.mergeVertices(finalMesh);
      }

      const finalLinestring: THREE.Vector3[][] = [];
      if (initLinestring && initLinestring.type === "linestring") {
        finalLinestring.push(...initLinestring.value);
        childGeoms.forEach((geom) => {
          if (geom !== undefined && geom.type === "linestring") {
            finalLinestring.push(...geom.value);
          }
        });
      }

      console.log(finalMesh);

      return {
        2: { type: "linestring", value: finalLinestring },
        3: { type: "mesh", value: finalMesh },
      };
    },
  };
}
