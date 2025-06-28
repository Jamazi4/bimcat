"use client";
import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useNodeSystem } from "@/utils/customHooks/useNodeSystem";
import { useSearchParams } from "next/navigation";
import DraggableNode from "./DraggableNode";
import LoadingSpinner from "../global/LoadingSpinner";
import * as THREE from "three";
import NodeMenu from "./NodeMenu";
import SVGRenderer from "./SVGRenderer";

const NodeEditor = ({
  nodeNavigation,
  setNodeNavigation,
  nodeMeshGroup,
}: {
  nodeNavigation: boolean;
  setNodeNavigation: Dispatch<SetStateAction<boolean>>;
  nodeMeshGroup: THREE.Group;
}) => {
  const [pendingSave, setPendingSave] = useState(false);
  const [pendingFetch, setPendingFetch] = useState(true);
  const searchParams = useSearchParams();
  const componentId = searchParams.get("component");
  const [zoom, setZoom] = useState(1);
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
  } = useNodeSystem(nodeNavigation, nodeMeshGroup);

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

  const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    console.log(e.deltaY);
    const zoomIntensity = 0.1;
    const delta = e.deltaY > 0 ? -1 : 1;
    const newScale = zoom + delta * zoomIntensity * zoom;

    setZoom(newScale);
  };

  if (!nodes) return;

  if (pendingFetch) return <LoadingSpinner />;

  return (
    <div
      onWheel={(e) => handleWheel(e)}
      ref={editorRef}
      className={`absolute overflow-hidden select-none h-full w-full inset-0 ${nodeNavigation ? "" : "opacity-50 pointer-events-none"}`}
    >
      <SVGRenderer
        nodeNavigation={nodeNavigation}
        edges={edges}
        nodeSlots={nodeSlots}
        getSlotCenter={getSlotCenter}
        deleteEdge={deleteEdge}
        tempEdgePosition={tempEdgePosition}
        zoom={zoom}
      />
      <div
        className={`absolute w-full h-full top-0 left-0 ${nodeNavigation ? "" : "opacity-50"}`}
        style={{
          transform: `scale(${zoom})`,
          transformOrigin: "0 0",
          pointerEvents: "none",
        }}
      >
        {nodes.map((node) => {
          return (
            <DraggableNode
              nodeNavigation={nodeNavigation}
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
      <NodeMenu
        nodeNavigation={nodeNavigation}
        setNodeNavigation={setNodeNavigation}
        addNode={addNode}
        pendingSave={pendingSave}
        handleSaveProject={handleSaveProject}
      />
    </div>
  );
};

export default NodeEditor;
