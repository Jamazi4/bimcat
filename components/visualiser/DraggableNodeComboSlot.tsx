import {
  backgroundColorClasses,
  NodeSlot,
  SlotValues,
} from "@/utils/nodeTypes";
import { CircleDotDashed } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Input } from "../ui/input";
import { useAppSelector } from "@/lib/hooks";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface ComboNodeSlotProps {
  connectedNodeId: string;
  connectedOutputSlodId: number;
  connected: boolean;
  value: number | boolean;
  changeThisValue: (value: number | boolean) => void;
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

// DraggableNodeComboSlot.tsx (updated)
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

  const isNumberSlot = slotValueType === "number";

  // curVal: string for number inputs, boolean for switches
  const [curVal, setCurVal] = useState<string | boolean>(
    isNumberSlot
      ? value !== undefined && value !== null
        ? String(value)
        : ""
      : Boolean(value ?? false),
  );

  // savedLocalValue starts undefined — only set when user enters connected mode
  const [savedLocalValue, setSavedLocalValue] = useState<
    string | boolean | undefined
  >(undefined);
  const [isValidValue, setIsValidValue] = useState(true);

  // Save local before becoming connected; restore saved local on disconnect (if any).
  useEffect(() => {
    if (connected) {
      setSavedLocalValue(curVal);
    } else {
      if (savedLocalValue !== undefined) {
        setCurVal(savedLocalValue);
        if (isNumberSlot) {
          const num = Number(savedLocalValue);
          if (!isNaN(num)) changeThisValue(num);
        } else {
          changeThisValue(Boolean(savedLocalValue));
        }
      }
    }
    // we intentionally only want this to run on `connected` flips
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connected]);

  // Only update the visible value from Redux while connected
  useEffect(() => {
    if (!connected) return;
    if (displayValue === null || displayValue === undefined) return;

    if (isNumberSlot) {
      setCurVal(String(displayValue));
    } else {
      setCurVal(Boolean(displayValue));
    }
  }, [connected, displayValue, isNumberSlot]);

  const handleChangeNum = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const num = Number(val);
    const valid = !isNaN(num) && val.trim() !== "";

    setCurVal(val);
    setIsValidValue(valid);
    if (valid) changeThisValue(num);
  };

  const handleChangeBool = (e: boolean) => {
    setCurVal(e);
    changeThisValue(e);
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

  const hasConnectedValue =
    connected && displayValue !== null && displayValue !== undefined;

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
      {isNumberSlot ? (
        <>
          <Input
            type="text"
            value={String(curVal)}
            onChange={handleChangeNum}
            className={`${!isValidValue && "text-destructive border-destructive"} ${
              hasConnectedValue ? "border-constructive" : ""
            } w-30 !text-2xl`}
            disabled={connected}
          />
          <p
            className={`text-2xl select-none ml-2 ${hasConnectedValue ? "text-constructive" : ""}`}
          >
            {name}
          </p>
        </>
      ) : (
        <>
          <Switch
            id={`${nodeId}-${name}`}
            checked={Boolean(curVal)}
            onCheckedChange={(e) => handleChangeBool(e)}
            disabled={connected}
            className={hasConnectedValue ? "bg-constructive" : ""}
          />
          <div className="m-2 text-2xl">
            <Label
              className={`text-2xl ${hasConnectedValue ? "text-constructive" : ""}`}
              htmlFor={`${nodeId}-${name}`}
            >
              {name}
            </Label>
          </div>
        </>
      )}
    </div>
  );
};
export default DraggableNodeComboSlot;
