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

export const useNodeSystem = () => {
  const [nodes, setNodes] = useState<GeomNodeBackType[]>([]);
  const [edges, setEdges] = useState<NodeEdgeType[]>([]);
  const editorRef = useRef<HTMLDivElement>(null);
  const [draggingNode, setDraggingNode] = useState<{
    id: string;
    offsetX: number;
    offsetY: number;
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
      (node) => node.id === nodeDefId,
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
      }
      // else if (connectingFromNodeId) {
      //   const sourceNode = nodes.find((n) => n.id === connectingFromNodeId);
      //   if (sourceNode) {
      //     const sourceCenter = getNodeCenter(sourceNode);
      //     setTempEdgePosition({
      //       x1: sourceCenter.x,
      //       y1: sourceCenter.y,
      //       x2: mouseX,
      //       y2: mouseY,
      //     });
      //   }
      // }
    },
    [draggingNode],
  );

  const handleMouseUp = useCallback(() => {
    setDraggingNode(null);
  }, []);

  useEffect(() => {
    if (draggingNode) {
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
  }, [draggingNode, handleMouseMove, handleMouseUp]);

  return {
    saveNodeProject,
    fetchNodes,
    addNode,
    nodes,
    edges,
    editorRef,
    startDraggingNode,
    changeNodeValue,
  };
};

export default useNodeSystem;
