"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { GeomNodeBackType, NodeEdgeType } from "../schemas";
import { fetchNodeProject } from "../actions/componentActions";

export function useNodeSystem() {
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
  });

  return { fetchNodes, nodes, edges, editorRef, startDraggingNode };
}

export default useNodeSystem;
