"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
  GeomNodeBackType,
  NodeEdgeType,
  NodeSlot,
  NodeValues,
} from "../nodeTypes";
import { useNodeNavigation } from "./useNodeNavigation";

export const useNodeSystem = (
  nodeNavigation: boolean,
  meshGroup: THREE.Group,
) => {
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
    setNodes(nodeProject.nodes);
    setEdges(nodeProject.edges);
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

  const switchGroupInputActive = useCallback(
    (nodeId: string, groupIndices: number[], activeIndex: number) => {
      const node = nodesRef.current.find((n) => n.id === nodeId);
      if (!node || !node.values) return;

      // Get the freshest values directly from the ref
      const currentValues = nodesRef.current.find((n) => n.id === nodeId)?.values || {};
      const newValues = { ...currentValues };

      groupIndices.forEach((id) => {
        newValues[id] = id === activeIndex;
      });

      setNodes((prevNodes) =>
        prevNodes.map((n) =>
          n.id === nodeId ? { ...n, values: newValues } : n,
        ),
      );
    },
    [],
  );

  const removeEdgeToSlot = useCallback((toNodeId: string, toSlotId: number
  ) => {
    const edge = edgesRef.current.find((e) => e.toNodeId === toNodeId && e.toSlotId === toSlotId)
    if (edge) {
      setEdges((prevEdges) => prevEdges.filter((e) => e.id !== edge.id))
    }

  }, [])

  const changeNodeValue = useCallback(
    (nodeId: string, inputId: number, value: string | number | boolean, removeValue?: boolean) => {

      const node = nodesRef.current.find((node) => node.id === nodeId);
      if (!node) return;
      if (!node?.values) return;

      const newValues = { ...node.values };
      if (!removeValue) {

        newValues[inputId] = value;
      } else {
        delete newValues[inputId]
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
    if (slotId < 100) return; // Only handle list slots

    const node = nodesRef.current.find((n) => n.id === nodeId);
    if (!node?.values) return;

    // Remove the edge first
    setEdges((prevEdges) => prevEdges.filter(
      (e) => !(e.toNodeId === nodeId && e.toSlotId === slotId)
    ));

    // Get all list values and sort them
    const listEntries = Object.entries(node.values)
      .filter(([key]) => parseInt(key) >= 100)
      .sort(([a], [b]) => parseInt(a) - parseInt(b));

    // Find the index of the slot to remove
    const removeIndex = listEntries.findIndex(([key]) => parseInt(key) === slotId);
    if (removeIndex === -1) return;

    // Remove the slot from the list
    listEntries.splice(removeIndex, 1);

    // Create new values object
    const newValues = { ...node.values };

    // Clear all list values
    Object.keys(newValues).forEach(key => {
      if (parseInt(key) >= 100) {
        delete newValues[parseInt(key)];
      }
    });

    // Re-add remaining list values with sequential IDs
    listEntries.forEach(([_, val], index) => {
      newValues[100 + index] = val;
    });

    // Update edges to point to new slot IDs
    setEdges((prevEdges) =>
      prevEdges.map((edge) => {
        if (edge.toNodeId === nodeId && edge.toSlotId >= 100) {
          // Find the old slot index
          const oldIndex = edge.toSlotId - 100;
          if (oldIndex > removeIndex) {
            // This edge was pointing to a slot after the removed one
            return {
              ...edge,
              toSlotId: edge.toSlotId - 1
            };
          }
        }
        return edge;
      })
    );

    // Update node values
    setNodes((prevNodes) =>
      prevNodes.map((n) =>
        n.id === nodeId ? { ...n, values: newValues } : n,
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

  const pasteCopiedNodes = useCallback(() => {
    if (!copiedNodesRef.current.length) return;

    const idMap: Record<string, string> = {};

    const newNodes = copiedNodesRef.current.map((n) => {
      const newId = createNodeId();
      idMap[n.id] = newId;
      const newValues = { ...n.values };

      return {
        ...n,
        id: newId,
        x: n.x + copyOffset.current,
        y: n.y + copyOffset.current,
        values: newValues,
      };
    });

    copyOffset.current = copyOffset.current + 30;

    const newEdges = copiedEdgesRef.current.map((e) => ({
      ...e,
      id: createEdgeId(),
      fromNodeId: idMap[e.fromNodeId],
      toNodeId: idMap[e.toNodeId],
    }));

    setNodes((prevNodes) => [...prevNodes, ...newNodes]);
    setEdges((prevEdges) => [...prevEdges, ...newEdges]);
    setSelectedNodeIds(newNodes.map((n) => n.id));
  }, []);

  const registerNodeSlot = useCallback((slotData: NodeSlot) => {
    setNodeSlots((prev) => {
      if (slotData.slotIO === "output") {
        const filteredSlots = prev.filter(
          (slot) => !(
            slot.nodeId === slotData.nodeId &&
            slot.slotId === slotData.slotId &&
            slot.slotIO === "output"
          )
        );
        return [...filteredSlots, slotData];
      }

      const alreadyRegistered = prev.some(
        (slot) =>
          slot.nodeId === slotData.nodeId &&
          slot.slotId === slotData.slotId &&
          slot.slotIO === slotData.slotIO &&
          Math.abs(slot.relativeX - slotData.relativeX) < 1 &&
          Math.abs(slot.relativeY - slotData.relativeY) < 1
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
      // draggingNodesRef.current = newDraggingNodes;
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

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((prevEdges) => {
      return prevEdges.filter((edge) => edge.id !== edgeId);
    });
  }, []);


  const getViewTransformScale = useCallback(() => {
    return viewTransformRef.current.scale;
  }, []);

  const { handleEditorMouseDown, handleWheel } = useNodeNavigation(
    setNodes,
    selectedNodeIdsRef,
    setNodeSlots,
    setNodeDivs,
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
    edgesRef,
    setSelectedNodeIds,
    setDraggingNodes,
    curClickedNodeId,
    setIsPanning,
    nodeDivsRef,
    nodeNavigation,
    setPanStart,
    viewTransformRef,
    draggingNodes,
    connectingFromNode,
    isPanning,
    selectionRect,
  )

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
  };
};

export default useNodeSystem;
