import {
  backgroundColorClasses,
  fillColorClasses,
  NodeSlot,
  SlotValues,
} from "@/utils/nodeTypes";
import { CircleDot, CircleDotDashed } from "lucide-react";
import { useEffect, useRef } from "react";

interface InputNodeSlotsProps {
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
}

const DraggableNodeInputSlot = ({
  optional,
  slotValueType,
  name,
  partialSlotData,
  registerNodeSlot,
  finishConnecting,
  getSlotRelativePosition,
  nodeRef,
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
  }, [
    nodeId,
    registerNodeSlot,
    slotType,
    slotId,
    nodeRef,
    getSlotRelativePosition,
  ]);

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
      <p className="text-lg select-none">{name}</p>
    </div>
  );
};
export default DraggableNodeInputSlot;
