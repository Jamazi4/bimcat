import earcut from "earcut";
import { nodeDefinition } from "../nodeTypes";
import * as THREE from "three";
import { getInputValues } from "./nodeUtilFunctions";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import {
  closeLinestrings,
  composeRelativeTransformMatrix,
  isClosedLoop,
} from "../geometryProcessing/geometryHelpers";
import {
  createSideGeometry,
  extractOrderedBoundaryLoop,
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
        type: "boolean",
        name: "capped",
        id: 3,
        value: false,
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
      const activeInputs = Object.entries(node.values)
        .filter(([key, val]) => val === true && (key === "1" || key === "2"))
        .map(([key, _]) => parseInt(key));
      const [initGeom] = getInputValues(
        node.inputs,
        evalFunction,
        activeInputs,
      );
      const [transform] = getInputValues(node.inputs, evalFunction, [0]);
      const capped = node.values[3];

      //Now doesn't shout whatever I insert
      let baseGeom = new THREE.BufferGeometry();
      let baseLinestrings: THREE.Vector3[][] = [];
      const meshExtrusionOutput = new THREE.BufferGeometry();
      const linestringExtrusionOutput: THREE.Vector3[][] = [];
      let finalOutput = new THREE.BufferGeometry();
      let isBaseClosed: boolean[] = [];
      let isInputMesh: boolean = activeInputs.includes(1);

      if (transform.type === "transform" && typeof capped === "boolean") {
        if (initGeom.type === "linestring") {
          isInputMesh = false;

          baseLinestrings = initGeom.value;
          isBaseClosed = baseLinestrings.map((l) => isClosedLoop(l))

          baseGeom.setFromPoints(baseLinestrings.flat());
          if (baseLinestrings.length === 2) {
            baseGeom.setIndex([0, 1]);
          } else {
            const positions: number[] = []
            const indices: number[] = []
            let vertexOffset = 0;

            for (const polygon of baseLinestrings) {
              const flat3D: number[] = []
              for (const v of polygon) {
                flat3D.push(v.x, v.y, v.z);
                positions.push(v.x, v.y, v.z)
              }

              const tris = earcut(flat3D, [], 3)
              for (const idx of tris) {
                indices.push(idx + vertexOffset)
              }
              vertexOffset += polygon.length;
            }
          }
        } else if (initGeom.type === "mesh") {
          isInputMesh = true;
          baseGeom = initGeom.value.clone();
          baseLinestrings = extractOrderedBoundaryLoop(baseGeom);

          isBaseClosed = Array(baseLinestrings.length).fill(true)
          //mesh boundaries always closed
          closeLinestrings(baseLinestrings, isBaseClosed)
        }

        baseGeom = BufferGeometryUtils.mergeVertices(baseGeom);
        baseGeom.computeVertexNormals();
        baseGeom.deleteAttribute('uv')
        const transformMatrix = composeRelativeTransformMatrix(
          baseGeom,
          transform.value,
        );

        const tempMesh = baseGeom.clone();
        tempMesh.applyMatrix4(transformMatrix);

        if (!isInputMesh) {
          baseLinestrings.forEach((linestring) => {
            const temp: THREE.Vector3[] = []
            linestring.forEach((v) => {
              const newVector = v.clone().applyMatrix4(transformMatrix)
              temp.push(newVector)
            })
            linestringExtrusionOutput.push(temp)
          })

        } else {
          linestringExtrusionOutput.push(
            ...extractOrderedBoundaryLoop(tempMesh),
          );
        }

        closeLinestrings(linestringExtrusionOutput, isBaseClosed)

        for (let i = 0; i < baseLinestrings.length; i++) {
          const base = [...baseLinestrings[i]]
          if (base.length < 2) continue

          if (isBaseClosed[i] && isClosedLoop(base)) {
            base.push(base[0].clone())
          }
        }

        const indices = earcut(tempMesh.attributes.position.array, [], 3);
        meshExtrusionOutput.copy(tempMesh);
        meshExtrusionOutput.setIndex(indices);
        meshExtrusionOutput.computeVertexNormals();


        const sideGeom = createSideGeometry(
          baseLinestrings,
          transformMatrix,
          isBaseClosed,
        );
        if (!sideGeom) throw new Error("Could not create side geometries")

        if (isInputMesh) {
          meshExtrusionOutput.copy(tempMesh);
          finalOutput = BufferGeometryUtils.mergeGeometries([sideGeom, baseGeom])
        } else {
          finalOutput = sideGeom
        }

        if (capped) {
          finalOutput = BufferGeometryUtils.mergeGeometries([finalOutput, meshExtrusionOutput])
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
