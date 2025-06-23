"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GeomNodeBackType, NodeEdgeType } from "../schemas";
import {
  fetchNodeProject,
  updateNodeProject,
} from "../actions/componentActions";
import { createNodeId } from "../utilFunctions";
import { nodeDefinitions } from "../nodes";
import { toast } from "sonner";

export type NodeSlot = {
  nodeId: string;
  slotId: number;
  slotType: "input" | "output";
  el: SVGSVGElement;
};

export const useNodeSystem = (nodeNavigation: boolean) => {
  const [nodes, setNodes] = useState<GeomNodeBackType[]>([]);
  const [edges, setEdges] = useState<NodeEdgeType[]>([]);
  const [nodeSlots, setNodeSlots] = useState<NodeSlot[]>([]);
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
        const editorRect = editorRef.current.getBoundingClientRect();
        const mouseX = e.clientX - editorRect.left;
        const mouseY = e.clientY - editorRect.top;
        setDraggingNode({
          id: nodeId,
          offsetX: mouseX - node.x,
          offsetY: mouseY - node.y,
        });
      }
    },
    [nodes],
  );

  const getSlotCenter = (element: SVGSVGElement) => {
    const boundingClientRect = element.getBoundingClientRect();
    const iconX = boundingClientRect.x + boundingClientRect.width / 2;
    const iconY = boundingClientRect.y + boundingClientRect.height / 2;
    return { iconX, iconY };
  };

  const startConnecting = useCallback(
    (nodeId: string, slotId: number) => {
      console.log(nodeId, slotId);
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
    [nodeSlots],
  );

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!editorRef.current) return;
      const editorRect = editorRef.current.getBoundingClientRect();
      const mouseX = e.clientX - editorRect.left;
      const mouseY = e.clientY - editorRect.top;

      if (draggingNode) {
        setNodes((prevNodes) =>
          prevNodes.map((n) =>
            n.id === draggingNode.id
              ? {
                  ...n,
                  x: mouseX - draggingNode.offsetX,
                  y: mouseY - draggingNode.offsetY,
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
            x2: mouseX + editorRect.left,
            y2: mouseY + editorRect.top,
          });
        }
      }
    },
    [draggingNode, nodeSlots, connectingFromNode],
  );

  const cancelConnecting = () => {
    setConnectingFromNode(null);
    setTempEdgePosition(null);
  };

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
    cancelConnecting();
  }, []);

  useEffect(() => {
    if ((draggingNode || connectingFromNode) && nodeNavigation) {
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
    connectingFromNode,
    draggingNode,
    handleMouseMove,
    handleMouseUp,
    nodeNavigation,
  ]);

  return {
    saveNodeProject,
    fetchNodes,
    addNode,
    nodes,
    edges,
    editorRef,
    startDraggingNode,
    changeNodeValue,
    registerNodeSlot,
    tempEdgePosition,
    startConnecting,
  };
};

export default useNodeSystem;
