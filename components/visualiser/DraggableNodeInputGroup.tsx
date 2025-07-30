"use client";

import {
  backgroundColorClasses,
  fillColorClasses,
  NodeInputType,
  NodeSlot,
} from "@/utils/nodeTypes";
import { CircleDot, CircleDotDashed } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface InputNodeGroupProps {
  switchGroupInputActive: (
    nodeId: string,
    groupIndices: number[],
    activeIndex: number,
  ) => void;
  activeIndex: number;
  inputs: NodeInputType[];
  groupIndex: number;
  nodeId: string;
  registerNodeSlot: (slotData: NodeSlot) => void;
  finishConnecting: (
    nodeId: string,
    slotId: number,
    clearConnectingToNode?: boolean,
  ) => void;
  nodeRef: React.RefObject<HTMLDivElement>;
  getSlotRelativePosition: (
    nodeRef: React.RefObject<HTMLDivElement>,
    slotRef: React.RefObject<SVGSVGElement>,
  ) => {
    relativeX: number;
    relativeY: number;
  };
  removeEdgeToSlot: (nodeId: string, toSlotId: number) => void
}
const DraggableNodeInputGroup = ({
  switchGroupInputActive,
  activeIndex,
  inputs,
  groupIndex,
  nodeId,
  registerNodeSlot,
  finishConnecting,
  getSlotRelativePosition,
  nodeRef,
  removeEdgeToSlot
}: InputNodeGroupProps) => {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const { relativeY, relativeX } = getSlotRelativePosition(
      nodeRef,
      ref as React.RefObject<SVGSVGElement>,
    );

    const slotData: NodeSlot = {
      nodeId: nodeId!,
      slotId: groupIndex!,
      slotIO: "input"!,
      el: ref.current,
      relativeX,
      relativeY,
    };
    registerNodeSlot(slotData);
  }, [nodeId, registerNodeSlot, groupIndex, nodeRef, getSlotRelativePosition]);

  const nameIndexMap = inputs.reduce(
    (acc, cur) => {
      acc[cur.name] = cur.id;
      return acc;
    },
    {} as Record<string, number>,
  );

  const [selectedInput, setSelectedInput] = useState(
    inputs.find((i) => i.id === activeIndex)?.name,
  );

  useEffect(() => {
    setSelectedInput(

      inputs.find((i) => i.id === activeIndex)?.name,
    )
  }, [activeIndex, inputs])

  if (!selectedInput) return;

  const optional =
    inputs.find((i) => i.name === selectedInput)?.defaultValue !== undefined;

  const slotColors = inputs.reduce(
    (acc, cur) => {
      if (cur.type !== "group") return acc;
      if (cur.defaultValue) {
        acc[cur.id] = backgroundColorClasses[cur.slotValueType];
      } else {
        acc[cur.id] = fillColorClasses[cur.slotValueType];
      }
      return acc;
    },
    {} as Record<number, string>,
  );

  const handleChangeInputState = (value: string) => {
    switchGroupInputActive(
      nodeId,
      Object.values(nameIndexMap),
      nameIndexMap[value],
    );
    removeEdgeToSlot(nodeId, groupIndex)
    setSelectedInput(value);
  };

  return (
    <div
      className="h-12 flex space-x-1 items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer mx-[-12px] connect-slot"
      onMouseOver={() => finishConnecting(nodeId!, groupIndex!)}
      onMouseLeave={() => finishConnecting(nodeId!, groupIndex!, true)}
    >
      {!optional ? (
        <CircleDot
          ref={ref}
          size={24}
          className={`bg-background rounded-full ${slotColors[nameIndexMap[selectedInput]]} text-primary`}
        />
      ) : (
        <CircleDotDashed
          ref={ref}
          size={24}
          className={`bg-background rounded-full ${slotColors[nameIndexMap[selectedInput]]} text-primary`}
        />
      )}

      <Select
        value={selectedInput}
        onValueChange={(value) => handleChangeInputState(value)}
      >
        <SelectTrigger className="text-2xl w-40">
          <SelectValue className="text-lg" />
        </SelectTrigger>
        <SelectContent
          defaultValue={inputs[0].name}
          onMouseDown={(e) => {
            e.stopPropagation();
          }}
        >
          {inputs.map((i) => {
            return (
              <SelectItem
                value={i.name}
                key={`${nodeId}${groupIndex}${i.id}group`}
              >
                {i.name}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
export default DraggableNodeInputGroup;
