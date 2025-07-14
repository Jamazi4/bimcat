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
          baseGeom = BufferGeometryUtils.mergeVertices(cleanGeom);
        } else if (initGeom.type === "linestring" && activeInputs.includes(2)) {
          baseGeom = new THREE.BufferGeometry();
          baseGeom.setFromPoints(initGeom.value);
        } else {
          throw new Error("Invalid geometry input");
        }

        const transformMatrix = composeRelativeTransformMatrix(
          baseGeom,
          transform.value,
        );

        // Apply to a copy of the geometry
        const extrudedGeom = new THREE.BufferGeometry();
        extrudedGeom.copy(baseGeom);
        extrudedGeom.applyMatrix4(transformMatrix);

        const includeBase = isInputMesh;
        const includeTop = capped;

        // If we need a top cap and the base was a linestring, create faces for the top
        if (includeTop && !extrudedGeom.index) {
          const extrudedIndices = earcut(
            extrudedGeom.attributes.position.array,
            [],
            3,
          );
          extrudedGeom.setIndex(extrudedIndices);
        }

        const finalGeometry = createExtrudedMesh(
          baseGeom,
          extrudedGeom,
          isInputMesh, // isIndexed for sides generation
          includeBase,
          includeTop,
        );

        let extrusionOutput: NodeEvalResult;
        if (capped) {
          // When capped, the top is always a mesh.
          // `extrudedGeom` has been given indices if it was from a linestring.
          extrusionOutput = { 5: { type: "mesh", value: extrudedGeom } };
        } else {
          let extrusionLine: THREE.Vector3[];
          if (isInputMesh) {
            const mergedGeom = BufferGeometryUtils.mergeVertices(extrudedGeom);
            const boundaryEdges = extractBoundaryEdges(mergedGeom);
            const orderedIndices = orderBoundaryEdges(boundaryEdges);
            const positions = mergedGeom.attributes.position.array;
            extrusionLine = orderedIndices.map((index) => {
              return new THREE.Vector3().fromArray(positions, index * 3);
            });
          } else {
            extrusionLine = groupBy3Vector(
              extrudedGeom.attributes.position.array,
            );
          }
          // When not capped, the extrusion is a linestring.
          extrusionOutput = {
            6: {
              type: "linestring",
              value: extrusionLine,
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
