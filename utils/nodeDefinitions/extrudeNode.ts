import earcut from "earcut";
import { nodeDefinition, NodeEvalResult } from "../nodeTypes";
import * as THREE from "three";
import { getInputValues } from "./nodeUtilFunctions";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import {
  createExtrudedMesh,
  extractBoundaryEdges,
  orderBoundaryEdges,
} from "../geometryProcessing/geomFunctions";
import {
  composeRelativeTransformMatrix,
  groupBy3Vector,
} from "../geometryProcessing/geometryHelpers";

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
      { type: "mesh", name: "extrusion", id: 5, onBooleanTrueId: 3 },
      {
        type: "linestring",
        name: "extrusion",
        id: 6,
        onBooleanTrueId: 3,
        onBooleanInverted: true,
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

      if (transform.type === "transform" && typeof capped === "boolean") {
        let baseGeom: THREE.BufferGeometry<THREE.NormalBufferAttributes>;
        const isInputMesh =
          initGeom.type === "mesh" && activeInputs.includes(1);

        if (isInputMesh) {
          // Aggressively clean the input mesh for robust modeling
          const cleanGeom = initGeom.value.clone();
          cleanGeom.deleteAttribute("normal");
          cleanGeom.deleteAttribute("uv");
          baseGeom = BufferGeometryUtils.mergeVertices(cleanGeom);
        } else if (initGeom.type === "linestring" && activeInputs.includes(2)) {
          const points = initGeom.value as THREE.Vector3[];
          // This affects both the side walls and the triangulated cap.
          let area = 0;
          for (let i = 0; i < points.length; i++) {
            const p1 = points[i];
            const p2 = points[(i + 1) % points.length];
            // Using X and Y for the 2D shoelace formula. Assumes shape is mostly flat on XY plane.
            area += p1.x * p2.y - p2.x * p1.y;
          }

          if (area < 0) {
            // If clockwise, reverse the points to make it counter-clockwise.
            points.reverse();
          }

          baseGeom = new THREE.BufferGeometry();
          baseGeom.setFromPoints(points);
        } else {
          throw new Error("Invalid geometry input");
        }

        const transformMatrix = composeRelativeTransformMatrix(
          baseGeom,
          transform.value,
        );

        let extrudedGeom = new THREE.BufferGeometry();
        extrudedGeom.copy(baseGeom);
        extrudedGeom.applyMatrix4(transformMatrix);

        const includeBase = isInputMesh;
        const includeTop = capped;

        if (includeTop && !extrudedGeom.index) {
          const extrudedIndices = earcut(
            extrudedGeom.attributes.position.array,
            [],
            3,
          );
          extrudedGeom.setIndex(extrudedIndices);
          extrudedGeom.computeVertexNormals();
        }

        let finalGeometry = createExtrudedMesh(
          baseGeom,
          extrudedGeom,
          isInputMesh, // isIndexed for sides generation
          includeBase,
          includeTop,
        );
        finalGeometry.computeVertexNormals();
        if (!finalGeometry.getIndex()) {
          finalGeometry = BufferGeometryUtils.mergeVertices(finalGeometry);
        }

        let extrusionOutput: NodeEvalResult;
        if (capped) {
          if (isInputMesh) {
            // Check if flipped
            const determinant = transformMatrix.determinant();
            if (determinant < 0) {
              const indices = extrudedGeom.index!.array;
              for (let i = 0; i < indices.length; i += 3) {
                // Swap two vertices in each triangle to flip the face
                [indices[i + 1], indices[i + 2]] = [
                  indices[i + 2],
                  indices[i + 1],
                ];
              }
            }

            extrudedGeom.deleteAttribute("normal");
            extrudedGeom = BufferGeometryUtils.mergeVertices(extrudedGeom);
            extrudedGeom.computeVertexNormals();
            extrudedGeom = BufferGeometryUtils.toCreasedNormals(
              extrudedGeom,
              0.01,
            );
          }
          extrusionOutput = { 5: { type: "mesh", value: extrudedGeom } };
        } else {
          let extrusionLines: THREE.Vector3[];
          if (isInputMesh) {
            const mergedGeom = BufferGeometryUtils.mergeVertices(extrudedGeom);
            const boundaryEdges = extractBoundaryEdges(mergedGeom);
            const orderedIndexPaths = orderBoundaryEdges(boundaryEdges);
            const positions = mergedGeom.attributes.position.array;
            // Flatten the array of paths into a single linestring array
            extrusionLines = orderedIndexPaths.flatMap((path) =>
              path.map((index) =>
                new THREE.Vector3().fromArray(positions, index * 3),
              ),
            );
          } else {
            extrusionLines = groupBy3Vector(
              extrudedGeom.attributes.position.array,
            );
          }
          extrusionOutput = {
            6: {
              type: "linestring",
              value: extrusionLines,
            },
          };
        }

        return {
          4: { type: "mesh", value: finalGeometry },
          ...extrusionOutput,
        };
      }
      throw new Error("Invalid inputs to extrude node");
    },
  };
}
