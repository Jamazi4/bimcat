"use client";

import { nodeDefinitions } from "@/utils/nodes";
import { GeomNodeBackType } from "@/utils/schemas";
import { CircleDot } from "lucide-react";
import { Input } from "../ui/input";
import { useEffect, useRef, useState } from "react";
import { NodeSlot } from "@/utils/customHooks/useNodeSystem";

interface GeometryNodeProps {
  node: GeomNodeBackType;
  onMouseDown: (nodeId: string, e: React.MouseEvent) => void;
  changeNodeValue: (nodeId: string, inputId: number, value: string) => void;
  registerNodeSlot: (slotData: NodeSlot) => void;
  startConnecting: (nodeId: string, slotId: number) => void;
}
const DraggableNode = ({
  node,
  onMouseDown,
  changeNodeValue,
  registerNodeSlot,
  startConnecting,
}: GeometryNodeProps) => {
  const nodeDef = nodeDefinitions.filter((def) => def.type === node.type)[0];
  const changeThisNodeValues = changeNodeValue.bind(null, node.id);
  return (
    <div
      style={{ transform: `translate(${node.x}px, ${node.y}px)` }}
      className="w-50 min-h-15 bg-accent absolute z-10 border-2 rounded-lg hover:border-primary transition-colors cursor-grab"
      onMouseDown={(e) => {
        if ((e.target as HTMLDivElement).closest(".connect-slot")) return;
        onMouseDown(node.id, e);
      }}
    >
      {/* title  */}
      <div className="flex justify-center bg-accent-foreground text-background rounded-tl-md rounded-tr-md font-bold select-none">
        {node.type}
      </div>

      {/* inputs  */}
      <div className="grid grid-cols-2 items-center h-full my-auto py-2">
        <div>
          {nodeDef.inputs.map((input, i) => {
            if (input.type === "number") {
              const changeThisValue = changeThisNodeValues.bind(null, input.id);
              if (!node.values) return;
              return (
                <InputNumber
                  key={input.id}
                  value={node.values[input.id]}
                  changeThisValue={changeThisValue}
                />
              );
            } else if (input.type === "slot") {
              const partialSlotData: Partial<NodeSlot> = {
                nodeId: node.id,
                slotId: input.id,
                slotType: "input",
              };
              return (
                <InputSlot
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
        <div>
          {nodeDef.outputs.map((output, i) => {
            const partialSlotData: Partial<NodeSlot> = {
              nodeId: node.id,
              slotId: output.id,
              slotType: "output",
            };
            return (
              <OutputSlot
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
};

export default DraggableNode;

const InputNumber = ({
  value,
  changeThisValue,
}: {
  value: string;
  changeThisValue: (value: string) => void;
}) => {
  const [curVal, setCurVal] = useState(value);
  const [isValidValue, setIsValidValue] = useState(true);

  useEffect(() => {
    const num = Number(curVal);
    setIsValidValue(!isNaN(num) || curVal === "");
  }, [curVal]);

  const changeValue = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurVal(e.target.value);
    changeThisValue(e.target.value);
  };

  return (
    <div className="flex space-x-1 items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer ml-2 connect-slot">
      <Input
        type="text"
        value={curVal}
        onChange={(e) => changeValue(e)}
        className={isValidValue ? "" : "text-destructive border-destructive"}
      />
    </div>
  );
};

interface InputNodeSlotsProps {
  name: string;
  partialSlotData: Partial<NodeSlot>;
  registerNodeSlot: (slotData: NodeSlot) => void;
}

const InputSlot = ({
  name,
  partialSlotData,
  registerNodeSlot,
}: InputNodeSlotsProps) => {
  const { nodeId, slotId, slotType } = partialSlotData;
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const slotData: NodeSlot = {
      nodeId: nodeId!,
      slotId: slotId!,
      slotType: slotType!,
      el: ref.current,
    };
    registerNodeSlot(slotData);
  }, [nodeId, registerNodeSlot, slotType, slotId]);

  return (
    <div className="flex space-x-1 items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer mx-[-8px] connect-slot">
      <CircleDot ref={ref} size={16} className="bg-background rounded-full" />
      <p className="text-sm select-none">{name}</p>
    </div>
  );
};
interface OutputNodeSlotsProps {
  name: string;
  partialSlotData: Partial<NodeSlot>;
  registerNodeSlot: (slotData: NodeSlot) => void;
  startConnecting: (nodeId: string, slotId: number) => void;
}

const OutputSlot = ({
  name,
  partialSlotData,
  registerNodeSlot,
  startConnecting,
}: OutputNodeSlotsProps) => {
  const { nodeId, slotId, slotType } = partialSlotData;
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const slotData: NodeSlot = {
      nodeId: nodeId!,
      slotId: slotId!,
      slotType: slotType!,
      el: ref.current,
    };
    registerNodeSlot(slotData);
  }, [nodeId, registerNodeSlot, slotType, slotId]);

  return (
    <div
      className="flex space-x-1 justify-end items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer mx-[-8px] connect-slot"
      onMouseDown={() => startConnecting(nodeId!, slotId!)}
    >
      <p className="text-sm select-none">{name}</p>
      <CircleDot ref={ref} size={16} className="bg-background rounded-full" />
    </div>
  );
};
