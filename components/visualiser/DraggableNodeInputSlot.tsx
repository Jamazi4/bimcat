import {
  backgroundColorClasses,
  fillColorClasses,
  NodeSlot,
  SlotValues,
} from "@/utils/nodeTypes";
import { CircleDot, CircleDotDashed, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Button } from "../ui/button";

interface InputNodeSlotsProps {
  isList: boolean;
  optional: boolean;
  slotValueType: SlotValues;
  name: string;
  partialSlotData: Partial<NodeSlot>;
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
  nodeValues: Record<string, string | number | boolean> | undefined;
  removeListSlot: (nodeId: string, slotId: number) => void
}

const DraggableNodeInputSlot = ({
  isList,
  optional,
  slotValueType,
  name,
  partialSlotData,
  registerNodeSlot,
  finishConnecting,
  getSlotRelativePosition,
  nodeRef,
  nodeValues,
  removeListSlot
}: InputNodeSlotsProps) => {
  const { nodeId, slotId, slotIO: slotType } = partialSlotData;
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const { relativeY, relativeX } = getSlotRelativePosition(
      nodeRef,
      ref as React.RefObject<SVGSVGElement>,
    );

    const slotData: NodeSlot = {
      nodeId: nodeId!,
      slotId: slotId!,
      slotIO: slotType!,
      el: ref.current,
      relativeX,
      relativeY,
    };
    registerNodeSlot(slotData);
    if (!nodeValues) return
  }, [nodeId, registerNodeSlot, slotType, slotId, nodeRef, getSlotRelativePosition, nodeValues]);

  const handleRemoveSlot = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    removeListSlot(nodeId!, slotId!)
  }

  return (
    <div
      className="h-12 flex space-x-1 items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer mx-[-12px] connect-slot"
      onMouseOver={() => finishConnecting(nodeId!, slotId!)}
      onMouseLeave={() => finishConnecting(nodeId!, slotId!, true)}
    >
      {!optional ? (
        <CircleDot
          ref={ref}
          size={24}
          className={`bg-background rounded-full ${fillColorClasses[slotValueType]} text-primary`}
        />
      ) : (
        <CircleDotDashed
          ref={ref}
          size={24}
          className={`bg-background rounded-full ${backgroundColorClasses[slotValueType]} text-primary`}
        />
      )}
      <p className="text-2xl select-none">{name}</p>
      {isList &&
        <Button
          variant='ghost'
          className="text-destructive text-2xl"
          onClick={(e) => handleRemoveSlot(e)}>
          <X className="size-[24px] hover:cursor-pointer" />
        </Button>}
    </div>
  );
};
export default DraggableNodeInputSlot;
