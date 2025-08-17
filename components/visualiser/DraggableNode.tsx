"use client";

import { nodeDefinitions } from "@/utils/nodes";
import {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from "react";
import { GeomNodeBackType, NodeEdgeType, NodeSlot } from "@/utils/nodeTypes";
import DraggableNodeInputGroup from "./DraggableNodeInputGroup";
import DraggableNodeOutputSlot from "./DraggableNodeOutputSlot";
import DraggableNodeInputSlot from "./DraggableNodeInputSlot";
import DraggableNodeInputBoolean from "./DraggableNodeInputBoolean";
import DraggableNodeInputNumber from "./DraggableNodeInputNumber";
import DraggableNodeComboSlot from "./DraggableNodeComboSlot";
import DraggableNodeSliderInput from "./DraggableNodeSliderInput";
import {
  extractGroupSlots,
  extractListInputs,
  extractSelectInputs,
} from "@/utils/nodeDefinitions/nodeUtilFunctions";
import DraggableNodeInputString from "./DraggableNodeInputString";

interface DraggableNodeProps {
  switchSelectInputValue: (
    nodeId: string,
    inputId: number,
    activeValueId: number,
  ) => void;
  switchGroupInputActive: (
    nodeId: string,
    groupIndices: number[],
    activeIndex: number,
  ) => void;
  edges: NodeEdgeType[];
  selected: boolean;
  node: GeomNodeBackType;
  startDraggingNode: (nodeId: string, e: React.MouseEvent) => void;
  changeNodeValue: (
    nodeId: string,
    inputId: number,
    value: string | number | boolean,
    removeValue?: boolean,
  ) => void;
  registerNodeSlot: (slotData: NodeSlot) => void;
  startConnecting: (nodeId: string, slotId: number) => void;
  finishConnecting: (
    nodeId: string,
    slotId: number,
    clearConnectingToNode?: boolean,
  ) => void;
  nodeNavigation: boolean;
  getViewTransformScale: () => number;
  setNodeDivs: Dispatch<SetStateAction<Record<string, HTMLDivElement>>>;
  curTheme: string;
}

const DraggableNode = memo(function DraggableNode({
  switchSelectInputValue,
  switchGroupInputActive,
  edges,
  selected,
  node,
  startDraggingNode,
  changeNodeValue,
  registerNodeSlot,
  startConnecting,
  finishConnecting,
  nodeNavigation,
  getViewTransformScale,
  setNodeDivs,
  curTheme,
}: DraggableNodeProps) {
  const nodeDef = nodeDefinitions.filter((def) => def.type === node.type)[0];
  const nodeRef = useRef<HTMLDivElement>(null);
  const changeThisNodeValues = changeNodeValue.bind(null, node.id);

  const highlight = curTheme === "dark" ? "brightness-120" : "brightness-70";

  const connectedSlotIds = useMemo(() => {
    return edges.filter((e) => e.toNodeId === node.id).map((e) => e.toSlotId);
  }, [edges, node.id]);

  useEffect(() => {
    setNodeDivs((prevDivs) => {
      return { ...prevDivs, [node.id]: nodeRef.current! };
    });
  }, [node.id, setNodeDivs]);

  const getSlotRelativePosition = useCallback(
    (
      nodeRef: React.RefObject<HTMLDivElement>,
      slotRef: React.RefObject<SVGSVGElement>,
    ) => {
      const nodeRect = nodeRef.current!.getBoundingClientRect();
      const slotRect = slotRef.current!.getBoundingClientRect();
      const scale = getViewTransformScale();
      const relativeX =
        (slotRect.left + slotRect.width / 2 - nodeRect.left) / scale;
      const relativeY =
        (slotRect.top + slotRect.height / 2 - nodeRect.top) / scale;

      return { relativeX, relativeY };
    },
    [getViewTransformScale],
  );

  const groupSlots = extractGroupSlots(nodeDef);
  const { listSlots, activeGroupIndex } = extractListInputs(
    nodeDef,
    node,
    getSlotRelativePosition,
    nodeRef,
    finishConnecting,
    registerNodeSlot,
  );
  const selectInputs = extractSelectInputs(
    nodeDef,
    node,
    switchSelectInputValue,
  );

  return (
    <div
      ref={nodeRef}
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
        pointerEvents: `${nodeNavigation ? "auto" : "none"}`,
      }}
      className={`draggable-node min-w-50 min-h-15 bg-accent absolute shadow-xl z-20 border-1 rounded-md transition-colors cursor-grab ${selected ? `border-primary ${highlight}` : "hover:border-primary border-secondary-foreground/20 "}`}
      onMouseDown={(e) => {
        if ((e.target as HTMLDivElement).closest(".connect-slot")) return;
        startDraggingNode(node.id, e);
      }}
    >
      {/* title  */}
      <div className="flex justify-center text-secondary border-b-1 rounded-tl-md rounded-tr-md font-bold select-none mx-2 py-2 text-3xl">
        {node.type.toUpperCase()}
      </div>

      {/* selects */}
      {selectInputs.length > 0 && (
        <div className="relative flex flex-col items-center my-4 py-4">
          {selectInputs.map((si, i) => {
            return <div key={`${i}-${node.id}-select`}>{si}</div>;
          })}
        </div>
      )}

      {/* inputs  */}
      <div className="grid grid-cols-[2fr_1fr] space-x-10 items-center h-full my-auto py-4">
        <div className="space-y-6">
          {Object.entries(groupSlots).map(([groupId, inputs]) => {
            return (
              <div key={`${groupId}${node.id}`}>
                <DraggableNodeInputGroup
                  activeIndex={activeGroupIndex}
                  switchGroupInputActive={switchGroupInputActive}
                  nodeId={node.id}
                  groupIndex={parseInt(groupId)}
                  registerNodeSlot={registerNodeSlot}
                  key={groupId}
                  inputs={inputs}
                  getSlotRelativePosition={getSlotRelativePosition}
                  nodeRef={nodeRef as React.RefObject<HTMLDivElement>}
                  finishConnecting={finishConnecting}
                />
              </div>
            );
          })}

          {nodeDef.inputs.map((input, i) => {
            if (input.type === "string") {
              const changeThisValue = changeThisNodeValues.bind(null, input.id);
              const placeholder = input.name;

              return (
                <DraggableNodeInputString
                  placeholder={placeholder}
                  value={(node.values?.[input.id] as string) || ""}
                  changeThisValue={changeThisValue}
                  key={i}
                />
              );
            } else if (input.type === "number") {
              const changeThisValue = changeThisNodeValues.bind(null, input.id);
              if (!node.values) return;

              return input.isSlider ? (
                <DraggableNodeSliderInput
                  key={input.id}
                  value={node.values[input.id] as number}
                  changeThisValue={changeThisValue}
                />
              ) : (
                <DraggableNodeInputNumber
                  key={input.id}
                  value={node.values[input.id] as number}
                  changeThisValue={changeThisValue}
                />
              );
            } else if (input.type === "boolean") {
              const changeThisValue = changeThisNodeValues.bind(null, input.id);
              if (!node.values) return;

              return (
                <DraggableNodeInputBoolean
                  nodeId={node.id}
                  name={input.name}
                  key={input.id}
                  value={node.values[input.id] as boolean}
                  changeThisValue={changeThisValue}
                />
              );
            } else if (input.type === "slot") {
              const optional = input.defaultValue !== undefined;
              const partialSlotData: Partial<NodeSlot> = {
                nodeId: node.id,
                slotId: input.id,
                slotIO: "input",
              };

              return (
                <DraggableNodeInputSlot
                  nodeValues={node.values}
                  optional={optional}
                  slotValueType={input.slotValueType!}
                  getSlotRelativePosition={getSlotRelativePosition}
                  nodeRef={nodeRef as React.RefObject<HTMLDivElement>}
                  finishConnecting={finishConnecting}
                  partialSlotData={partialSlotData}
                  registerNodeSlot={registerNodeSlot}
                  key={i}
                  name={input.name}
                />
              );
            } else if (input.type === "combo") {
              if (!node.values) return;
              const changeThisValue = changeThisNodeValues.bind(null, input.id);
              const partialSlotData: Partial<NodeSlot> = {
                nodeId: node.id,
                slotId: input.id,
                slotIO: "input",
              };
              const connected = connectedSlotIds.includes(input.id);
              let connectedNodeId: string = "";
              let connectedOutputSlotId: number = -1;

              edges
                .filter((e) => e.toNodeId === node.id)
                .forEach((e) => {
                  if (e.toSlotId === input.id) {
                    connectedNodeId = e.fromNodeId;
                    connectedOutputSlotId = e.fromSlotId;
                  }
                });

              return (
                <DraggableNodeComboSlot
                  connectedNodeId={connectedNodeId}
                  connectedOutputSlodId={connectedOutputSlotId}
                  connected={connected}
                  value={node.values[input.id] as number}
                  changeThisValue={changeThisValue}
                  slotValueType={input.slotValueType!}
                  getSlotRelativePosition={getSlotRelativePosition}
                  nodeRef={nodeRef as React.RefObject<HTMLDivElement>}
                  finishConnecting={finishConnecting}
                  partialSlotData={partialSlotData}
                  registerNodeSlot={registerNodeSlot}
                  key={i}
                  name={input.name}
                />
              );
            }
          })}

          {listSlots}
        </div>

        {/* outputs */}
        <div className="space-y-6">
          {nodeDef.outputs.map((output, i) => {
            const outputKey = `${i}-${JSON.stringify(node.values ?? {})}`;
            let tiedInputActive = true;
            if (output.onInputSelectedId !== undefined) {
              const tiedInputId = output.onInputSelectedId;

              tiedInputActive =
                (node.values?.[tiedInputId] as boolean) ??
                (nodeDef.inputs[tiedInputId].value as boolean) ??
                false;

              if (!tiedInputActive) return null;
            }

            if (output.onBooleanTrueId !== undefined) {
              const tiedInputId = output.onBooleanTrueId;

              tiedInputActive =
                (node.values?.[tiedInputId] as boolean) ??
                (nodeDef.inputs[tiedInputId].value as boolean) ??
                false;

              const shouldDisplay = output.onBooleanInverted
                ? !tiedInputActive
                : tiedInputActive;

              if (!shouldDisplay) return null;
            }

            const partialSlotData: Partial<NodeSlot> = {
              nodeId: node.id,
              slotId: output.id,
              slotIO: "output",
            };

            return (
              <DraggableNodeOutputSlot
                nodeValues={node.values}
                slotValueType={output.type}
                getSlotRelativePosition={getSlotRelativePosition}
                nodeRef={nodeRef as React.RefObject<HTMLDivElement>}
                startConnecting={startConnecting}
                registerNodeSlot={registerNodeSlot}
                partialSlotData={partialSlotData}
                key={outputKey}
                name={output.name}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default DraggableNode;
