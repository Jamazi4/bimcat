"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GeomNodeBackType, NodeEdgeType } from "../schemas";
import {
  fetchNodeProject,
  updateNodeProject,
} from "../actions/componentActions";
import { createEdgeId, createNodeId } from "../utilFunctions";
import { nodeDefinitions } from "../nodes";
import { toast } from "sonner";
import * as THREE from "three";
import useNodesRuntime from "./useNodesRuntime";

export type NodeSlot = {
  nodeId: string;
  slotId: number;
  slotType: "input" | "output";
  el: SVGSVGElement;
  relativeX: number;
  relativeY: number;
};

export const useNodeSystem = (
  nodeNavigation: boolean,
  meshGroup: THREE.Group,
) => {
  const [nodes, setNodes] = useState<GeomNodeBackType[]>([]);
  const [edges, setEdges] = useState<NodeEdgeType[]>([]);
  const [nodeSlots, setNodeSlots] = useState<NodeSlot[]>([]);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const editorRef = useRef<HTMLDivElement>(null);
  const [draggingNode, setDraggingNode] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
  } | null>(null);
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
  const [connectingToNode, setConnectingToNode] = useState<{
    nodeId: string;
    slotId: number;
  } | null>(null);
  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });
  const [selectionRect, setSelectionRect] = useState<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);

  const startNodeRuntime = useNodesRuntime({ nodes, edges, meshGroup });

  useEffect(() => {
    startNodeRuntime();
  }, [startNodeRuntime]);

  const fetchNodes = useCallback(async (componentId: string) => {
    const nodeProject = await fetchNodeProject(componentId);
    if (!nodeProject) return;
    setNodes(nodeProject.nodes);
    setEdges(nodeProject.edges);
  }, []);

  const saveNodeProject = useCallback(
    async (componentId: string) => {
      const response = await updateNodeProject(nodes, edges, componentId);
      toast(response.message);
    },
    [nodes, edges],
  );

  const changeNodeValue = useCallback(
    (nodeId: string, inputId: number, value: string) => {
      const node = nodes.find((node) => node.id === nodeId);
      if (!node?.values) return;
      const newValues = node.values;
      newValues[inputId] = value;

      setNodes((prevNodes) =>
        prevNodes.map((n) =>
          n.id === nodeId
            ? {
                ...n,
                values: newValues,
              }
            : n,
        ),
      );
    },
    [nodes],
  );

  const screenToWorld = useCallback(
    (screenX: number, screenY: number) => {
      if (!editorRef.current) return { x: 0, y: 0 };

      const rect = editorRef.current.getBoundingClientRect();
      const worldX =
        (screenX - rect.left - viewTransform.x) / viewTransform.scale;
      const worldY =
        (screenY - rect.top - viewTransform.y) / viewTransform.scale;

      return { x: worldX, y: worldY };
    },
    [viewTransform],
  );

  const addNode = useCallback((nodeDefId: number) => {
    const nodeId = createNodeId();
    const nodeDefinition = nodeDefinitions.find(
      (node) => node.nodeTypeId === nodeDefId,
    );
    const nodeType = nodeDefinition?.type;
    const nodeX = 100;
    const nodeY = 100;

    const initValues = nodeDefinition?.inputs
      .filter(
        (input): input is typeof input & { value: string } =>
          typeof input.value === "string",
      )
      .map((input) => input.value);

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
  }, []);

  const registerNodeSlot = useCallback((slotData: NodeSlot) => {
    setNodeSlots((prev) => {
      const alreadyRegistered = prev.some(
        (slot) =>
          slot.nodeId === slotData.nodeId &&
          slot.slotId === slotData.slotId &&
          slot.slotType === slotData.slotType,
      );
      if (alreadyRegistered) return prev;
      return [...prev, slotData];
    });
  }, []);

  const startDraggingNode = useCallback(
    (nodeId: string, e: React.MouseEvent) => {
      const node = nodes.find((n) => n.id === nodeId);
      if (node && editorRef.current) {
        const worldPos = screenToWorld(e.clientX, e.clientY);
        setDraggingNode({
          id: nodeId,
          offsetX: worldPos.x - node.x,
          offsetY: worldPos.y - node.y,
        });
      }
    },
    [nodes, screenToWorld],
  );

  const getSlotCenter = useCallback(
    (element: SVGSVGElement) => {
      const slot = nodeSlots.find((s) => s.el === element);
      if (slot) {
        const node = nodes.find((n) => n.id === slot.nodeId);
        if (node) {
          const iconX = node.x + slot.relativeX;
          const iconY = node.y + slot.relativeY;
          return { iconX, iconY };
        }
      }

      // fallback to older approach
      const elementRect = element.getBoundingClientRect();
      if (!editorRef.current) return { iconX: 0, iconY: 0 };
      const editorRect = editorRef.current.getBoundingClientRect();

      const centerX =
        elementRect.left + elementRect.width / 2 - editorRect.left;
      const centerY = elementRect.top + elementRect.height / 2 - editorRect.top;

      const iconX = (centerX - viewTransform.x) / viewTransform.scale;
      const iconY = (centerY - viewTransform.y) / viewTransform.scale;
      return { iconX, iconY };
    },
    [viewTransform, nodeSlots, nodes],
  );

  const startConnecting = useCallback(
    (nodeId: string, slotId: number) => {
      setConnectingToNode(null);
      setConnectingFromNode({ nodeId, slotId });
      const slotIcon = nodeSlots.find(
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
    [nodeSlots, getSlotCenter],
  );

  const finishConnecting = useCallback(
    (nodeId: string, slotId: number, clear?: boolean) => {
      if (clear) setConnectingToNode(null);
      else setConnectingToNode({ nodeId, slotId });
    },
    [],
  );

  const addEdge = (
    fromNodeId: string,
    fromSlotId: number,
    toNodeId: string,
    toSlotId: number,
  ) => {
    const newEdge: NodeEdgeType = {
      id: createEdgeId(),
      fromNodeId,
      fromSlotId,
      toNodeId,
      toSlotId,
    };
    setEdges((prevEdges) => [...prevEdges, newEdge]);
  };

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((prevEdges) => {
      return prevEdges.filter((edge) => edge.id !== edgeId);
    });
  }, []);

  const cancelConnecting = () => {
    setConnectingFromNode(null);
    setTempEdgePosition(null);
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!editorRef.current) return;

      if (isPanning) {
        const newX = e.clientX - panStart.x;
        const newY = e.clientY - panStart.y;
        setViewTransform((prev) => ({ ...prev, x: newX, y: newY }));
        return;
      }

      const worldPos = screenToWorld(e.clientX, e.clientY);

      if (selectionRect) {
        const boundingRect = editorRef.current.getBoundingClientRect();
        setSelectionRect((prevRect) => {
          if (!prevRect) return null;
          return {
            x1: prevRect.x1,
            y1: prevRect.y1,
            x2: e.clientX - boundingRect.left,
            y2: e.clientY - boundingRect.top,
          };
        });
      }

      if (draggingNode) {
        setNodes((prevNodes) =>
          prevNodes.map((n) =>
            n.id === draggingNode.id
              ? {
                  ...n,
                  x: worldPos.x - draggingNode.offsetX,
                  y: worldPos.y - draggingNode.offsetY,
                }
              : n,
          ),
        );
      } else if (connectingFromNode) {
        const sourceIcon = nodeSlots.find(
          (slot) =>
            slot.nodeId === connectingFromNode.nodeId &&
            slot.slotId === connectingFromNode.slotId,
        )?.el;
        if (sourceIcon) {
          const { iconX, iconY } = getSlotCenter(sourceIcon);
          setTempEdgePosition({
            x1: iconX,
            y1: iconY,
            x2: worldPos.x,
            y2: worldPos.y,
          });
        }
      }
    },
    [
      selectionRect,
      isPanning,
      screenToWorld,
      draggingNode,
      connectingFromNode,
      panStart.x,
      panStart.y,
      nodeSlots,
      getSlotCenter,
    ],
  );

  const handleMouseUp = useCallback(() => {
    if (connectingToNode && connectingFromNode) {
      addEdge(
        connectingFromNode.nodeId,
        connectingFromNode.slotId,
        connectingToNode.nodeId,
        connectingToNode.slotId,
      );
    }
    cancelConnecting();
    setDraggingNode(null);
    setIsPanning(false);
    setSelectionRect(null);
  }, [connectingToNode, connectingFromNode]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!nodeNavigation) return;

      setViewTransform((prevTransform) => {
        if (!editorRef.current) return prevTransform;
        const rect = editorRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomIntensity = 0.1;
        const delta = e.deltaY > 0 ? -1 : 1;
        const newScale =
          prevTransform.scale + delta * zoomIntensity * prevTransform.scale;
        const clampedScale = Math.max(0.2, Math.min(3, newScale));

        const worldX = (mouseX - prevTransform.x) / prevTransform.scale;
        const worldY = (mouseY - prevTransform.y) / prevTransform.scale;

        const newX = mouseX - worldX * clampedScale;
        const newY = mouseY - worldY * clampedScale;
        const newTransform = { x: newX, y: newY, scale: clampedScale };
        return newTransform;
      });
    },
    [nodeNavigation, setViewTransform, editorRef],
  );

  const handleEditorMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!nodeNavigation) return;

      if (e.button === 1) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({
          x: e.clientX - viewTransform.x,
          y: e.clientY - viewTransform.y,
        });
        return;
      } else if (e.button === 0) {
        e.preventDefault();
        if (!editorRef.current) return;
        if ((e.target as HTMLDivElement).closest(".draggable-node")) return;
        const boudingRect = editorRef.current.getBoundingClientRect();
        setSelectionRect({
          x1: e.clientX - boudingRect.left,
          y1: e.clientY - boudingRect.top,
          x2: e.clientX - boudingRect.left,
          y2: e.clientY - boudingRect.top,
        });
        return;
      }
    },
    [viewTransform, nodeNavigation],
  );

  useEffect(() => {
    const isInteracting =
      (draggingNode || connectingFromNode || isPanning || !!selectionRect) &&
      nodeNavigation;

    if (isInteracting) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [
    isPanning,
    connectingFromNode,
    draggingNode,
    handleMouseMove,
    handleMouseUp,
    nodeNavigation,
    selectionRect,
  ]);

  return {
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
  };
};

export default useNodeSystem;
