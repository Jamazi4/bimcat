"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { nodeDefinitions } from "../nodes";
import {
  ASTNode,
  nodeDefinition,
  NodeEvalResult,
  useNodesRuntimeProps,
} from "../nodeTypes";
import * as THREE from "three";
import { useAppDispatch } from "@/lib/hooks";
import {
  deleteNodeOutputValue,
  setNodeOutputValues,
} from "@/lib/features/visualiser/visualiserSlice";
import { resolveFromOutputId } from "../nodeDefinitions/nodeUtilFunctions";

interface NodeCache {
  result: NodeEvalResult;
  dependencies: string[]; // IDs of nodes this node depends on
}

const useNodesRuntime = ({
  runtimeNodes,
  edges,
  meshGroup,
}: useNodesRuntimeProps) => {
  const [outputObjects, setOutputObjects] = useState<
    Record<string, THREE.Object3D | null>
  >({});
  const dispatch = useAppDispatch();
  const [liveNodeIds, setLiveNodeIds] = useState<string[]>([]);

  // Cache for node evaluation results
  const nodeCache = useRef<Map<string, NodeCache>>(new Map());

  // Track which nodes have been processed in current evaluation cycle
  const evaluationCycle = useRef<Set<string>>(new Set());

  // Clear cache when nodes or edges change
  useEffect(() => {
    nodeCache.current.clear();
    evaluationCycle.current.clear();
  }, [runtimeNodes, edges]);

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

    const inactiveNodes = runtimeNodes
      .filter((n) => !liveNodeIds.includes(n.id))
      .map((n) => n.id);
    dispatch(deleteNodeOutputValue({ nodeIds: inactiveNodes }));
  }, [runtimeNodes, meshGroup, dispatch, liveNodeIds]);

  // Check if a node's dependencies have changed
  const haveDependenciesChanged = useCallback(
    (nodeId: string, dependencies: string[]): boolean => {
      const cached = nodeCache.current.get(nodeId);
      if (!cached) return true;

      // Check if dependencies are the same
      if (cached.dependencies.length !== dependencies.length) return true;

      return !cached.dependencies.every((dep) => dependencies.includes(dep));
    },
    [],
  );

  // Get all dependencies for a node (recursively)
  const getNodeDependencies = useCallback(
    (nodeId: string, visited = new Set<string>()): string[] => {
      if (visited.has(nodeId)) return []; // Avoid circular dependencies
      visited.add(nodeId);

      const dependencies: string[] = [];

      const connectedEdges = edges.filter((edge) => edge.toNodeId === nodeId);
      for (const edge of connectedEdges) {
        dependencies.push(edge.fromNodeId);
        // Recursively get dependencies of dependencies
        dependencies.push(...getNodeDependencies(edge.fromNodeId, visited));
      }

      return [...new Set(dependencies)]; // Remove duplicates
    },
    [edges],
  );

  const buildAST = useCallback(
    (nodeId: string): ASTNode => {
      const node = runtimeNodes.find((n) => n.id === nodeId);
      if (!node) throw new Error(`Missing node ${nodeId}`);

      const nodeDef = nodeDefinitions.find((nd) => nd.type === node.type);
      if (!nodeDef) throw new Error(`Unknown node type ${node.type}`);

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
          }

          if (
            !inputDef.defaultValue &&
            !edge &&
            nodeDef.type !== "output" &&
            nodeDef.type !== "pset"
          ) {
            throw new Error(`${node.type} needs ${inputDef.name}`);
          }

          const fromOutputId = edge
            ? edge.fromSlotId
            : resolveFromOutputId(inputDef);

          const input = {
            inputId: inputDef.id,
            ast: edge ? buildAST(edge.fromNodeId) : inputDef.defaultValue!,
            fromOutputId: fromOutputId,
          };

          return input;
        })
        .filter(Boolean);

      const listInputsIds = Object.entries(node.values)
        .flatMap(([key, _]) => {
          const id = parseInt(key);
          return !isNaN(id) && id >= 100 ? id : null;
        })
        .filter((id): id is number => id !== null);

      if (listInputsIds) {
        listInputsIds.forEach((id) => {
          const edge = edges.find(
            (edge) => edge.toNodeId === nodeId && edge.toSlotId === id,
          );

          const fromOutputId = edge ? edge.fromSlotId : -1;
          // empty children input ids without values

          if (!edge) return [];

          const input = {
            inputId: id,
            ast: buildAST(edge?.fromNodeId),
            fromOutputId: fromOutputId,
          };

          inputs.push(input);
        });
      }

      return {
        type: node.type,
        id: node.id,
        inputs,
        values: node.values ?? {},
      };
    },
    [edges, runtimeNodes],
  );

  const storeOutputToState = useCallback(
    (nodeDef: nodeDefinition, node: ASTNode, outputValue: NodeEvalResult) => {
      const isOutputingNumOrBool = nodeDef.outputs.find(
        (o) => o.type === "number" || o.type === "boolean",
      );
      const isVirtual = node.id.includes("virt");

      if (isOutputingNumOrBool && !isVirtual) {
        const collectedOutputs = nodeDef.outputs.filter(
          (o) => o.type === "number" || o.type === "boolean",
        );

        const payload: Record<
          string,
          Record<string, string | number | boolean>
        > = { [node.id]: {} };

        collectedOutputs.forEach((o) => {
          payload[node.id][o.id] = outputValue[o.id].value as
            | string
            | number
            | boolean;
        });

        if (Object.keys(payload[node.id]).length > 0) {
          dispatch(setNodeOutputValues({ nodeValues: payload }));
        }
      }
    },
    [dispatch],
  );

  const evaluateAST = useCallback(
    (node: ASTNode): NodeEvalResult => {
      // Check if this node is already being processed in this cycle (circular dependency)
      if (evaluationCycle.current.has(node.id)) {
        throw new Error(
          `Circular dependency detected involving node ${node.id}`,
        );
      }

      // Get node dependencies
      const dependencies = getNodeDependencies(node.id);

      // Check if we can use cached result
      const cached = nodeCache.current.get(node.id);
      if (cached && !haveDependenciesChanged(node.id, dependencies)) {
        // Add to live nodes even if cached
        setLiveNodeIds((prev) =>
          prev.includes(node.id) ? prev : [...prev, node.id],
        );
        return cached.result;
      }

      // Mark as being processed
      evaluationCycle.current.add(node.id);

      const nodeDef = nodeDefinitions.find((def) => def.type === node.type);
      setLiveNodeIds((prev) =>
        prev.includes(node.id) ? prev : [...prev, node.id],
      );

      try {
        if (nodeDef && nodeDef.function) {
          const outputValue = nodeDef.function(node, evaluateAST);

          // Cache the result
          nodeCache.current.set(node.id, {
            result: outputValue,
            dependencies: dependencies,
          });

          storeOutputToState(nodeDef, node, outputValue);

          // Remove from processing set
          evaluationCycle.current.delete(node.id);

          return outputValue;
        } else {
          throw new Error(
            "Evaluate AST Error - no node definition or function",
          );
        }
      } catch (error) {
        // Remove from processing set on error
        evaluationCycle.current.delete(node.id);
        throw error;
      }
    },
    [storeOutputToState, getNodeDependencies, haveDependenciesChanged],
  );

  const clearOutputObjects = (outputNodeId: string) => {
    setOutputObjects((prevState) => {
      return { ...prevState, [outputNodeId]: null };
    });
  };

  const startNodeRuntime = useCallback(() => {
    const outputNodes = runtimeNodes.filter((n) => n.type === "output");
    const psetNodes = runtimeNodes.filter((n) => n.type === "pset");
    const rootNodes = [...outputNodes, ...psetNodes];

    // Reset evaluation cycle tracking
    evaluationCycle.current.clear();

    setLiveNodeIds([]);
    if (outputNodes.length === 0) {
      meshGroup.clear();
      setOutputObjects({});
      return;
    }

    for (const node of rootNodes) {
      const ast = buildAST(node.id);

      if (node.type === "pset") {
        const psetEdge = edges.find((e) => e.toNodeId === node.id);
        if (!psetEdge) return;
        evaluateAST(ast);
        continue;
      }

      const edge = edges.find((e) => e.toNodeId === node.id);
      if (!edge) {
        clearOutputObjects(node.id);
        continue;
      }
      try {
        const result = evaluateAST(ast)[1];
        //because output always returns on slot 1

        const outputObject3D = result.value;

        if (!(outputObject3D instanceof THREE.Object3D)) {
          return;
        }
        //TODO: CCS-7

        if (result.type === "geometry") {
          setOutputObjects((prevState) => {
            return { ...prevState, [node.id]: outputObject3D };
          });
        } else {
          console.warn("Result is not a renderable geometry:", result);
          clearOutputObjects(node.id);
        }
      } catch (error) {
        clearOutputObjects(node.id);
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
