"use client";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { useNodeSystem } from "@/utils/customHooks/useNodeSystem";
import { useSearchParams } from "next/navigation";
import DraggableNode from "./DraggableNode";
import { Plus } from "lucide-react";

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
      <div className="flex w-40 space-x-2 fixed top-24 right-4 z-20">
        <Switch
          id="nodeNavigation"
          checked={nodeNavigation}
          onCheckedChange={() => setNodeNavigation((cur) => !cur)}
        />
        <Label htmlFor="nodeNavigation">
          {nodeNavigation ? "Node navigation" : "3D navigation"}
        </Label>
      </div>
      <div className="fixed top-36 left-4 z-20">
        <Button className="">
          <Plus />
        </Button>
      </div>
      {nodes.map((node) => {
        return (
          <DraggableNode
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
