"use client";
import { useCallback, useEffect, useState } from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { useNodeSystem } from "@/utils/customHooks/useNodeSystem";
import { useSearchParams } from "next/navigation";
import DraggableNode from "./DraggableNode";
import AddNodeMenu from "./AddNodeMenu";
import { Button } from "../ui/button";
import { LoaderCircle, Save } from "lucide-react";
import LoadingSpinner from "../global/LoadingSpinner";

const NodeEditor = () => {
  const [nodeNavigation, setNodeNavigation] = useState(true);
  const [pendingSave, setPendingSave] = useState(false);
  const [pendingFetch, setPendingFetch] = useState(true);
  const searchParams = useSearchParams();
  const componentId = searchParams.get("component");
  const {
    saveNodeProject,
    fetchNodes,
    addNode,
    nodes,
    edges,
    editorRef,
    startDraggingNode,
  } = useNodeSystem();

  const fetchNodesWrapper = useCallback(async () => {
    if (!componentId) return;
    await fetchNodes(componentId);
    setPendingFetch(false);
  }, [componentId, fetchNodes]);

  useEffect(() => {
    fetchNodesWrapper();
  }, [fetchNodes, fetchNodesWrapper]);

  if (!componentId) return; //TODO: handle error when no componentId

  const handleSaveProject = async () => {
    setPendingSave(true);
    await saveNodeProject(componentId);
    setPendingSave(false);
  };

  if (!nodes) return;

  if (pendingFetch) return <LoadingSpinner />;

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
      <div className="fixed top-36 left-4 z-20 space-x-2">
        <AddNodeMenu addNode={addNode} />
        <Button
          size="icon"
          variant="outline"
          disabled={pendingSave}
          onClick={() => {
            handleSaveProject();
          }}
        >
          {pendingSave ? <LoaderCircle className="animate-spin" /> : <Save />}
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
