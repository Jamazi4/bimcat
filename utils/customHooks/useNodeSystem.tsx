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
import { GeomNodeBackType, NodeEdgeType, NodeSlot } from "../nodeTypes";

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

  const [viewTransform, setViewTransform] = useState({ x: 0, y: 0, scale: 1 });
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
      console.log(error);
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
          const bufferGeom = mesh.geometry;
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

  const changeNodeValue = useCallback(
    (nodeId: string, inputId: number, value: string) => {
      const node = nodesRef.current.find((node) => node.id === nodeId);
      if (!node?.values) return;

      const newValues = [...node.values];
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
    [],
  );

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
      const alreadyRegistered = prev.some(
        (slot) =>
          slot.nodeId === slotData.nodeId &&
          slot.slotId === slotData.slotId &&
          slot.slotIO === slotData.slotIO,
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
    (nodeId: string, slotId: number, clear?: boolean) => {
      if (clear) setConnectingToNode(null);
      else setConnectingToNode({ nodeId, slotId });
    },
    [],
  );

  const addEdge = useCallback(
    (
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
    },
    [],
  );

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

        setEdges((prevEdges) => {
          return prevEdges.filter((edge) => {
            return (
              !selectedNodeIdsRef.current.includes(edge.fromNodeId) &&
              !selectedNodeIdsRef.current.includes(edge.toNodeId)
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
    [copySelectedNodes, pasteCopiedNodes],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!editorRef.current) return;

      wasDragging.current = true;

      if (isPanningRef.current) {
        const newX = e.clientX - panStartRef.current.x;
        const newY = e.clientY - panStartRef.current.y;
        setViewTransform((prev) => ({ ...prev, x: newX, y: newY }));
        return;
      }

      const worldPos = screenToWorld(e.clientX, e.clientY);

      if (selectionRectRef.current) {
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

      if (draggingNodesRef.current.length > 0) {
        setNodes((prevNodes) =>
          prevNodes.map((n) => {
            const draggingInfo = draggingNodesRef.current.find(
              (d) => d.id === n.id,
            );
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

      if (connectingFromNodeRef.current) {
        const sourceIcon = nodeSlotsRef.current.find(
          (slot) =>
            slot.nodeId === connectingFromNodeRef.current!.nodeId &&
            slot.slotId === connectingFromNodeRef.current!.slotId,
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
    [getSlotCenter, screenToWorld],
  );

  const handleMouseUp = useCallback(() => {
    if (connectingToNodeRef.current && connectingFromNodeRef.current) {
      addEdge(
        connectingFromNodeRef.current.nodeId,
        connectingFromNodeRef.current.slotId,
        connectingToNodeRef.current.nodeId,
        connectingToNodeRef.current.slotId,
      );
    }

    if (
      draggingNodesRef.current.length === 1 &&
      wasDragging.current === false
    ) {
      setSelectedNodeIds([draggingNodesRef.current[0].id]);
      setDraggingNodes([]);
      return;
    }

    cancelConnecting();
    setDraggingNodes([]);
    setIsPanning(false);

    wasDragging.current = false;

    if (!!selectionRectRef.current) {
      if (!editorRef.current) return;
      const editorBoundingRect = editorRef.current.getBoundingClientRect();
      const editorOffsetX = editorBoundingRect.left;
      const editorOffsetY = editorBoundingRect.top;

      const upperLeftSelectionX = Math.min(
        selectionRectRef.current.x1,
        selectionRectRef.current.x2,
      );
      const upperLeftSelectionY = Math.min(
        selectionRectRef.current.y1,
        selectionRectRef.current.y2,
      );
      const bottomRightSelectionX = Math.max(
        selectionRectRef.current.x1,
        selectionRectRef.current.x2,
      );
      const bottomRightSelectionY = Math.max(
        selectionRectRef.current.y1,
        selectionRectRef.current.y2,
      );

      const selectedIds = Object.entries(nodeDivsRef.current)
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
  }, [addEdge]);

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
    [nodeNavigation],
  );

  const handleEditorMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!nodeNavigation) return;

      if (e.button === 1) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({
          x: e.clientX - viewTransformRef.current.x,
          y: e.clientY - viewTransformRef.current.y,
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
    [nodeNavigation],
  );

  useEffect(() => {
    const isInteracting =
      (draggingNodes.length > 0 ||
        connectingFromNode ||
        isPanning ||
        !!selectionRect) &&
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
    selectionRect,
    nodeNavigation,
    handleKeyDown,
    handleMouseMove,
    handleMouseUp,
  ]);

  const getViewTransformScale = useCallback(() => {
    return viewTransformRef.current.scale;
  }, []);

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
    getViewTransformScale,
  };
};

export default useNodeSystem;
