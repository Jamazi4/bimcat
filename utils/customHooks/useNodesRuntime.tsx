"use client";

import { useCallback } from "react";
import { nodeDefinitions } from "../nodes";
import { ASTNode, NodeEvalResult, useNodesRuntimeProps } from "../nodeTypes";

const useNodesRuntime = ({
  runtimeNodes,
  edges,
  meshGroup,
}: useNodesRuntimeProps) => {
  const buildAST = useCallback(
    (nodeId: string): ASTNode => {
      const node = runtimeNodes.find((n) => n.id === nodeId);
      if (!node) throw new Error(`Missing node ${nodeId}`);

      const nodeDef = nodeDefinitions.find((nd) => nd.type === node.type);
      if (!nodeDef) throw new Error(`Unknown node type ${node.type}`);

      console.log("building ast");
      const inputs = edges
        .filter((e) => e.toNodeId === nodeId)
        .map((e) => ({
          inputId: e.toSlotId,
          ast: buildAST(e.fromNodeId),
        }));

      return {
        type: node.type,
        id: node.id,
        inputs: [...inputs].sort((a, b) => a.inputId - b.inputId),
        values: node.values ?? [],
      };
    },
    [edges, runtimeNodes],
  );

  const evaluateAST = useCallback((node: ASTNode): NodeEvalResult => {
    const nodeDef = nodeDefinitions.find((def) => def.type === node.type);
    console.log("evaluation");
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
    const outputNode = runtimeNodes.find((n) => n.type === "output");
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
  }, [buildAST, edges, evaluateAST, meshGroup, runtimeNodes]);

  return startNodeRuntime;
};

export default useNodesRuntime;
