import { nodeDefinition } from "../nodeTypes";
import * as THREE from "three";
import {
  getActiveInputIds,
  getComboValues,
  getInputValues,
} from "./nodeUtilFunctions";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import {
  applyTransform,
  closeLinestrings,
  composeRelativeTransformMatrix,
  isClosedLoop,
} from "../geometryProcessing/geometryHelpers";
import {
  createSideGeometry,
  extractOrderedBoundaryLoop,
  triangulateLinestrings,
  triangulatePolygon3D,
} from "../geometryProcessing/extrusion";

export function extrudeNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "modifier",
    type: "extrude",
    inputs: [
      {
        type: "slot",
        name: "transform",
        id: 0,
        slotValueType: "transform",
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
      {
        type: "combo",
        name: "capped",
        id: 3,
        slotValueType: "boolean",
        value: true,
      },
    ],
    outputs: [
      { type: "mesh", name: "final", id: 4 },
      { type: "mesh", name: "extrusion", id: 5 },
      {
        type: "linestring",
        name: "extrusion",
        id: 6,
      },
    ],
    function: (node, evalFunction) => {
      const activeInputs = getActiveInputIds(node.values, [1, 2]);
      const [initGeom] = getInputValues(
        node.inputs,
        evalFunction,
        activeInputs,
      );
      const [transform] = getInputValues(node.inputs, evalFunction, [0]);
      const capped = getComboValues(node, evalFunction, [3])[0];

      let baseGeom = new THREE.BufferGeometry();
      let baseLinestrings: THREE.Vector3[][] = [];
      let meshExtrusionOutput = new THREE.BufferGeometry();
      const linestringExtrusionOutput: THREE.Vector3[][] = [];
      let finalOutput = new THREE.BufferGeometry();
      let isBaseClosed: boolean[] = [];
      let isInputMesh: boolean = activeInputs.includes(1);

      if (transform.type === "transform" && typeof capped === "boolean") {
        if (initGeom.type === "linestring") {
          isInputMesh = false;

          baseLinestrings = initGeom.value;
          isBaseClosed = baseLinestrings.map((l) => isClosedLoop(l));

          baseGeom.setFromPoints(baseLinestrings.flat());
          if (baseLinestrings.length === 2) {
            baseGeom.setIndex([0, 1]);
          } else {
            const positions: number[] = [];
            const indices: number[] = [];
            let vertexOffset = 0;

            for (const polygon of baseLinestrings) {
              const result = triangulatePolygon3D(polygon);
              if (result) {
                for (const idx of result.indices) {
                  indices.push(idx + vertexOffset);
                }
                for (let i = 0; i < result.positions.length; i++) {
                  positions.push(result.positions[i]);
                }
                vertexOffset += polygon.length;
              }
            }
          }
        } else if (initGeom.type === "mesh") {
          isInputMesh = true;
          baseGeom = initGeom.value.clone();
          baseLinestrings = extractOrderedBoundaryLoop(baseGeom);

          isBaseClosed = Array(baseLinestrings.length).fill(true);
          //mesh boundaries always closed
          closeLinestrings(baseLinestrings, isBaseClosed);
        }

        baseGeom = BufferGeometryUtils.mergeVertices(baseGeom);
        baseGeom.computeVertexNormals();
        baseGeom.deleteAttribute("uv");

        const positionMatrix = new THREE.Matrix4().makeTranslation(
          transform.value.position.x,
          transform.value.position.y,
          transform.value.position.z,
        );

        // Create positioned copy for relative transform calculation
        const positionedBaseGeom = baseGeom.clone();
        positionedBaseGeom.applyMatrix4(positionMatrix);

        // Then apply relative transform (rotation/scale around origin)
        const relativeTransformMatrix = composeRelativeTransformMatrix(
          positionedBaseGeom,
          transform.value,
        );

        const tempMesh = positionedBaseGeom.clone();
        tempMesh.applyMatrix4(relativeTransformMatrix);

        if (!isInputMesh) {
          baseLinestrings.forEach((linestring) => {
            const temp: THREE.Vector3[] = [];
            linestring.forEach((v) => {
              // Apply the same 2-step transform to each vertex
              const positioned = v.clone().applyMatrix4(positionMatrix);
              const transformed = positioned
                .clone()
                .applyMatrix4(relativeTransformMatrix);
              temp.push(transformed);
            });
            linestringExtrusionOutput.push(temp);
          });
        } else {
          linestringExtrusionOutput.push(
            ...extractOrderedBoundaryLoop(tempMesh),
          );
        }

        closeLinestrings(linestringExtrusionOutput, isBaseClosed);

        for (let i = 0; i < baseLinestrings.length; i++) {
          const base = [...baseLinestrings[i]];
          if (base.length < 2) continue;

          if (isBaseClosed[i] && isClosedLoop(base)) {
            base.push(base[0].clone());
          }
        }

        meshExtrusionOutput = triangulateLinestrings(
          linestringExtrusionOutput,
        )!;

        if (!meshExtrusionOutput) throw new Error("Error creating cap");

        const sideGeom = createSideGeometry(
          baseLinestrings,
          transform.value,
          isBaseClosed,
        );
        if (!sideGeom) throw new Error("Could not create side geometries");

        if (isInputMesh) {
          meshExtrusionOutput.copy(tempMesh);
          finalOutput = BufferGeometryUtils.mergeGeometries([
            sideGeom,
            baseGeom,
          ]);
        } else {
          finalOutput = sideGeom;
        }

        if (capped) {
          finalOutput = BufferGeometryUtils.mergeGeometries([
            finalOutput,
            meshExtrusionOutput,
          ]);
        }

        return {
          4: { type: "mesh", value: finalOutput },
          5: { type: "mesh", value: meshExtrusionOutput },
          6: { type: "linestring", value: linestringExtrusionOutput },
        };
      }
      throw new Error("Invalid inputs to extrude node");
    },
  };
}
