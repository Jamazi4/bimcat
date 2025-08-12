"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchNodeProject,
  updateNodeProject,
} from "../actions/componentActions";
import { createEdgeId, createNodeId } from "../utilFunctions";
import { nodeDefinitions } from "../nodes";
import { toast } from "sonner";
import * as THREE from "three";
import useNodesRuntime from "./useNodesRuntime";
import { ComponentGeometry } from "../types";
import useRuntimeNodes from "./useRuntimeNodes";
import {
  EdgeRewiring,
  GeomNodeBackType,
  ListInputAnalysis,
  NodeDefinitionShort,
  NodeEdgeType,
  NodeSlot,
  NodeValues,
} from "../nodeTypes";
import { useNodeNavigation } from "./useNodeNavigation";
import { deleteNodeOutputValue } from "@/lib/features/visualiser/visualiserSlice";
import { useAppDispatch } from "@/lib/hooks";

export const useNodeSystem = (meshGroup: THREE.Group) => {
  const [nodes, setNodes] = useState<GeomNodeBackType[]>([]);
  const nodesRef = useRef(nodes);
  nodesRef.current = nodes;

  const [nodeDivs, setNodeDivs] = useState<Record<string, HTMLDivElement>>({});
  const nodeDivsRef = useRef(nodeDivs);
  nodeDivsRef.current = nodeDivs;

  const [edges, setEdges] = useState<NodeEdgeType[]>([]);
  const edgesRef = useRef(edges);
  edgesRef.current = edges;

  const [nodeSlots, setNodeSlots] = useState<NodeSlot[]>([]);
  const nodeSlotsRef = useRef(nodeSlots);
  nodeSlotsRef.current = nodeSlots;

  const [isPanning, setIsPanning] = useState(false);
  const isPanningRef = useRef(isPanning);
  isPanningRef.current = isPanning;

  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const panStartRef = useRef(panStart);
  panStartRef.current = panStart;

  const editorRef = useRef<HTMLDivElement>(null);
  const [draggingNodes, setDraggingNodes] = useState<
    {
      id: string;
      offsetX: number;
      offsetY: number;
    }[]
  >([]);
  const draggingNodesRef = useRef(draggingNodes);
  draggingNodesRef.current = draggingNodes;

  const wasDragging = useRef(false);
  const [tempEdgePosition, setTempEdgePosition] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);
  const [connectingFromNode, setConnectingFromNode] = useState<{
    nodeId: string;
    slotId: number;
  } | null>(null);
  const connectingFromNodeRef = useRef(connectingFromNode);
  connectingFromNodeRef.current = connectingFromNode;

  const [connectingToNode, setConnectingToNode] = useState<{
    nodeId: string;
    slotId: number;
  } | null>(null);
  const connectingToNodeRef = useRef(connectingToNode);
  connectingToNodeRef.current = connectingToNode;

  const [viewTransform, setViewTransform] = useState({
    x: 0,
    y: 0,
    scale: 0.6,
  });
  const viewTransformRef = useRef(viewTransform);
  viewTransformRef.current = viewTransform;

  const [selectionRect, setSelectionRect] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);
  const selectionRectRef = useRef(selectionRect);
  selectionRectRef.current = selectionRect;

  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const selectedNodeIdsRef = useRef(selectedNodeIds);
  selectedNodeIdsRef.current = selectedNodeIds;

  const [copiedNodes, setCopiedNodes] = useState<GeomNodeBackType[]>([]);
  const copiedNodesRef = useRef(copiedNodes);
  copiedNodesRef.current = copiedNodes;

  const [copiedEdges, setCopiedEdges] = useState<NodeEdgeType[]>([]);
  const copiedEdgesRef = useRef(copiedEdges);
  copiedEdgesRef.current = copiedEdges;

  const copyOffset = useRef(30);

  const runtimeNodes = useRuntimeNodes(nodes);

  const curClickedNodeId = useRef<string>("");

  const dispatch = useAppDispatch();

  const nodeTypesWithListInputs = useMemo(() => {
    return nodeDefinitions
      .filter((nd) => {
        return nd.inputs.find((i) => i.isList);
      })
      .map((nd) => nd.type);
  }, []);

  const { startNodeRuntime, renderNodeOutput } = useNodesRuntime({
    runtimeNodes,
    edges,
    meshGroup,
  });

  useEffect(() => {
    try {
      startNodeRuntime();
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message);
      } else {
        toast("Unknown error");
      }
      console.warn(error);
    }
  }, [startNodeRuntime]);

  useEffect(() => {
    try {
      renderNodeOutput();
    } catch (error) {
      if (error instanceof Error) {
        toast(error.message);
      } else {
        toast("Unknown error");
      }
    }
  }, [renderNodeOutput]);

  const fetchNodes = useCallback(async (componentId: string) => {
    const nodeProject = await fetchNodeProject(componentId);
    if (!nodeProject) return;
    setNodes(nodeProject.nodes || []);
    setEdges(nodeProject.edges || []);
  }, []);

  const saveNodeProject = useCallback(
    async (componentId: string) => {
      const geometry: ComponentGeometry[] = meshGroup.children
        .filter((mesh): mesh is THREE.Mesh => mesh instanceof THREE.Mesh)
        .map((mesh) => {
          const bufferGeom = mesh.geometry.clone();
          const rotationMatrix = new THREE.Matrix4().makeRotationX(
            -Math.PI / 2,
          );
          bufferGeom.applyMatrix4(rotationMatrix);
          bufferGeom.computeVertexNormals();
          return {
            position: Array.from(bufferGeom.attributes.position.array),
            indices: Array.from(bufferGeom.index?.array || []),
          };
        });
      const response = await updateNodeProject(
        nodesRef.current,
        edgesRef.current,
        componentId,
        geometry,
      );
      toast(response.message);
    },
    [meshGroup.children],
  );

  const switchSelectInputValue = useCallback(
    (nodeId: string, inputId: number, activeValueId: number) => {
      const node = nodesRef.current.find((n) => n.id === nodeId);
      if (!node || !node.values) return;
      setNodes((prevNodes) =>
        prevNodes.map((n) =>
          n.id === nodeId
            ? { ...n, values: { ...n.values, [inputId]: activeValueId } }
            : n,
        ),
      );
    },
    [],
  );

  const switchGroupInputActive = useCallback(
    (nodeId: string, groupIndices: number[], activeIndex: number) => {
      const node = nodesRef.current.find((n) => n.id === nodeId);
      if (!node || !node.values) return;

      const nodeDef = nodeDefinitions.find((nd) => nd.type === node.type);

      setEdges((prevEdges) =>
        prevEdges.filter((e) => {
          if (e.toSlotId >= 100 || groupIndices.includes(e.toSlotId)) {
            return e.toNodeId !== nodeId;
          } else return true;
        }),
      );

      const dynamicOutputs = nodeDef?.outputs.filter(
        (o) => o.onInputSelectedId !== undefined,
      );

      dynamicOutputs?.forEach((output) => {
        if (groupIndices.includes(output.onInputSelectedId!)) {
          setEdges((prevEdges) =>
            prevEdges.filter(
              (e) => !(e.fromNodeId === nodeId && e.fromSlotId === output.id),
            ),
          );
        }
      });

      const currentValues = { ...node.values };

      groupIndices.forEach((id) => {
        currentValues[id] = id === activeIndex;
      });

      Object.keys(currentValues).forEach((key) => {
        const slotId = parseInt(key);
        if (slotId >= 100) {
          delete currentValues[slotId];
        }
      });
      setNodes((prevNodes) =>
        prevNodes.map((n) =>
          n.id === nodeId ? { ...n, values: currentValues } : n,
        ),
      );
    },
    [],
  );

  const removeEdgeToSlot = useCallback((toNodeId: string, toSlotId: number) => {
    const edge = edgesRef.current.find(
      (e) => e.toNodeId === toNodeId && e.toSlotId === toSlotId,
    );
    if (edge) {
      setEdges((prevEdges) => prevEdges.filter((e) => e.id !== edge.id));
    }
  }, []);

  const changeNodeValue = useCallback(
    (
      nodeId: string,
      inputId: number,
      value: string | number | boolean,
      removeValue?: boolean,
    ) => {
      const node = nodesRef.current.find((node) => node.id === nodeId);
      if (!node) return;
      if (!node?.values) return;

      const newValues = { ...node.values };
      if (!removeValue) {
        newValues[inputId] = value;
      } else {
        delete newValues[inputId];
      }

      setNodes((prevNodes) =>
        prevNodes.map((n) =>
          n.id === nodeId ? { ...n, values: newValues } : n,
        ),
      );
    },
    [],
  );

  const removeListSlot = useCallback((nodeId: string, slotId: number) => {
    const node = nodesRef.current.find((n) => n.id === nodeId);
    if (!node?.values) return;

    const currentValues = { ...node.values };

    const listEntries = Object.entries(currentValues)
      .filter(([key]) => parseInt(key) >= 100)
      .sort(([a], [b]) => parseInt(a) - parseInt(b));

    const removeIndex = listEntries.findIndex(
      ([key]) => parseInt(key) === slotId,
    );

    if (removeIndex === -1) return;

    listEntries.splice(removeIndex, 1);

    Object.keys(currentValues).forEach((key) => {
      if (parseInt(key) >= 100) {
        delete currentValues[parseInt(key)];
      }
    });

    listEntries.forEach(([_, val], index) => {
      currentValues[100 + index] = val;
    });

    const hasEmptySlot = listEntries.some(([_, val]) => val === false);
    if (!hasEmptySlot) {
      const nextEmptySlot = 100 + listEntries.length;
      currentValues[nextEmptySlot] = false;
    }

    setEdges((prevEdges) =>
      prevEdges.map((edge) => {
        if (edge.toNodeId === nodeId && edge.toSlotId >= 100) {
          const oldIndex = edge.toSlotId - 100;
          if (oldIndex > removeIndex) {
            return {
              ...edge,
              toSlotId: edge.toSlotId - 1,
            };
          }
        }
        return edge;
      }),
    );

    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === nodeId ? { ...n, values: currentValues } : n,
      ),
    );
  }, []);

  const screenToWorld = useCallback((screenX: number, screenY: number) => {
    if (!editorRef.current) return { x: 0, y: 0 };

    const rect = editorRef.current.getBoundingClientRect();
    const worldX =
      (screenX - rect.left - viewTransformRef.current.x) /
      viewTransformRef.current.scale;
    const worldY =
      (screenY - rect.top - viewTransformRef.current.y) /
      viewTransformRef.current.scale;

    return { x: worldX, y: worldY };
  }, []);

  // Shared helper function to analyze list inputs for a node
  const analyzeListInputs = useCallback(
    (
      node: GeomNodeBackType,
      edges: NodeEdgeType[],
      nodeDefinitions: NodeDefinitionShort[],
      nodeTypesWithListInputs: string[],
    ): ListInputAnalysis => {
      if (!nodeTypesWithListInputs.includes(node.type) || !node.values) {
        return null;
      }

      const edgesToNode = edges.filter((e) => e.toNodeId === node.id);
      const nodeDef = nodeDefinitions.find((nd) => nd.type === node.type);
      const parentInputCandidate = nodeDef?.inputs.find((i) => i.isList);

      // Ensure we have a valid list input with required properties
      if (!parentInputCandidate || !parentInputCandidate.isList) return null;

      const parentInput = { id: parentInputCandidate.id, isList: true };
      const parentEdge = edgesToNode.find((e) => e.toSlotId === parentInput.id);
      const listEdges = edgesToNode
        .filter((e) => e.toSlotId >= 100)
        .sort((a, b) => a.toSlotId - b.toSlotId);

      const listValueKeys = Object.keys(node.values)
        .filter((key) => parseInt(key) >= 100)
        .map(Number)
        .sort((a, b) => a - b);

      return {
        parentInput,
        parentEdge,
        listEdges,
        listValueKeys,
        edgesToNode,
        hasParentEdge: !!parentEdge,
        hasListEdges: listEdges.length > 0,
      };
    },
    [],
  );

  // Shared helper function to process node values and generate edge rewiring info
  const processNodeValues = useCallback(
    (
      node: GeomNodeBackType,
      analysis: ListInputAnalysis,
      mode: "paste" | "removeParent" = "paste",
    ): {
      newValues: Record<string, string | number | boolean>;
      edgeRewiring: EdgeRewiring[];
    } => {
      if (!analysis || !node.values)
        return { newValues: { ...node.values }, edgeRewiring: [] };

      const newValues: Record<string, string | number | boolean> = {
        ...node.values,
      };
      const edgeRewiring: EdgeRewiring[] = [];

      if (mode === "paste") {
        // Paste mode: handle different scenarios based on parent edge presence
        if (analysis.hasParentEdge) {
          // Normal case: keep values that have edges, plus one empty slot
          // after the highest connected edge
          const connectedSlots = analysis.listEdges.map((e) => e.toSlotId);
          const highestConnectedSlot =
            connectedSlots.length > 0 ? Math.max(...connectedSlots) : 99;
          const requiredEmptySlot = highestConnectedSlot + 1;

          Object.keys(newValues).forEach((key) => {
            const keyNum = parseInt(key);
            if (keyNum >= 100) {
              const hasEdge = analysis.listEdges.some(
                (e) => e.toSlotId === keyNum,
              );

              const isRequiredEmptySlot = keyNum === requiredEmptySlot;

              if (!hasEdge && !isRequiredEmptySlot) {
                delete newValues[key];
              }
            }
          });
        } else if (!analysis.hasParentEdge && analysis.hasListEdges) {
          // Missing parent case: rewire first list edge to parent, renumber
          // others
          const [firstEdge, ...remainingEdges] = analysis.listEdges;

          // Clean all list values first
          Object.keys(newValues).forEach((key) => {
            if (parseInt(key) >= 100) {
              delete newValues[key];
            }
          });

          // Rewire first edge to parent
          edgeRewiring.push({
            oldEdge: firstEdge,
            newToSlotId: analysis.parentInput.id,
          });

          // Renumber remaining edges sequentially
          remainingEdges.forEach((edge, index) => {
            const newSlotId = 100 + index;
            edgeRewiring.push({
              oldEdge: edge,
              newToSlotId: newSlotId,
            });

            // Preserve the original value if it existed
            const originalValue = node.values?.[edge.toSlotId];
            if (originalValue !== undefined) {
              newValues[newSlotId] = originalValue;
            }
          });

          // Add default false value at the end
          if (remainingEdges.length >= 0) {
            newValues[100 + remainingEdges.length] = false;
          }
          //No list edges copied - remove all values
        } else {
          Object.keys(newValues).forEach((key) => {
            const keyNum = parseInt(key);
            if (keyNum >= 100) {
              delete newValues[key];
            }
          });
        }
      } else if (mode === "removeParent") {
        // Remove parent mode: always rewire first list edge to parent,
        // renumber others
        if (analysis.hasListEdges) {
          const [_, ...remainingEdges] = analysis.listEdges;

          // Clear all list values first
          Object.keys(newValues).forEach((key) => {
            if (parseInt(key) >= 100) {
              delete newValues[key];
            }
          });

          // First edge will be rewired to parent (handled by caller)
          // Renumber remaining edges sequentially
          remainingEdges.forEach((edge, index) => {
            const newSlotId = 100 + index;
            edgeRewiring.push({
              oldEdge: edge,
              newToSlotId: newSlotId,
            });

            // Preserve the original value if it existed
            const originalValue = node.values?.[edge.toSlotId];
            if (originalValue !== undefined) {
              newValues[newSlotId] = originalValue;
            }
          });

          // Add default false value at the end
          if (remainingEdges.length >= 0) {
            newValues[100 + remainingEdges.length] = false;
          }
        } else {
          // No list edges - just clear all list values
          Object.keys(newValues).forEach((key) => {
            const keyNum = parseInt(key);
            if (keyNum >= 100) {
              delete newValues[keyNum];
            }
          });
        }
      }

      return { newValues, edgeRewiring };
    },
    [],
  );

  // Refactored removeParentListEdge using shared helpers
  const removeParentListEdge = useCallback(
    (edge: NodeEdgeType, node: GeomNodeBackType) => {
      const analysis = analyzeListInputs(
        node,
        edgesRef.current,
        nodeDefinitions,
        nodeTypesWithListInputs,
      );
      if (!analysis) return;

      if (analysis.hasListEdges) {
        const [firstListEdge] = analysis.listEdges;
        const { newValues, edgeRewiring } = processNodeValues(
          node,
          analysis,
          "removeParent",
        );

        // Rewire first list edge to parent slot (the edge being removed)
        setEdges((prevEdges) =>
          prevEdges.map((e) => {
            if (e.id === firstListEdge.id) {
              return { ...e, toSlotId: edge.toSlotId };
            }
            return e;
          }),
        );

        // Apply edge rewiring for remaining edges
        if (edgeRewiring.length > 0) {
          setEdges((prevEdges) =>
            prevEdges.map((e) => {
              const rewrite = edgeRewiring.find((r) => r.oldEdge.id === e.id);
              if (rewrite) {
                return { ...e, toSlotId: rewrite.newToSlotId };
              }
              return e;
            }),
          );
        }

        // Update node values
        setNodes((prevNodes) =>
          prevNodes.map((n) =>
            n.id === edge.toNodeId ? { ...n, values: newValues } : n,
          ),
        );
      } else {
        // No list edges - just clear all list values
        const { newValues } = processNodeValues(node, analysis, "removeParent");

        setNodes((prevNodes) =>
          prevNodes.map((n) =>
            n.id === edge.toNodeId ? { ...n, values: newValues } : n,
          ),
        );
      }
    },
    [analyzeListInputs, nodeTypesWithListInputs, processNodeValues],
  );

  const deleteEdge = useCallback(
    (edgeId: string) => {
      const edge = edgesRef.current.find((e) => e.id === edgeId);
      if (!edge) return;

      const node = nodesRef.current.find((n) => n.id === edge.toNodeId);
      if (!node) return;
      const nodeDef = nodeDefinitions.find((nd) => nd.type === node?.type);
      const inputDef = nodeDef?.inputs.find((i) => i.id === edge.toSlotId);
      const isParentList = inputDef?.isList;

      setEdges((prevEdges) => prevEdges.filter((e) => e.id !== edgeId));

      if (edge.toSlotId >= 100) {
        removeListSlot(edge.toNodeId, edge.toSlotId);
      } else if (isParentList) {
        removeParentListEdge(edge, node);
      }
    },
    [removeListSlot, removeParentListEdge],
  );

  const deleteNode = useCallback(() => {
    dispatch(deleteNodeOutputValue({ nodeIds: selectedNodeIdsRef.current }));

    const edgesToDelete = edgesRef.current.filter((e) => {
      return (
        selectedNodeIdsRef.current.includes(e.fromNodeId) ||
        selectedNodeIdsRef.current.includes(e.toNodeId)
      );
    });

    const nodeIdsConnected = edgesToDelete.map((e) => e.toNodeId);
    const nodesConnected = nodesRef.current.filter((n) =>
      nodeIdsConnected.includes(n.id),
    );
    const nodesConnectedContainingListInputs = nodesConnected.filter((n) => {
      return nodeTypesWithListInputs.includes(n.type);
    });

    const edgesLeadingToListInputs: NodeEdgeType[] = [];
    if (nodesConnectedContainingListInputs.length > 0) {
      const nodeIdsConnectedContainingListInputs =
        nodesConnectedContainingListInputs.map((n) => n.id);
      const edgesToNodesContainingListInputs = edgesToDelete.filter((e) => {
        return nodeIdsConnectedContainingListInputs.includes(e.toNodeId);
      });

      edgesLeadingToListInputs.push(
        ...edgesToNodesContainingListInputs.filter((e) => e.toSlotId >= 100),
      );

      nodesConnectedContainingListInputs.forEach((n) => {
        const nodeDef = nodeDefinitions.find((nd) => nd.type === n.type);
        const listId = nodeDef?.inputs.find((i) => i.isList)?.id;
        edgesToNodesContainingListInputs.forEach((e) => {
          if (e.toSlotId === listId) {
            edgesLeadingToListInputs.push(e);
          }
        });
      });
    }

    edgesLeadingToListInputs.forEach((e) => {
      deleteEdge(e.id);
    });

    setEdges((prevEdges) => {
      return prevEdges.filter((edge) => {
        return (
          !selectedNodeIdsRef.current.includes(edge.fromNodeId) &&
          !selectedNodeIdsRef.current.includes(edge.toNodeId)
        );
      });
    });

    setNodes((prevNodes) => {
      return prevNodes.filter(
        (n) => !selectedNodeIdsRef.current.includes(n.id),
      );
    });

    setNodeSlots((prevSlots) => {
      return prevSlots.filter(
        (slot) => !selectedNodeIdsRef.current.includes(slot.nodeId),
      );
    });

    setNodeDivs((prevNodeDivs) => {
      const prevNodeDivsArr = Object.entries(prevNodeDivs);
      const newNodeDivs = prevNodeDivsArr.filter(
        ([id, _]) => !selectedNodeIdsRef.current.includes(id),
      );
      return Object.fromEntries(newNodeDivs);
    });
  }, [deleteEdge, dispatch, nodeTypesWithListInputs]);

  const addNode = useCallback(
    (nodeDefId: number) => {
      const nodeId = createNodeId();
      const nodeDefinition = nodeDefinitions.find(
        (node) => node.nodeDefId === nodeDefId,
      );
      if (!nodeDefinition) return;
      const nodeType = nodeDefinition?.type;
      const relInitPos = 200;
      const worldPoint = screenToWorld(relInitPos, relInitPos);
      const randFactor = 100;
      const nodeX = worldPoint.x + Math.floor(Math.random() * randFactor);
      const nodeY = worldPoint.y + Math.floor(Math.random() * randFactor);

      const initValues: NodeValues = {};

      nodeDefinition?.inputs.forEach((input) => {
        if (input.type !== "slot" || input.value) {
          initValues[input.id] = input.value!;
        }
      });
      const newBackNode: GeomNodeBackType = {
        id: nodeId,
        type: nodeType!,
        x: nodeX,
        y: nodeY,
      };

      if (initValues) {
        newBackNode["values"] = initValues;
      }

      setNodes((prevNodes) => [...prevNodes, newBackNode]);
    },
    [screenToWorld],
  );

  const copySelectedNodes = useCallback(() => {
    const curCopiedNodes = nodesRef.current.filter((n) =>
      selectedNodeIdsRef.current.includes(n.id),
    );
    setCopiedNodes(curCopiedNodes);

    const curCopiedEdges = edgesRef.current.filter(
      (e) =>
        selectedNodeIdsRef.current.includes(e.fromNodeId) &&
        selectedNodeIdsRef.current.includes(e.toNodeId),
    );
    setCopiedEdges(curCopiedEdges);
    copyOffset.current = 30;
  }, []);

  // Refactored pasteCopiedNodes using shared helpers
  const pasteCopiedNodes = useCallback(() => {
    if (!copiedNodesRef.current.length) return;

    const oldIdToNewIdMap: Record<string, string> = {};
    const nodeProcessingResults = new Map<string, EdgeRewiring[]>();

    const newNodes = copiedNodesRef.current.map((node) => {
      const newId = createNodeId();
      oldIdToNewIdMap[node.id] = newId;

      const analysis = analyzeListInputs(
        node,
        copiedEdgesRef.current,
        nodeDefinitions,
        nodeTypesWithListInputs,
      );
      const { newValues, edgeRewiring } = processNodeValues(
        node,
        analysis,
        "paste",
      );

      // Store rewiring info for edge processing
      if (edgeRewiring.length > 0) {
        nodeProcessingResults.set(node.id, edgeRewiring);
      }

      return {
        ...node,
        id: newId,
        x: node.x + copyOffset.current,
        y: node.y + copyOffset.current,
        values: newValues,
      };
    });

    copyOffset.current += 30;

    // Create new edges with rewiring applied
    const newEdges = copiedEdgesRef.current.map((edge) => {
      let toSlotId = edge.toSlotId;

      // Check if this edge needs rewiring
      const rewiring = nodeProcessingResults.get(edge.toNodeId);
      if (rewiring) {
        const rewrite = rewiring.find((r) => r.oldEdge.id === edge.id);
        if (rewrite) {
          toSlotId = rewrite.newToSlotId;
        }
      }

      return {
        ...edge,
        id: createEdgeId(),
        fromNodeId: oldIdToNewIdMap[edge.fromNodeId],
        toNodeId: oldIdToNewIdMap[edge.toNodeId],
        toSlotId,
      };
    });

    setNodes((prevNodes) => [...prevNodes, ...newNodes]);
    setEdges((prevEdges) => [...prevEdges, ...newEdges]);
    setSelectedNodeIds(newNodes.map((n) => n.id));
  }, [analyzeListInputs, nodeTypesWithListInputs, processNodeValues]);

  const registerNodeSlot = useCallback((slotData: NodeSlot) => {
    setNodeSlots((prev) => {
      if (slotData.slotIO === "output") {
        const filteredSlots = prev.filter(
          (slot) =>
            !(
              slot.nodeId === slotData.nodeId &&
              slot.slotId === slotData.slotId &&
              slot.slotIO === "output"
            ),
        );
        return [...filteredSlots, slotData];
      }

      const alreadyRegistered = prev.some(
        (slot) =>
          slot.nodeId === slotData.nodeId &&
          slot.slotId === slotData.slotId &&
          slot.slotIO === slotData.slotIO &&
          Math.abs(slot.relativeX - slotData.relativeX) < 1 &&
          Math.abs(slot.relativeY - slotData.relativeY) < 1,
      );

      if (alreadyRegistered) return prev;
      return [...prev, slotData];
    });
  }, []);

  const startDraggingNode = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      curClickedNodeId.current = nodeId;
      if (!editorRef.current) return;
      wasDragging.current = false;

      const worldPos = screenToWorld(e.clientX, e.clientY);
      const node = nodesRef.current.find((n) => n.id === nodeId);
      if (!node) return;

      const isMulti = selectedNodeIdsRef.current.includes(nodeId);
      const dragTargets = isMulti ? selectedNodeIdsRef.current : [nodeId];

      const newDraggingNodes = dragTargets
        .map((id) => {
          const n = nodesRef.current.find((n) => n.id === id);
          if (!n) return null;
          return {
            id,
            offsetX: worldPos.x - n.x,
            offsetY: worldPos.y - n.y,
          };
        })
        .filter(Boolean) as { id: string; offsetX: number; offsetY: number }[];

      setDraggingNodes(newDraggingNodes);
    },
    [screenToWorld],
  );

  const getSlotCenter = useCallback((element: SVGSVGElement) => {
    const slot = nodeSlotsRef.current.find((s) => s.el === element);
    if (slot) {
      const node = nodesRef.current.find((n) => n.id === slot.nodeId);
      if (node) {
        const iconX = node.x + slot.relativeX;
        const iconY = node.y + slot.relativeY;
        return { iconX, iconY };
      }
    }
    return { iconX: 0, iconY: 0 };
  }, []);

  const startConnecting = useCallback(
    (nodeId: string, slotId: number) => {
      setConnectingToNode(null);
      setConnectingFromNode({ nodeId, slotId });
      const slotIcon = nodeSlotsRef.current.find(
        (slot) => slot.nodeId === nodeId && slot.slotId === slotId,
      )?.el;
      if (!slotIcon) return;

      const { iconX, iconY } = getSlotCenter(slotIcon);
      setTempEdgePosition({
        x1: iconX,
        y1: iconY,
        x2: iconX,
        y2: iconY,
      });
    },
    [getSlotCenter],
  );

  const finishConnecting = useCallback(
    (nodeId: string, slotId: number, clearConnectingToNode?: boolean) => {
      if (clearConnectingToNode) setConnectingToNode(null);
      else setConnectingToNode({ nodeId, slotId });
    },
    [],
  );

  const getViewTransformScale = useCallback(() => {
    return viewTransformRef.current.scale;
  }, []);

  const { handleEditorMouseDown, handleWheel } = useNodeNavigation(
    deleteNode,
    setNodes,
    selectedNodeIdsRef,
    setEdges,
    copySelectedNodes,
    pasteCopiedNodes,
    wasDragging,
    editorRef,
    isPanningRef,
    panStartRef,
    setViewTransform,
    screenToWorld,
    selectionRectRef,
    setSelectionRect,
    draggingNodesRef,
    connectingFromNodeRef,
    nodeSlotsRef,
    getSlotCenter,
    setTempEdgePosition,
    connectingToNodeRef,
    nodesRef,
    setConnectingFromNode,
    switchGroupInputActive,
    setSelectedNodeIds,
    setDraggingNodes,
    curClickedNodeId,
    setIsPanning,
    nodeDivsRef,
    setPanStart,
    viewTransformRef,
    draggingNodes,
    connectingFromNode,
    isPanning,
    selectionRect,
  );

  return {
    switchGroupInputActive,
    saveNodeProject,
    fetchNodes,
    addNode,
    nodes,
    edges,
    editorRef,
    nodeSlots,
    startDraggingNode,
    changeNodeValue,
    registerNodeSlot,
    tempEdgePosition,
    startConnecting,
    finishConnecting,
    getSlotCenter,
    deleteEdge,
    viewTransform,
    handleWheel,
    handleEditorMouseDown,
    selectionRect,
    setNodeDivs,
    selectedNodeIds,
    getViewTransformScale,
    removeEdgeToSlot,
    removeListSlot,
    switchSelectInputValue,
    deleteNode,
  };
};
