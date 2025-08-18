import { ASTNode, nodeDefinition, NodeEvalResult } from "../nodeTypes";
import * as THREE from "three";
import { lineMat, meshMat, pointMat, wireframeMat } from "../threeJsConstants";

export function outputNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "general",
    type: "output",
    inputs: [
      { type: "slot", id: 0, name: "output", slotValueType: "geometry" },
    ],
    outputs: [],
    function: (
      node: ASTNode,
      evalFunction: (node: ASTNode) => NodeEvalResult,
    ) => {
      //TODO: maybe output just the correct type and bufferGeom and handle the
      //rendering separately
      const outputInput = node.inputs[0];
      const input = evalFunction(outputInput.ast)[outputInput.fromOutputId];

      switch (input.type) {
        case "vector": {
          const geom = new THREE.BufferGeometry().setFromPoints([input.value]);
          const mesh = new THREE.Points(geom, pointMat);
          return { 1: { type: "geometry", value: mesh } };
        }
        case "linestring": {
          const geoms = input.value.map((string) => {
            return new THREE.BufferGeometry().setFromPoints(string);
          });
          const lineGroup = new THREE.Group();
          geoms.forEach((geom) => lineGroup.add(new THREE.Line(geom, lineMat)));
          return { 1: { type: "geometry", value: lineGroup } };
        }
        case "mesh": {
          const surfaceMesh = new THREE.Mesh(input.value, meshMat);
          surfaceMesh.name = "surface";

          const wireframeMesh = new THREE.Mesh(input.value, wireframeMat);
          wireframeMesh.name = "wireframe";

          const combined = new THREE.Group();
          combined.add(surfaceMesh);
          combined.add(wireframeMesh);

          return { 1: { type: "geometry", value: combined } };
        }
        case "string": {
          return { 1: { type: "geometry", value: null } };
        }
        default:
          throw new Error("Unsupported input to output node");
      }
    },
  };
}
