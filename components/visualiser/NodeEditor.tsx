"use client";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { GeomNodeBackType } from "@/utils/schemas";
import { CircleDot } from "lucide-react";
import { useNodeSystem } from "@/utils/customHooks/useNodeSystem";
import { useSearchParams } from "next/navigation";

const NodeEditor = () => {
  const [nodeNavigation, setNodeNavigation] = useState(true);
  const searchParams = useSearchParams();
  const componentId = searchParams.get("component");
  const { fetchNodes, nodes, edges, editorRef, startDraggingNode } =
    useNodeSystem();

  useEffect(() => {
    if (!componentId) return;
    fetchNodes(componentId);
  }, [componentId, fetchNodes]);

  if (!nodes) return;

  return (
    <div ref={editorRef}>
      <div className="flex w-40 space-x-2 absolute top-36 right-4 z-20">
        <Switch
          id="nodeNavigation"
          checked={nodeNavigation}
          onCheckedChange={() => setNodeNavigation((cur) => !cur)}
        />
        <Label htmlFor="nodeNavigation">
          {nodeNavigation ? "Node navigation" : "3D navigation"}
        </Label>
      </div>
      <div className="absolute top-36 left-4 z-20">
        <Button className="">Add Node</Button>
      </div>
      {nodes.map((node) => {
        return (
          <GeometryNode
            key={node.id}
            node={node}
            onMouseDown={startDraggingNode}
          />
        );
      })}
    </div>
  );
};

export default NodeEditor;

interface GeometryNodeProps {
  node: GeomNodeBackType;
  onMouseDown: (nodeId: string, e: React.MouseEvent) => void;
}

const GeometryNode = ({ node, onMouseDown }: GeometryNodeProps) => {
  return (
    <div
      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
      className="w-40 min-h-30 bg-accent absolute z-10 border-2 rounded-lg hover:border-primary transition-colors cursor-grab"
      onMouseDown={(e) => {
        e.preventDefault();
        if ((e.target as HTMLDivElement).closest(".connect-slot")) return;
        onMouseDown(node.id, e);
      }}
    >
      {/* title  */}
      <div className="flex justify-center bg-accent-foreground text-background rounded-tl-md rounded-tr-md font-bold">
        {node.type}
      </div>

      {/* inputs  */}
      <div className="grid grid-cols-2 items-center h-full my-auto py-2">
        <div className="flex space-x-1 items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer">
          <CircleDot size={16} />
          <p className="text-sm">input1</p>
        </div>
        <div className="flex space-x-1 justify-end items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer">
          <p className="text-sm">output</p>
          <CircleDot size={16} />
        </div>
      </div>

      {/* outputs */}
    </div>
  );
};
