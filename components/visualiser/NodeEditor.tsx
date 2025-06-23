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
    editorRef,
    startDraggingNode,
    changeNodeValue,
    registerNodeSlot,
    tempEdgePosition,
    startConnecting,
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
    <div ref={editorRef} className={"select-none"}>
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
        className="absolute top-0 left-0 pointer-events-none"
      >
        <defs>
          <marker
            id="arrowhead"
            markerWidth="10"
            markerHeight="7"
            refX="9"
            refY="3.5"
            orient="auto"
          >
            <polygon points="0 0, 10 3.5, 0 7" fill="white" />
          </marker>
        </defs>
        {/* {edges.map((edge) => { */}
        {/*   const sourceNode = nodes.find((n) => n.id === edge.sourceId); */}
        {/*   const targetNode = nodes.find((n) => n.id === edge.targetId); */}
        {/*   if (!sourceNode || !targetNode) return null; */}
        {/**/}
        {/*   const sourceCenter = getNodeCenter(sourceNode); */}
        {/*   const targetCenter = getNodeCenter(targetNode); */}
        {/**/}
        {/*   return ( */}
        {/*     <EdgeLine */}
        {/*       key={edge.id} */}
        {/*       x1={sourceCenter.x} */}
        {/*       y1={sourceCenter.y} */}
        {/*       x2={targetCenter.x} */}
        {/*       y2={targetCenter.y} */}
        {/*     /> */}
        {/*   ); */}
        {/* })} */}
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
