import { fillColorClasses, NodeSlot, SlotValues } from "@/utils/nodeTypes";
import { CircleDot } from "lucide-react";
import { useEffect, useRef } from "react";

interface OutputNodeSlotsProps {
  slotValueType: SlotValues;
  name: string;
  partialSlotData: Partial<NodeSlot>;
  registerNodeSlot: (slotData: NodeSlot) => void;
  startConnecting: (nodeId: string, slotId: number) => void;
  nodeRef: React.RefObject<HTMLDivElement>;
  getSlotRelativePosition: (
    nodeRef: React.RefObject<HTMLDivElement>,
    slotRef: React.RefObject<SVGSVGElement>,
  ) => {
    relativeX: number;
    relativeY: number;
  };
}

const DraggableNodeOutputSlot = ({
  slotValueType,
  name,
  partialSlotData,
  registerNodeSlot,
  startConnecting,
  nodeRef,
  getSlotRelativePosition,
}: OutputNodeSlotsProps) => {
  const { nodeId, slotId, slotIO: slotType } = partialSlotData;
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;

    const { relativeX, relativeY } = getSlotRelativePosition(
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
      className="h-12 flex space-x-1 justify-end items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer mx-[-12px] connect-slot"
      onMouseDown={() => startConnecting(nodeId!, slotId!)}
    >
      <p className="text-2xl select-none">{name}</p>
      <CircleDot
        ref={ref}
        size={24}
        className={`bg-background rounded-full ${fillColorClasses[slotValueType]} text-primary`}
      />
    </div>
  );
};
export default DraggableNodeOutputSlot;
