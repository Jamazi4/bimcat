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

export type ASTNode = {
  type: string;
  id: string;
  inputs: { inputId: number; ast: ASTNode }[];
  values: string[];
};

export type NodeEvalResult =
  | { type: "number"; value: number }
  | { type: "point"; value: THREE.Vector3 }
  | { type: "edge"; value: [THREE.Vector3, THREE.Vector3] }
  | { type: "mesh"; value: THREE.BufferGeometry }
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
    const nodeDef = nodeDefinitions.find((def) => def.type === node.type);
    try {
      if (nodeDef?.function && nodeDef) {
        return nodeDef.function(node, evaluateAST);
      } else {
        throw new Error("no function");
      }
    } catch (error) {
      throw error;
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
        meshGroup.add(result.value);
      } else {
        console.warn("Result is not a renderable geometry:", result);
        meshGroup.clear();
      }
    } catch (error) {
      meshGroup.clear();
      throw error;
    }
  }, [buildAST, edges, evaluateAST, meshGroup, nodes]);

  return startNodeRuntime;
};

export default useNodesRuntime;
