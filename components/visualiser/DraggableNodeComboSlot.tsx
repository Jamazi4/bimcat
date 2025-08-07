import {
  backgroundColorClasses,
  NodeSlot,
  SlotValues,
} from "@/utils/nodeTypes";
import { CircleDotDashed } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { useAppSelector } from "@/lib/hooks";

interface ComboNodeSlotProps {
  connectedNodeId: string;
  connectedOutputSlodId: number;
  connected: boolean;
  value: number;
  changeThisValue: (value: number) => void;
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

const DraggableNodeComboSlot = ({
  connectedNodeId,
  connectedOutputSlodId,
  connected,
  slotValueType,
  name,
  partialSlotData,
  registerNodeSlot,
  finishConnecting,
  getSlotRelativePosition,
  nodeRef,
  value,
  changeThisValue,
}: ComboNodeSlotProps) => {
  const displayValue = useAppSelector(
    (state) => state.visualiserSlice.nodeValues,
  )[connectedNodeId]?.[connectedOutputSlodId];

  const { nodeId, slotId, slotIO: slotType } = partialSlotData;
  const ref = useRef<SVGSVGElement>(null);

  const [curVal, setCurVal] = useState(String(value ?? ""));
  const [savedLocalValue, setSavedLocalValue] = useState(String(value ?? ""));
  const [isValidValue, setIsValidValue] = useState(true);

  useEffect(() => {
    if (!connected) {
      setCurVal(String(value ?? ""));
      setSavedLocalValue((prev) => (prev === "" ? String(value ?? "") : prev));
    }
  }, [value, connected]);

  useEffect(() => {
    if (connected) {
      setSavedLocalValue(curVal);
    } else {
      setCurVal(savedLocalValue ?? "");
      const num = Number(savedLocalValue);
      if (!isNaN(num)) changeThisValue(num);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]); // we intentionally only run when `connected` flips

  useEffect(() => {
    if (connected) {
      setCurVal(displayValue != null ? String(displayValue) : "");
    }
  }, [connected, displayValue]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = Number(val);
    const valid = !isNaN(num) && val.trim() !== "";

    setCurVal(val);
    setIsValidValue(valid);
    if (valid) {
      changeThisValue(num);
    }
  };
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
      <CircleDotDashed
        ref={ref}
        size={24}
        className={`bg-background rounded-full ${backgroundColorClasses[slotValueType]} text-primary`}
      />
      <Input
        type="text"
        value={curVal}
        onChange={(e) => handleChange(e)}
        className={`${!isValidValue && "text-destructive border-destructive"} w-30 !text-2xl`}
        disabled={connected}
      />
      <p className="text-2xl select-none ml-2">{name}</p>
    </div>
  );
};
export default DraggableNodeComboSlot;
