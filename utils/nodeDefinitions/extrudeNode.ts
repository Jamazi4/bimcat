import { nodeDefinition, NodeEvalResult } from "../nodeTypes";
import * as THREE from "three";
import { getInputValues } from "./nodeUtilFunctions";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { createExtrudedMesh } from "../geometryProcessing/geomFunctions";
import { groupBy3Vector } from "../geometryProcessing/geometryHelpers";

export function extrudeNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "modifier",
    type: "extrude",
    inputs: [
      {
        type: "slot",
        name: "vector",
        id: 0,
        slotValueType: "vector",
      },
      {
        type: "group",
        name: "mesh",
        id: 1,
        slotValueType: "mesh",
        groupIndex: 1,
        value: true,
      },
      {
        type: "group",
        name: "linestring",
        id: 2,
        slotValueType: "linestring",
        groupIndex: 1,
        value: false,
      },
    ],
    outputs: [
      { type: "mesh", name: "final", id: 3 },
      { type: "mesh", name: "extrusion", id: 4, onInputSelected: 1 },
      { type: "linestring", name: "extrusion", id: 5, onInputSelected: 2 },
    ],
    function: (node, evalFunction) => {
      const activeInputs = Object.entries(node.values)
        .filter(([key, val]) => val === true && (key === "1" || key === "2"))
        .map(([key, _]) => parseInt(key));
      const [initGeom] = getInputValues(
        node.inputs,
        evalFunction,
        activeInputs,
      );
      const vector = getInputValues(node.inputs, evalFunction, [0])[0];

      if (vector.type === "vector") {
        let baseGeom: THREE.BufferGeometry<THREE.NormalBufferAttributes>;
        let isIndexed = false;

        if (initGeom.type === "mesh" && activeInputs.includes(1)) {
          baseGeom = initGeom.value;
          isIndexed = !!baseGeom.index;
          if (!isIndexed) throw new Error("lost original geom");
        } else if (initGeom.type === "linestring" && activeInputs.includes(2)) {
          baseGeom = new THREE.BufferGeometry();
          baseGeom.setFromPoints(initGeom.value);
          isIndexed = false;
        } else {
          throw new Error("Invalid geometry input");
        }

        if (
          isNaN(vector.value.x) ||
          isNaN(vector.value.y) ||
          isNaN(vector.value.z)
        ) {
          throw new Error(
            `Invalid vector values: x=${vector.value.x}, y=${vector.value.y}, z=${vector.value.z}`,
          );
        }

        const extrudedGeom = baseGeom.clone();
        extrudedGeom.translate(vector.value.x, vector.value.y, vector.value.z);
        extrudedGeom.computeBoundingBox();

        const extruded = isIndexed
          ? BufferGeometryUtils.mergeVertices(extrudedGeom)
          : extrudedGeom;

        const finalGeometry = createExtrudedMesh(baseGeom, extruded, isIndexed);
        const finalMergedGeometry =
          BufferGeometryUtils.mergeVertices(finalGeometry);

        let extrusionOutput: NodeEvalResult;
        if (isIndexed) {
          extrusionOutput = { 4: { type: "mesh", value: extruded } };
        } else {
          extrusionOutput = {
            5: {
              type: "linestring",
              value: groupBy3Vector(extruded.attributes.position.array),
            },
          };
        }

        return {
          3: { type: "mesh", value: finalMergedGeometry },
          ...extrusionOutput,
        };
      }
      throw new Error("Invalid inputs to extrude node");
    },
  };
}
