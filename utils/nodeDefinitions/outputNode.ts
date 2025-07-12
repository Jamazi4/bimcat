import { ASTNode, nodeDefinition, NodeEvalResult } from "../nodeTypes";
import * as THREE from "three";

export function outputNode(nodeDefId: number): nodeDefinition {
  return {
    nodeDefId: nodeDefId,
    category: "general",
    type: "output",
    inputs: [
      { type: "slot", id: 0, name: "geometry", slotValueType: "geometry" },
    ],
    outputs: [],
    function: (
      node: ASTNode,
      evalFunction: (node: ASTNode) => NodeEvalResult,
    ) => {
      const outputInput = node.inputs[0];
      const input = evalFunction(outputInput.ast)[outputInput.fromOutputId];

      switch (input.type) {
        case "vector": {
          const geom = new THREE.BufferGeometry().setFromPoints([input.value]);
          const mat = new THREE.PointsMaterial({
            color: 0x7aadfa,
            size: 0.05,
          });
          const mesh = new THREE.Points(geom, mat);
          return { 1: { type: "geometry", value: mesh } };
        }
        case "linestring": {
          const geom = new THREE.BufferGeometry().setFromPoints(input.value);
          const mat = new THREE.LineBasicMaterial({ color: 0x7aadfa });
          const linestring = new THREE.Line(geom, mat);
          return { 1: { type: "geometry", value: linestring } };
        }
        case "mesh": {
          const mat = new THREE.MeshStandardMaterial({
            color: 0x7aadfa,
            side: THREE.DoubleSide,
          });
          const mesh = new THREE.Mesh(input.value, mat);
          return { 1: { type: "geometry", value: mesh } };
        }
        default:
          throw new Error("Unsupported input to output node");
      }
    },
  };
}
