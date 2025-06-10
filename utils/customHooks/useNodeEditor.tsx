import { useCallback, useState } from "react";

export interface Node {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  type?: string; // For potential different node types/icons
}

export interface Edge {
  id: string;
  sourceId: string;
  targetId: string;
}

export interface ConnectionPoint {
  nodeId: string;
  x: number; // relative to node's top-left
  y: number; // relative to node's top-left
}
const NODE_WIDTH = 180;
const NODE_HEIGHT = 100;

export function useNodeEditor() {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const addNode = useCallback(() => {
    const newNodeId = `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newNode: Node = {
      id: newNodeId,
      x: Math.random() * 400 + 50, // Initial random position
      y: Math.random() * 300 + 50,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      text: `Node ${nodes.length + 1}`,
    };
    setNodes((prevNodes) => [...prevNodes, newNode]);
  }, [nodes.length]);

  return { addNode };
}
