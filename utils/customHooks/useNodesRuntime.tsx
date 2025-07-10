"use client";

import { useCallback, useEffect, useState } from "react";
import { nodeDefinitions } from "../nodes";
import { ASTNode, NodeEvalResult, useNodesRuntimeProps } from "../nodeTypes";
import * as THREE from "three";
import { group } from "console";

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

      const seenGroupIds = [];

      const inputs = nodeDef.inputs
        .filter(
          (inputDef) =>
            inputDef.type === "slot" ||
            inputDef.type === "combo" ||
            inputDef.type === "group",
        )
        .flatMap((inputDef) => {
          const inputId =
            inputDef.type === "group" ? inputDef.groupIndex : inputDef.id;
          const edge = edges.find(
            (edge) => edge.toNodeId === nodeId && edge.toSlotId === inputId,
          );

          if (inputDef.type === "combo" && !edge) {
            return [];
          }

          if (inputDef.type === "group") {
            const activeInputs = Object.entries(node.values)
              .filter(([_, val]) => val === true)
              .map(([key, _]) => parseInt(key));

            if (!activeInputs.includes(inputDef.id)) return [];
            console.log(`in astbldr ${activeInputs}`);
          }

          if (!inputDef.defaultValue && !edge) {
            throw new Error(`${node.type} needs ${inputDef.name}`);
          }

          //TODO: errors coming up here in processing group inputs

          const fromOutputId = edge
            ? edge.fromSlotId
            : nodeDef.inputs.length - 1 + nodeDef.outputs.length - 1;

          const input = {
            inputId: inputDef.id,
            ast: edge ? buildAST(edge.fromNodeId) : inputDef.defaultValue!,
            fromOutputId: fromOutputId,
          };

          return input;
        })
        .filter(Boolean);

      return {
        type: node.type,
        id: node.id,
        inputs,
        values: node.values ?? {},
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
      if (!edge) {
        setOutputObjects((prevState) => {
          return { ...prevState, [outputNode.id]: null };
        });
        continue;
      }

      try {
        const ast = buildAST(outputNode.id);
        const result = evaluateAST(ast)[1];
        //because output always returns on slot 1

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
