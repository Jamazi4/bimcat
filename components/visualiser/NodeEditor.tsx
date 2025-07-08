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
import { LoadingSpinnerFixed } from "../global/LoadingSpinner";
import * as THREE from "three";
import NodeMenu from "./NodeMenu";
import SVGRenderer from "./SVGRenderer";
import { useTheme } from "next-themes";

const NodeEditor = ({
  nodeNavigation,
  setNodeNavigation,
  nodeMeshGroup,
}: {
  nodeNavigation: boolean;
  setNodeNavigation: Dispatch<SetStateAction<boolean>>;
  nodeMeshGroup: THREE.Group;
}) => {
  const { theme, systemTheme } = useTheme();
  const curTheme = theme === "system" ? systemTheme : theme;
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
    viewTransform,
    handleWheel,
    handleEditorMouseDown,
    selectionRect,
    setNodeDivs,
    selectedNodeIds,
    getViewTransformScale,
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

  if (!nodes && !curTheme) return;

  if (pendingFetch) return <LoadingSpinnerFixed />;

  return (
    <div
      ref={editorRef}
      onMouseDown={handleEditorMouseDown}
      onWheel={handleWheel}
      className={`absolute overflow-hidden select-none h-full w-full inset-0 ${nodeNavigation ? "" : "opacity-50 pointer-events-none"}`}
    >
      <SVGRenderer
        selectionRect={selectionRect}
        nodeNavigation={nodeNavigation}
        edges={edges}
        nodeSlots={nodeSlots}
        getSlotCenter={getSlotCenter}
        deleteEdge={deleteEdge}
        tempEdgePosition={tempEdgePosition}
        viewTransform={viewTransform}
      />
      <div
        className={`absolute w-full h-full top-0 left-0 ${nodeNavigation ? "" : "opacity-50"}`}
        style={{
          transform: `translate(${viewTransform.x}px, ${viewTransform.y}px) scale(${viewTransform.scale})`,
          transformOrigin: "0 0",
          pointerEvents: "none",
        }}
      >
        {nodes.map((node) => {
          const selected = selectedNodeIds.includes(node.id);
          return (
            <DraggableNode
              curTheme={curTheme!}
              selected={selected}
              setNodeDivs={setNodeDivs}
              getViewTransformScale={getViewTransformScale}
              nodeNavigation={nodeNavigation}
              finishConnecting={finishConnecting}
              startConnecting={startConnecting}
              changeNodeValue={changeNodeValue}
              key={node.id}
              node={node}
              startDraggingNode={startDraggingNode}
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
