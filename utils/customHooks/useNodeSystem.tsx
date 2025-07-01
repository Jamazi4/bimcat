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
  const [nodeDivs, setNodeDivs] = useState<Record<string, HTMLDivElement>>({});
  const [edges, setEdges] = useState<NodeEdgeType[]>([]);
  const [nodeSlots, setNodeSlots] = useState<NodeSlot[]>([]);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const editorRef = useRef<HTMLDivElement>(null);
  const [draggingNodes, setDraggingNodes] = useState<
    {
      id: string;
      offsetX: number;
      offsetY: number;
    }[]
  >([]);
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
  const [selectedNodeIds, setSelectedNodeIds] = useState<string[]>([]);
  const [copiedNodes, setCopiedNodes] = useState<GeomNodeBackType[]>([]);
  const [copiedEdges, setCopiedEdges] = useState<NodeEdgeType[]>([]);
  const copyOffset = useRef(30);

  const startNodeRuntime = useNodesRuntime({ nodes, edges, meshGroup });

  useEffect(() => {
    try {
      startNodeRuntime();
    } catch (error) {
      console.log(error);
    }
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

  const addNode = useCallback(
    (nodeDefId: number) => {
      const nodeId = createNodeId();
      const nodeDefinition = nodeDefinitions.find(
        (node) => node.nodeTypeId === nodeDefId,
      );
      const nodeType = nodeDefinition?.type;
      const relInitPos = 200;
      const worldPoint = screenToWorld(relInitPos, relInitPos);
      const randFactor = 100;
      const nodeX = worldPoint.x + Math.floor(Math.random() * randFactor);
      const nodeY = worldPoint.y + Math.floor(Math.random() * randFactor);

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
    },
    [screenToWorld],
  );

  const copySelectedNodes = useCallback(() => {
    const curCopiedNodes = nodes.filter((n) => selectedNodeIds.includes(n.id));
    setCopiedNodes(curCopiedNodes);

    const curCopiedEdges = edges.filter(
      (e) =>
        selectedNodeIds.includes(e.fromNodeId) &&
        selectedNodeIds.includes(e.toNodeId),
    );
    setCopiedEdges(curCopiedEdges);
    copyOffset.current = 30;
  }, [edges, nodes, selectedNodeIds]);

  const pasteCopiedNodes = useCallback(() => {
    if (!copiedNodes.length) return;

    const idMap: Record<string, string> = {};

    const newNodes = copiedNodes.map((n) => {
      const newId = createNodeId();
      idMap[n.id] = newId;
      const newValues = n.values?.map((val) => val);

      return {
        ...n,
        id: newId,
        x: n.x + copyOffset.current,
        y: n.y + copyOffset.current,
        values: newValues,
      };
    });

    copyOffset.current = copyOffset.current + 30;

    const newEdges = copiedEdges.map((e) => ({
      ...e,
      id: createEdgeId(),
      fromNodeId: idMap[e.fromNodeId],
      toNodeId: idMap[e.toNodeId],
    }));

    setNodes((prevNodes) => [...prevNodes, ...newNodes]);
    setEdges((prevEdges) => [...prevEdges, ...newEdges]);
    setSelectedNodeIds(newNodes.map((n) => n.id));
  }, [copiedEdges, copiedNodes]);

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
      if (!editorRef.current) return;
      wasDragging.current = false;

      const worldPos = screenToWorld(e.clientX, e.clientY);
      const node = nodes.find((n) => n.id === nodeId);
      if (!node) return;

      const isMulti = selectedNodeIds.includes(nodeId);
      const dragTargets = isMulti ? selectedNodeIds : [nodeId];

      const newDraggingNodes = dragTargets
        .map((id) => {
          const n = nodes.find((n) => n.id === id);
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
    [nodes, screenToWorld, selectedNodeIds],
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
      return { iconX: 0, iconY: 0 };
    },
    [nodeSlots, nodes],
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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Delete") {
        setNodes((prevNodes) => {
          return prevNodes.filter((n) => !selectedNodeIds.includes(n.id));
        });

        setNodeSlots((prevSlots) => {
          return prevSlots.filter(
            (slot) => !selectedNodeIds.includes(slot.nodeId),
          );
        });

        setNodeDivs((prevNodeDivs) => {
          const prevNodeDivsArr = Object.entries(prevNodeDivs);
          const newNodeDivs = prevNodeDivsArr.filter(
            ([id, _]) => !selectedNodeIds.includes(id),
          );
          return Object.fromEntries(newNodeDivs);
        });

        setEdges((prevEdges) => {
          return prevEdges.filter((edge) => {
            return (
              !selectedNodeIds.includes(edge.fromNodeId) &&
              !selectedNodeIds.includes(edge.toNodeId)
            );
          });
        });
      } else if ((e.metaKey || e.ctrlKey) && e.key === "c") {
        e.preventDefault();
        copySelectedNodes();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "v") {
        e.preventDefault();
        pasteCopiedNodes();
      }
    },
    [copySelectedNodes, pasteCopiedNodes, selectedNodeIds],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!editorRef.current) return;

      wasDragging.current = true;

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

      if (draggingNodes.length > 0) {
        setNodes((prevNodes) =>
          prevNodes.map((n) => {
            const draggingInfo = draggingNodes.find((d) => d.id === n.id);
            if (draggingInfo) {
              return {
                ...n,
                x: worldPos.x - draggingInfo.offsetX,
                y: worldPos.y - draggingInfo.offsetY,
              };
            }
            return n;
          }),
        );
      }

      if (connectingFromNode) {
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
      draggingNodes,
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

    if (draggingNodes.length === 1 && wasDragging.current === false) {
      setSelectedNodeIds([draggingNodes[0].id]);
      setDraggingNodes([]);
      return;
    }

    cancelConnecting();
    setDraggingNodes([]);
    setIsPanning(false);

    wasDragging.current = false;

    if (!!selectionRect) {
      if (!editorRef.current) return;
      const editorBoundingRect = editorRef.current.getBoundingClientRect();
      const editorOffsetX = editorBoundingRect.left;
      const editorOffsetY = editorBoundingRect.top;

      const upperLeftSelectionX = Math.min(selectionRect.x1, selectionRect.x2);
      const upperLeftSelectionY = Math.min(selectionRect.y1, selectionRect.y2);
      const bottomRightSelectionX = Math.max(
        selectionRect.x1,
        selectionRect.x2,
      );
      const bottomRightSelectionY = Math.max(
        selectionRect.y1,
        selectionRect.y2,
      );

      const selectedIds = Object.entries(nodeDivs)
        .filter(([_, div]) => {
          const boundingRect = div.getBoundingClientRect();

          const nodeTop = boundingRect.top - editorOffsetY;
          const nodeLeft = boundingRect.left - editorOffsetX;
          const nodeBottom = boundingRect.bottom - editorOffsetY;
          const nodeRight = boundingRect.right - editorOffsetX;

          const inside =
            nodeTop > upperLeftSelectionY &&
            nodeLeft > upperLeftSelectionX &&
            nodeBottom < bottomRightSelectionY &&
            nodeRight < bottomRightSelectionX;
          return inside;
        })
        .map(([id, _]) => id);

      setSelectedNodeIds(selectedIds);
    }
    setSelectionRect(null);
  }, [
    connectingToNode,
    connectingFromNode,
    draggingNodes,
    selectionRect,
    nodeDivs,
  ]);

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
      (draggingNodes || connectingFromNode || isPanning || !!selectionRect) &&
      nodeNavigation;

    if (isInteracting) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    if (nodeNavigation) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    isPanning,
    connectingFromNode,
    draggingNodes,
    handleMouseMove,
    handleMouseUp,
    nodeNavigation,
    selectionRect,
    handleKeyDown,
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
    setNodeDivs,
    selectedNodeIds,
  };
};

export default useNodeSystem;
