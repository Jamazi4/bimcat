"use client";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { useNodeSystem } from "@/utils/customHooks/useNodeSystem";
import { useSearchParams } from "next/navigation";
import DraggableNode from "./DraggableNode";
import AddNodeMenu from "./AddNodeMenu";
import { Button } from "../ui/button";
import { LoaderCircle, Save } from "lucide-react";
import LoadingSpinner from "../global/LoadingSpinner";
import EdgeLine from "./EdgeLine";

const NodeEditor = ({
  nodeNavigation,
  setNodeNavigation,
}: {
  nodeNavigation: boolean;
  setNodeNavigation: Dispatch<SetStateAction<boolean>>;
}) => {
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
    changeNodeValue,
    registerNodeSlot,
    tempEdgePosition,
    startConnecting,
    finishConnecting,
    nodeSlots,
    getSlotCenter,
    deleteEdge,
  } = useNodeSystem(nodeNavigation);

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
    <div ref={editorRef} className="select-none">
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
      <svg
        width="100%"
        height="100%"
        className={
          nodeNavigation
            ? "fixed top-0 left-0 pointer-events-none z-50"
            : "pointer-events-none opacity-50 absolute top-0 left-0 z-50"
        }
      >
        <defs>
          <marker
            id="arrowhead-def"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--muted-foreground)" />
          </marker>
          <marker
            id="arrowhead-hover"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="var(--primary)" />
          </marker>
        </defs>
        {edges.map((edge) => {
          const sourceIcon = nodeSlots.find(
            (fns) =>
              fns.nodeId === edge.fromNodeId && fns.slotId === edge.fromSlotId,
          )?.el;
          const targetIcon = nodeSlots.find(
            (tns) =>
              tns.nodeId === edge.toNodeId && tns.slotId === edge.toSlotId,
          )?.el;
          if (!sourceIcon || !targetIcon) return null;

          const { iconX: sourceX, iconY: sourceY } = getSlotCenter(sourceIcon);
          const { iconX: targetX, iconY: targetY } = getSlotCenter(targetIcon);

          return (
            <EdgeLine
              deleteEdge={deleteEdge.bind(null, edge.id)}
              key={edge.id}
              x1={sourceX}
              y1={sourceY}
              x2={targetX}
              y2={targetY}
            />
          );
        })}
        {tempEdgePosition && (
          <EdgeLine
            x1={tempEdgePosition.x1}
            y1={tempEdgePosition.y1}
            x2={tempEdgePosition.x2}
            y2={tempEdgePosition.y2}
            isTemporary
          />
        )}
      </svg>
      <div className={nodeNavigation ? "" : "pointer-events-none opacity-50"}>
        {nodes.map((node) => {
          return (
            <DraggableNode
              finishConnecting={finishConnecting}
              startConnecting={startConnecting}
              changeNodeValue={changeNodeValue}
              key={node.id}
              node={node}
              onMouseDown={startDraggingNode}
              registerNodeSlot={registerNodeSlot}
            />
          );
        })}
      </div>
    </div>
  );
};

export default NodeEditor;
