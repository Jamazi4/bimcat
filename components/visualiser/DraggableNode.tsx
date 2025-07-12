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

interface DraggableNodeProps {
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
    value: number | boolean | string,
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

  const highlight = curTheme === "dark" ? "brightness-120" : "brightness-70";

  const groupSlots = nodeDef.inputs.reduce(
    (acc, cur) => {
      if (cur.type == "group") {
        if (!acc[cur.groupIndex]) acc[cur.groupIndex] = [];
        acc[cur.groupIndex].push(cur);
      }
      return acc;
    },
    {} as Record<number, typeof nodeDef.inputs>,
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
        {node.type}
      </div>

      {/* inputs  */}
      <div className="grid grid-cols-[2fr_1fr] space-x-10 items-center h-full my-auto py-4">
        <div className="space-y-6">
          {Object.entries(groupSlots).map(([groupId, inputs]) => {
            let activeIndex: number = inputs[0].id;
            const curInputIds = inputs.map((input) => input.id);
            if (node.values) {
              Object.entries(node.values).forEach(([inputId, val]) => {
                const inputIdParsed = parseInt(inputId);
                if (val === true && curInputIds.includes(inputIdParsed)) {
                  activeIndex = parseInt(inputId);
                }
              });
            }
            return (
              <DraggableNodeInputGroup
                activeIndex={activeIndex}
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
            );
          })}

          {nodeDef.inputs.map((input, i) => {
            if (input.type === "number") {
              const changeThisValue = changeThisNodeValues.bind(null, input.id);
              if (!node.values) return;

              return (
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

              return (
                <DraggableNodeComboSlot
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
        </div>

        {/* outputs */}
        <div className="space-y-6">
          {nodeDef.outputs.map((output, i) => {
            const partialSlotData: Partial<NodeSlot> = {
              nodeId: node.id,
              slotId: output.id,
              slotIO: "output",
            };

            return (
              <DraggableNodeOutputSlot
                slotValueType={output.type}
                getSlotRelativePosition={getSlotRelativePosition}
                nodeRef={nodeRef as React.RefObject<HTMLDivElement>}
                startConnecting={startConnecting}
                registerNodeSlot={registerNodeSlot}
                partialSlotData={partialSlotData}
                key={i}
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
