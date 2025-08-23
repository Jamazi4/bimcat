"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNodeSystem } from "@/utils/customHooks/useNodeSystem";
import { useSearchParams } from "next/navigation";
import DraggableNode from "./DraggableNode";
import { LoadingSpinnerFixed } from "../global/LoadingSpinner";
import * as THREE from "three";
import NodeMenu from "./NodeMenu";
import SVGRenderer from "./SVGRenderer";
import { useTheme } from "next-themes";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import NodeContextMenu from "./NodeContextMenu";
import { setContextMenuOpen } from "@/lib/features/visualiser/visualiserSlice";

const NodeEditor = ({ nodeMeshGroup }: { nodeMeshGroup: THREE.Group }) => {
  const { theme, systemTheme } = useTheme();
  const curTheme = useRef(theme === "system" ? systemTheme : theme);
  useEffect(() => {
    curTheme.current = theme === "system" ? systemTheme : theme;
  }, [theme, systemTheme]);

  const dispatch = useAppDispatch();

  const nodeNavigation = useAppSelector(
    (state) => state.visualiserSlice.nodeNavigation,
  );
  const contextMenuOpen = useAppSelector(
    (state) => state.visualiserSlice.contextMenuOpen,
  );

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
    switchGroupInputActive,
    switchSelectInputValue,
    removeEdgeToSlot,
  } = useNodeSystem(nodeMeshGroup);

  const fetchNodesWrapper = useCallback(async () => {
    if (!componentId) return;
    await fetchNodes(componentId);
    setPendingFetch(false);
  }, [componentId, fetchNodes]);

  useEffect(() => {
    fetchNodesWrapper();
  }, [fetchNodes, fetchNodesWrapper]);

  if (!componentId) throw new Error("Could not find componentId");

  if (!nodes) throw new Error("Could not find node project");

  if (!curTheme.current) throw new Error("Could not read theme settings");

  if (pendingFetch) return <LoadingSpinnerFixed />;

  const handleSaveProject = async () => {
    setPendingSave(true);
    try {
      await saveNodeProject(componentId);
      setPendingSave(false);
    } catch (error) {
      console.log(error);
      setPendingSave(false);
    }
  };

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
              switchSelectInputValue={switchSelectInputValue}
              switchGroupInputActive={switchGroupInputActive}
              edges={edges}
              curTheme={curTheme.current!}
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
              removeEdgeToSlot={removeEdgeToSlot}
            />
          );
        })}
      </div>
      <NodeMenu
        addNode={addNode}
        pendingSave={pendingSave}
        handleSaveProject={handleSaveProject}
      />
      {contextMenuOpen.isOpen && nodeNavigation && (
        <NodeContextMenu
          addNode={addNode}
          x={contextMenuOpen.x}
          y={contextMenuOpen.y}
          onClose={() => {
            dispatch(
              setContextMenuOpen({
                contextMenuOpen: { x: 0, y: 0, isOpen: false },
              }),
            );
          }}
        />
      )}
    </div>
  );
};

export default NodeEditor;
