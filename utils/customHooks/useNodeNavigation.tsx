import {
  Dispatch,
  RefObject,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
} from "react";
import {
  GeomNodeBackType,
  inputWithSlotValueType,
  nodeDefinition,
  NodeEdgeType,
  NodeSlot,
  SlotValues,
} from "../nodeTypes";
import { nodeDefinitions } from "../nodes";
import {
  getActiveInputIds,
  getActiveGroupInputType,
  getGroupInputIds,
} from "../nodeDefinitions/nodeUtilFunctions";
import { createEdgeId } from "../utilFunctions";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  deleteNodeOutputValue,
  switchNodeNavigation,
} from "@/lib/features/visualiser/visualiserSlice";

export const useNodeNavigation = (
  setNodes: Dispatch<SetStateAction<GeomNodeBackType[]>>,
  selectedNodeIdsRef: RefObject<string[]>,
  setNodeSlots: Dispatch<SetStateAction<NodeSlot[]>>,
  setNodeDivs: Dispatch<SetStateAction<Record<string, HTMLDivElement>>>,
  setEdges: Dispatch<SetStateAction<NodeEdgeType[]>>,
  copySelectedNodes: () => void,
  pasteCopiedNodes: () => void,
  wasDragging: RefObject<boolean>,
  editorRef: RefObject<HTMLDivElement | null>,
  isPanningRef: RefObject<boolean>,
  panStartRef: RefObject<{ x: number; y: number }>,
  setViewTransform: Dispatch<
    SetStateAction<{ x: number; y: number; scale: number }>
  >,
  screenToWorld: (
    screenX: number,
    screenY: number,
  ) => {
    x: number;
    y: number;
  },
  selectionRectRef: RefObject<{
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>,
  setSelectionRect: Dispatch<
    SetStateAction<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    } | null>
  >,
  draggingNodesRef: RefObject<
    {
      id: string;
      offsetX: number;
      offsetY: number;
    }[]
  >,
  connectingFromNodeRef: RefObject<{
    nodeId: string;
    slotId: number;
  } | null>,
  nodeSlotsRef: RefObject<NodeSlot[]>,
  getSlotCenter: (element: SVGSVGElement) => {
    iconX: number;
    iconY: number;
  },
  setTempEdgePosition: Dispatch<
    SetStateAction<{
      x1: number;
      y1: number;
      x2: number;
      y2: number;
    } | null>
  >,
  connectingToNodeRef: RefObject<{
    nodeId: string;
    slotId: number;
  } | null>,
  nodesRef: RefObject<GeomNodeBackType[]>,
  setConnectingFromNode: Dispatch<
    SetStateAction<{
      nodeId: string;
      slotId: number;
    } | null>
  >,
  switchGroupInputActive: (
    nodeId: string,
    groupIndices: number[],
    activeIndex: number,
  ) => void,
  setSelectedNodeIds: Dispatch<SetStateAction<string[]>>,
  setDraggingNodes: Dispatch<
    SetStateAction<
      {
        id: string;
        offsetX: number;
        offsetY: number;
      }[]
    >
  >,
  curClickedNodeId: RefObject<string>,
  setIsPanning: Dispatch<SetStateAction<boolean>>,
  nodeDivsRef: RefObject<Record<string, HTMLDivElement>>,
  setPanStart: Dispatch<
    SetStateAction<{
      x: number;
      y: number;
    }>
  >,
  viewTransformRef: RefObject<{
    x: number;
    y: number;
    scale: number;
  }>,
  draggingNodes: {
    id: string;
    offsetX: number;
    offsetY: number;
  }[],
  connectingFromNode: {
    nodeId: string;
    slotId: number;
  } | null,
  isPanning: boolean,
  selectionRect: {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null,
) => {
  const shiftPressed = useRef(false);
  const nodeNavigation = useAppSelector(
    (state) => state.visualiserSlice.nodeNavigation,
  );
  const dispatch = useAppDispatch();

  const addEdge = useCallback(
    //TODO:mode to useNodeSystem
    (
      fromNodeId: string,
      fromSlotId: number,
      toNodeId: string,
      toSlotId: number,
    ) => {
      const newEdge: NodeEdgeType = {
        id: createEdgeId(),
        fromNodeId,
        fromSlotId,
        toNodeId,
        toSlotId,
      };
      const isListSlot = toSlotId >= 100;
      const toNode = nodesRef.current.find((n) => n.id === toNodeId);
      const nodeDef = nodeDefinitions.find((nd) => nd.type === toNode?.type);
      const inputDef = nodeDef?.inputs.find((i) => i.id === toSlotId);
      const isParentList = inputDef?.isList;

      let wasTargetSlotOccupied = false;
      setEdges((prevEdges) => {
        wasTargetSlotOccupied = prevEdges.some(
          (edge) => edge.toNodeId === toNodeId && edge.toSlotId === toSlotId,
        );
        const newEdges = prevEdges.filter(
          (edge) => !(edge.toNodeId === toNodeId && edge.toSlotId === toSlotId),
        );
        return [...newEdges, newEdge];
      });

      if (isListSlot || isParentList) {
        setNodes((prevNodes) =>
          prevNodes.map((node) => {
            if (node.id !== toNodeId) return node;
            const currentValues = { ...node.values };

            if (
              (isListSlot && !wasTargetSlotOccupied) ||
              (isParentList && !wasTargetSlotOccupied)
            ) {
              if (isListSlot) {
                const currentListSlots = Object.keys(currentValues)
                  .map(Number)
                  .filter((k) => k >= 100)
                  .sort((a, b) => a - b);

                const maxSlot =
                  currentListSlots.length > 0
                    ? Math.max(...currentListSlots)
                    : 99;

                const nextSlotId = maxSlot + 1;
                currentValues[nextSlotId] = false;
              } else if (isParentList) {
                const hasListSlots = Object.keys(currentValues).some(
                  (k) => parseInt(k) >= 100,
                );
                if (!hasListSlots) {
                  const currentListSlots = Object.keys(currentValues)
                    .map(Number)
                    .filter((k) => k >= 100)
                    .sort((a, b) => a - b);
                  const maxSlot =
                    currentListSlots.length > 0
                      ? Math.max(...currentListSlots)
                      : 99;
                  const nextSlotId = maxSlot + 1;
                  currentValues[nextSlotId] = false;
                }
              }
            }
            return {
              ...node,
              values: currentValues,
            };
          }),
        );
      }
    },
    [nodesRef, setEdges, setNodes],
  );

  const cancelConnecting = useCallback(() => {
    setConnectingFromNode(null);
    setTempEdgePosition(null);
  }, [setConnectingFromNode, setTempEdgePosition]);

  const addEdgeToGroupInput = useCallback(
    //TODO:mode to useNodeSystem
    (
      toNode: GeomNodeBackType | undefined,
      toNodeDef: nodeDefinition,
      inputValueType: SlotValues | null,
      outputType: SlotValues | undefined,
    ) => {
      if (!connectingToNodeRef.current)
        throw new Error("No active to node ref");

      const groupInputIds = getGroupInputIds(
        toNodeDef,
        connectingToNodeRef.current?.slotId,
      );

      if (!groupInputIds) {
        cancelConnecting();
        throw new Error("Could not find group input Ids");
      }

      const activeInputIds = getActiveInputIds(toNode!.values!, groupInputIds);
      const allowedInputTypes = toNodeDef?.inputs
        .filter((input) => input.type === "group")
        .map((group) => group.slotValueType);

      const activeInputType = getActiveGroupInputType(
        toNodeDef,
        activeInputIds,
      );

      if (!inputValueType) {
        cancelConnecting();
        throw new Error("Could not find group input value type");
      }

      if (
        activeInputType !== outputType &&
        allowedInputTypes?.includes(inputValueType)
      ) {
        const newActiveInputId = toNodeDef.inputs.find(
          (input) =>
            input.type === "group" &&
            groupInputIds.includes(input.id) &&
            input.slotValueType === outputType,
        )?.id;

        if (newActiveInputId === undefined) {
          cancelConnecting();
          return;
        }

        switchGroupInputActive(toNode!.id, groupInputIds, newActiveInputId);

        addEdge(
          connectingFromNodeRef.current!.nodeId,
          connectingFromNodeRef.current!.slotId,
          connectingToNodeRef.current!.nodeId,
          connectingToNodeRef.current!.slotId,
        );
        cancelConnecting();
        return;
      } else if (activeInputType === outputType) {
        addEdge(
          connectingFromNodeRef.current!.nodeId,
          connectingFromNodeRef.current!.slotId,
          connectingToNodeRef.current!.nodeId,
          connectingToNodeRef.current!.slotId,
        );
        cancelConnecting();
        return;
      }
    },
    [
      addEdge,
      cancelConnecting,
      connectingFromNodeRef,
      connectingToNodeRef,
      switchGroupInputActive,
    ],
  );

  const deleteNode = useCallback(() => {
    //TODO: move to useNodeSystem

    dispatch(deleteNodeOutputValue({ nodeIds: selectedNodeIdsRef.current }));

    setNodes((prevNodes) => {
      return prevNodes.filter(
        (n) => !selectedNodeIdsRef.current.includes(n.id),
      );
    });

    setNodeSlots((prevSlots) => {
      return prevSlots.filter(
        (slot) => !selectedNodeIdsRef.current.includes(slot.nodeId),
      );
    });

    setNodeDivs((prevNodeDivs) => {
      const prevNodeDivsArr = Object.entries(prevNodeDivs);
      const newNodeDivs = prevNodeDivsArr.filter(
        ([id, _]) => !selectedNodeIdsRef.current.includes(id),
      );
      return Object.fromEntries(newNodeDivs);
    });

    setEdges((prevEdges) => {
      return prevEdges.filter((edge) => {
        return (
          !selectedNodeIdsRef.current.includes(edge.fromNodeId) &&
          !selectedNodeIdsRef.current.includes(edge.toNodeId)
        );
      });
    });
  }, [
    dispatch,
    selectedNodeIdsRef,
    setEdges,
    setNodeDivs,
    setNodeSlots,
    setNodes,
  ]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Delete") {
        e.preventDefault();
        deleteNode();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "c") {
        e.preventDefault();
        copySelectedNodes();
      } else if ((e.metaKey || e.ctrlKey) && e.key === "v") {
        e.preventDefault();
        pasteCopiedNodes();
      } else if (e.shiftKey) {
        e.preventDefault();
        shiftPressed.current = true;
      }
    },
    [copySelectedNodes, deleteNode, pasteCopiedNodes],
  );

  const handleNavigationModeSwitch = useCallback(
    (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey) {
        e.preventDefault();
        dispatch(switchNodeNavigation({ nodeNavigation: !nodeNavigation }));
      }
    },
    [dispatch, nodeNavigation],
  );

  const handleKeyUp = (e: KeyboardEvent) => {
    if (e.key === "Shift") {
      shiftPressed.current = false;
    }
  };

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!editorRef.current) return;

      wasDragging.current = true;

      if (isPanningRef.current) {
        const newX = e.clientX - panStartRef.current.x;
        const newY = e.clientY - panStartRef.current.y;
        setViewTransform((prev) => ({ ...prev, x: newX, y: newY }));
        return;
      }

      const worldPos = screenToWorld(e.clientX, e.clientY);

      if (selectionRectRef.current) {
        const boundingRect = editorRef.current.getBoundingClientRect();
        setSelectionRect((prevRect) => {
          if (!prevRect) return null;
          return {
            x1: prevRect.x1,
            y1: prevRect.y1,
            x2: e.clientX - boundingRect.left,
            y2: e.clientY - boundingRect.top,
          };
        });
      }

      if (draggingNodesRef.current.length > 0) {
        setNodes((prevNodes) =>
          prevNodes.map((n) => {
            const draggingInfo = draggingNodesRef.current.find(
              (d) => d.id === n.id,
            );
            if (draggingInfo) {
              return {
                ...n,
                x: worldPos.x - draggingInfo.offsetX,
                y: worldPos.y - draggingInfo.offsetY,
              };
            }
            return n;
          }),
        );
      }

      if (connectingFromNodeRef.current) {
        const sourceIcon = nodeSlotsRef.current.find(
          (slot) =>
            slot.nodeId === connectingFromNodeRef.current!.nodeId &&
            slot.slotId === connectingFromNodeRef.current!.slotId,
        )?.el;
        if (sourceIcon) {
          const { iconX, iconY } = getSlotCenter(sourceIcon);
          setTempEdgePosition({
            x1: iconX,
            y1: iconY,
            x2: worldPos.x,
            y2: worldPos.y,
          });
        }
      }
    },
    [
      connectingFromNodeRef,
      draggingNodesRef,
      editorRef,
      getSlotCenter,
      isPanningRef,
      nodeSlotsRef,
      panStartRef,
      screenToWorld,
      selectionRectRef,
      setNodes,
      setSelectionRect,
      setTempEdgePosition,
      setViewTransform,
      wasDragging,
    ],
  );

  const handleMouseUp = useCallback(() => {
    if (connectingToNodeRef.current && connectingFromNodeRef.current) {
      const toNode = nodesRef.current.find(
        (n) => n.id === connectingToNodeRef.current?.nodeId,
      );

      const toNodeDef = nodeDefinitions.find(
        (def) => toNode?.type === def.type,
      );

      if (!toNodeDef) {
        cancelConnecting();
        throw new Error("Could not find correct node definition");
      }

      const inputSlot = toNodeDef?.inputs.find(
        (i) => i.id === connectingToNodeRef.current?.slotId,
      );

      const inputType = inputSlot?.type;
      const slotTypes = ["group", "slot", "combo"];
      const inputValueType =
        inputSlot && slotTypes.includes(inputSlot.type)
          ? (inputSlot as inputWithSlotValueType).slotValueType
          : null;

      const fromNode = nodesRef.current.find(
        (n) => n.id === connectingFromNodeRef.current?.nodeId,
      );
      const outputType = nodeDefinitions
        .find((def) => fromNode?.type === def.type)
        ?.outputs.find(
          (o) => o.id === connectingFromNodeRef.current?.slotId,
        )?.type;

      const toSlotId = connectingToNodeRef.current.slotId;

      const isListChild = toSlotId >= 100;

      if (isListChild) {
        let listParentValueType: SlotValues = "number";
        const listParentSlots = toNodeDef.inputs.filter(
          (i) => i.isList === true,
        );
        if (listParentSlots.length > 1) {
          listParentSlots.forEach((slot) => {
            if (toNode?.values?.[slot.id] === true) {
              listParentValueType = (slot as inputWithSlotValueType)
                .slotValueType;
            }
          });
        } else {
          listParentValueType = (listParentSlots[0] as inputWithSlotValueType)
            .slotValueType;
        }

        if (outputType !== listParentValueType) {
          cancelConnecting();
          return;
        }

        addEdge(
          connectingFromNodeRef.current.nodeId,
          connectingFromNodeRef.current.slotId,
          connectingToNodeRef.current.nodeId,
          connectingToNodeRef.current.slotId,
        );

        cancelConnecting();
        return;
      }

      if (inputType === "group") {
        addEdgeToGroupInput(toNode, toNodeDef, inputValueType, outputType);
      }

      const isSameType = outputType === inputValueType;
      const isOutputNode =
        inputValueType === "geometry" &&
        (outputType === "mesh" ||
          outputType === "linestring" ||
          outputType === "vector");

      if (isSameType || isOutputNode) {
        addEdge(
          connectingFromNodeRef.current.nodeId,
          connectingFromNodeRef.current.slotId,
          connectingToNodeRef.current.nodeId,
          connectingToNodeRef.current.slotId,
        );
        cancelConnecting();
        return;
      } else {
        cancelConnecting();
        return;
      }
    }

    if (
      draggingNodesRef.current.length === 1 &&
      wasDragging.current === false
    ) {
      if (shiftPressed.current === true) {
        setSelectedNodeIds([
          ...selectedNodeIdsRef.current,
          draggingNodesRef.current[0].id,
        ]);
      } else {
        setSelectedNodeIds([draggingNodesRef.current[0].id]);
      }
      setDraggingNodes([]);
      return;
    } else if (
      draggingNodesRef.current.length > 1 &&
      shiftPressed.current === true &&
      wasDragging.current === false
    ) {
      const newSelectedNodeIds = selectedNodeIdsRef.current.filter(
        (nid) => nid !== curClickedNodeId.current,
      );
      setSelectedNodeIds(newSelectedNodeIds);
      setDraggingNodes([]);
      return;
    }

    cancelConnecting();
    setDraggingNodes([]);
    setIsPanning(false);

    wasDragging.current = false;

    if (!!selectionRectRef.current) {
      if (!editorRef.current) return;
      const editorBoundingRect = editorRef.current.getBoundingClientRect();
      const editorOffsetX = editorBoundingRect.left;
      const editorOffsetY = editorBoundingRect.top;

      const upperLeftSelectionX = Math.min(
        selectionRectRef.current.x1,
        selectionRectRef.current.x2,
      );
      const upperLeftSelectionY = Math.min(
        selectionRectRef.current.y1,
        selectionRectRef.current.y2,
      );
      const bottomRightSelectionX = Math.max(
        selectionRectRef.current.x1,
        selectionRectRef.current.x2,
      );
      const bottomRightSelectionY = Math.max(
        selectionRectRef.current.y1,
        selectionRectRef.current.y2,
      );

      const selectedIds = Object.entries(nodeDivsRef.current)
        .filter(([_, div]) => {
          const boundingRect = div.getBoundingClientRect();

          const nodeTop = boundingRect.top - editorOffsetY;
          const nodeLeft = boundingRect.left - editorOffsetX;
          const nodeBottom = boundingRect.bottom - editorOffsetY;
          const nodeRight = boundingRect.right - editorOffsetX;

          const inside =
            nodeTop > upperLeftSelectionY &&
            nodeLeft > upperLeftSelectionX &&
            nodeBottom < bottomRightSelectionY &&
            nodeRight < bottomRightSelectionX;
          return inside;
        })
        .map(([id, _]) => id);

      if (shiftPressed.current === false) {
        setSelectedNodeIds(selectedIds);
      } else {
        const subtractiveSelection = [
          ...selectedNodeIdsRef.current,
          ...selectedIds,
        ].filter(
          (id) =>
            !(
              selectedIds.includes(id) &&
              selectedNodeIdsRef.current.includes(id)
            ),
        );
        setSelectedNodeIds(subtractiveSelection);
      }
    }
    setSelectionRect(null);
  }, [
    addEdge,
    addEdgeToGroupInput,
    cancelConnecting,
    connectingFromNodeRef,
    connectingToNodeRef,
    curClickedNodeId,
    draggingNodesRef,
    editorRef,
    nodeDivsRef,
    nodesRef,
    selectedNodeIdsRef,
    selectionRectRef,
    setDraggingNodes,
    setIsPanning,
    setSelectedNodeIds,
    setSelectionRect,
    wasDragging,
  ]);

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (!nodeNavigation) return;

      setViewTransform((prevTransform) => {
        if (!editorRef.current) return prevTransform;
        const rect = editorRef.current.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        const zoomIntensity = 0.1;
        const delta = e.deltaY > 0 ? -1 : 1;
        const newScale =
          prevTransform.scale + delta * zoomIntensity * prevTransform.scale;
        const clampedScale = Math.max(0.1, Math.min(3, newScale));

        const worldX = (mouseX - prevTransform.x) / prevTransform.scale;
        const worldY = (mouseY - prevTransform.y) / prevTransform.scale;

        const newX = mouseX - worldX * clampedScale;
        const newY = mouseY - worldY * clampedScale;
        const newTransform = { x: newX, y: newY, scale: clampedScale };
        return newTransform;
      });
    },
    [editorRef, nodeNavigation, setViewTransform],
  );

  const handleEditorMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!nodeNavigation) return;

      if (e.button === 2) {
        e.preventDefault();
        setIsPanning(true);
        setPanStart({
          x: e.clientX - viewTransformRef.current.x,
          y: e.clientY - viewTransformRef.current.y,
        });
        return;
      } else if (e.button === 0) {
        if (!editorRef.current) return;
        if ((e.target as HTMLDivElement).closest(".draggable-node")) return;

        const boudingRect = editorRef.current.getBoundingClientRect();

        setSelectionRect({
          x1: e.clientX - boudingRect.left,
          y1: e.clientY - boudingRect.top,
          x2: e.clientX - boudingRect.left,
          y2: e.clientY - boudingRect.top,
        });
        return;
      }
    },
    [
      editorRef,
      nodeNavigation,
      setIsPanning,
      setPanStart,
      setSelectionRect,
      viewTransformRef,
    ],
  );

  useEffect(() => {
    const isInteracting =
      (draggingNodes.length > 0 ||
        connectingFromNode ||
        isPanning ||
        !!selectionRect) &&
      nodeNavigation;

    document.addEventListener("keydown", handleNavigationModeSwitch);

    if (isInteracting) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    if (nodeNavigation) {
      document.addEventListener("keydown", handleKeyDown);
      document.addEventListener("keyup", handleKeyUp);
      document.addEventListener("contextmenu", function (e) {
        e.preventDefault();
      });
    } else {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("contextmenu", function (e) {
        e.preventDefault();
      });
    }
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("keydown", handleNavigationModeSwitch);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("keyup", handleKeyUp);
      document.removeEventListener("contextmenu", function (e) {
        e.preventDefault();
      });
    };
  }, [
    nodeNavigation,
    handleKeyDown,
    handleMouseMove,
    handleMouseUp,
    draggingNodes.length,
    connectingFromNode,
    isPanning,
    selectionRect,
    handleNavigationModeSwitch,
  ]);

  return { handleWheel, handleEditorMouseDown };
};
