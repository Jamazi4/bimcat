"use client";

import react, { useCallback } from "react";
import { GeomNodeBackType, NodeEdgeType } from "../schemas";
import * as THREE from "three";
import { nodeDefinitions } from "../nodes";

interface useNodesRuntimeProps {
  nodes: GeomNodeBackType[];
  edges: NodeEdgeType[];
  meshGroup: THREE.Group;
}

type ASTNode = {
  type: string;
  id: string;
  inputs: { inputId: number; ast: ASTNode }[];
  values: string[];
};

type NodeEvalResult =
  | { type: "number"; value: number }
  | { type: "point"; value: THREE.Vector3 }
  | { type: "edge"; value: [THREE.Vector3, THREE.Vector3] }
  | { type: "geometry"; value: THREE.Object3D };

const useNodesRuntime = ({ nodes, edges, meshGroup }: useNodesRuntimeProps) => {
  const buildAST = react.useCallback(
    (nodeId: string): ASTNode => {
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) throw new Error(`Missing node ${nodeId}`);

      const nodeDef = nodeDefinitions.find((nd) => nd.type === node.type);
      if (!nodeDef) throw new Error(`Unknown node type ${node.type}`);

      const inputs = edges
        .filter((e) => e.toNodeId === nodeId)
        .map((e) => ({
          inputId: e.toSlotId,
          ast: buildAST(e.fromNodeId),
        }));

      return {
        type: node.type,
        id: node.id,
        inputs,
        values: node.values ?? [],
      };
    },
    [edges, nodes],
  );

  const evaluateAST = useCallback((node: ASTNode): NodeEvalResult => {
    switch (node.type) {
      case "number":
        return { type: "number", value: parseFloat(node.values[0] ?? "0") };

      case "pointByXYZ": {
        const x = evaluateAST(node.inputs[0].ast);
        const y = evaluateAST(node.inputs[1].ast);
        const z = evaluateAST(node.inputs[2].ast);

        if (x.type === "number" && y.type === "number" && z.type === "number") {
          return {
            type: "point",
            value: new THREE.Vector3(x.value, y.value, z.value),
          };
        }
        throw new Error("Invalid inputs to pointByXYZ");
      }

      case "edgeByPoints": {
        const p1 = evaluateAST(node.inputs[0].ast);
        const p2 = evaluateAST(node.inputs[1].ast);

        if (p1.type === "point" && p2.type === "point") {
          return { type: "edge", value: [p1.value, p2.value] };
        }
        throw new Error("Invalid inputs to edgeByPoints");
      }

      case "output": {
        const input = evaluateAST(node.inputs[0].ast);

        switch (input.type) {
          case "point": {
            const geom = new THREE.BufferGeometry().setFromPoints([
              input.value,
            ]);
            const mat = new THREE.PointsMaterial({
              color: 0x7aadfa,
              size: 0.05,
            });
            const mesh = new THREE.Points(geom, mat);
            return { type: "geometry", value: mesh };
          }
          case "edge": {
            const geom = new THREE.BufferGeometry().setFromPoints(input.value);
            const mat = new THREE.LineBasicMaterial({ color: 0xffffff });
            const line = new THREE.Line(geom, mat);
            return { type: "geometry", value: line };
          }
          default:
            throw new Error("Unsupported input to output node");
        }
      }

      default:
        throw new Error(`Unsupported node type: ${node.type}`);
    }
  }, []);

  const startNodeRuntime = useCallback(() => {
    const outputNode = nodes.find((n) => n.type === "output");
    if (!outputNode) {
      meshGroup.clear();
      return;
    }

    const edge = edges.find((e) => e.toNodeId === outputNode.id);
    if (!edge) {
      meshGroup.clear();
      return;
    }

    try {
      const ast = buildAST(outputNode.id);
      const result = evaluateAST(ast);

      meshGroup.clear();
      if (result.type === "geometry") {
        console.log("im here");
        meshGroup.add(result.value);
      } else {
        console.warn("Result is not a renderable geometry:", result);
        meshGroup.clear();
      }
    } catch (error) {
      meshGroup.clear();
    }
  }, [buildAST, edges, evaluateAST, meshGroup, nodes]);

  return startNodeRuntime;
};

export default useNodesRuntime;
