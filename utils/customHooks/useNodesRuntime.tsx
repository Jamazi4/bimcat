"use client";

import { useCallback, useEffect, useState } from "react";
import { nodeDefinitions } from "../nodes";
import { ASTNode, NodeEvalResult, useNodesRuntimeProps } from "../nodeTypes";
import * as THREE from "three";

const useNodesRuntime = ({
  runtimeNodes,
  edges,
  meshGroup,
}: useNodesRuntimeProps) => {
  const [outputObjects, setOutputObjects] = useState<
    Record<string, THREE.Object3D | null>
  >({});

  //clean up outputObjects when output node is deleted
  useEffect(() => {
    const outputNodeIds = new Set(
      runtimeNodes.filter((n) => n.type === "output").map((n) => n.id),
    );
    setOutputObjects((prev) => {
      const filtered = Object.fromEntries(
        Object.entries(prev).filter(([key]) => outputNodeIds.has(key)),
      );
      return filtered;
    });
  }, [runtimeNodes, meshGroup]);

  const buildAST = useCallback(
    (nodeId: string): ASTNode => {
      const node = runtimeNodes.find((n) => n.id === nodeId);
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
        inputs: [...inputs].sort((a, b) => a.inputId - b.inputId),
        values: node.values ?? [],
      };
    },
    [edges, runtimeNodes],
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
    const outputNodes = runtimeNodes.filter((n) => n.type === "output");
    if (outputNodes.length === 0) {
      meshGroup.clear();
      setOutputObjects({});
      return;
    }

    for (const outputNode of outputNodes) {
      const edge = edges.find((e) => e.toNodeId === outputNode.id);
      console.log(outputNode);
      if (!edge) {
        setOutputObjects((prevState) => {
          return { ...prevState, [outputNode.id]: null };
        });
        return;
      }

      try {
        const ast = buildAST(outputNode.id);
        const result = evaluateAST(ast);
        const outputObject3D = result.value;

        if (!(outputObject3D instanceof THREE.Object3D)) {
          return;
        }

        if (result.type === "geometry") {
          setOutputObjects((prevState) => {
            return { ...prevState, [outputNode.id]: outputObject3D };
          });
        } else {
          console.warn("Result is not a renderable geometry:", result);
          setOutputObjects((prevState) => {
            return { ...prevState, [outputNode.id]: null };
          });
        }
      } catch (error) {
        setOutputObjects((prevState) => {
          return { ...prevState, [outputNode.id]: null };
        });
        throw error;
      }
    }
  }, [buildAST, edges, evaluateAST, meshGroup, runtimeNodes]);

  const renderNodeOutput = useCallback(() => {
    meshGroup.clear();
    Object.values(outputObjects).forEach((obj) => {
      if (!obj) return;
      meshGroup.add(obj);
    });
  }, [meshGroup, outputObjects]);

  return { startNodeRuntime, renderNodeOutput };
};

export default useNodesRuntime;
