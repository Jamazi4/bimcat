import earcut from "earcut";
import { nodeDefinition, NodeEvalResult } from "../nodeTypes";
import * as THREE from "three";
import { getInputValues } from "./nodeUtilFunctions";
import * as BufferGeometryUtils from "three/addons/utils/BufferGeometryUtils.js";
import { createExtrudedMesh } from "../geometryProcessing/geomFunctions";
import {
  composeRelativeTransformMatrix,
  groupBy3Vector,
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
      let baseLinestring: THREE.Vector3[] = [];
      const meshExtrusionOutput = new THREE.BufferGeometry();
      const linestringExtrusionOutput: THREE.Vector3[] = [];
      const finalOutput = new THREE.BufferGeometry();
      let isBaseClosed: boolean = true;
      let isInputMesh: boolean = activeInputs.includes(1);

      if (transform.type === "transform" && typeof capped === "boolean") {
        if (initGeom.type === "linestring") {
          isInputMesh = false;

          baseLinestring = initGeom.value;
          isBaseClosed = isClosedLoop(baseLinestring);

          baseGeom.setFromPoints(baseLinestring);
          if (baseLinestring.length === 2) {
            baseGeom.setIndex([0, 1]);
          } else {
            const indices = earcut(baseGeom.attributes.position.array, [], 3);
            baseGeom.setIndex(indices);
          }
        } else if (initGeom.type === "mesh") {
          isInputMesh = true;
          baseGeom = initGeom.value.clone();
          baseLinestring = extractOrderedBoundaryLoop(baseGeom).flat();
          //assume for now that it's always indexed
        }

        baseGeom = BufferGeometryUtils.mergeVertices(baseGeom);
        baseGeom.computeVertexNormals();
        const transformMatrix = composeRelativeTransformMatrix(
          baseGeom,
          transform.value,
        );

        const tempMesh = baseGeom.clone();
        tempMesh.applyMatrix4(transformMatrix);

        //1. just for not capped extrusion output
        if (baseLinestring.length === 2) {
          //if input was a sigle edge
          groupBy3Vector(tempMesh.attributes.position.array).forEach((v) =>
            linestringExtrusionOutput.push(v),
          );
        } else {
          //if input was normal linestring
          if (!isInputMesh) {
            linestringExtrusionOutput.push(
              ...groupBy3Vector(tempMesh.attributes.position.array),
            );
          } else {
            linestringExtrusionOutput.push(
              ...extractOrderedBoundaryLoop(tempMesh).flat(),
            );
          }
          if (isBaseClosed && !isClosedLoop(linestringExtrusionOutput)) {
            linestringExtrusionOutput.push(linestringExtrusionOutput[0]);
          }

          const indices = earcut(tempMesh.attributes.position.array, [], 3);
          meshExtrusionOutput.copy(tempMesh);
          meshExtrusionOutput.setIndex(indices);
          meshExtrusionOutput.computeVertexNormals();
        }
        //2. for capped extrusion output
        if (isInputMesh) {
          meshExtrusionOutput.copy(tempMesh);
        }

        const sideGeom = createSideGeometry(
          baseLinestring,
          linestringExtrusionOutput,
          isBaseClosed,
        );

        //3. for uncapped final with mesh input
        //4. for capped final with mesh input

        return {
          4: { type: "mesh", value: sideGeom },
          5: { type: "mesh", value: meshExtrusionOutput },
          6: { type: "linestring", value: linestringExtrusionOutput },
        };
      }
      throw new Error("Invalid inputs to extrude node");
    },
  };
}
