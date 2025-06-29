"use client";

import { nodeDefinitions } from "@/utils/nodes";
import { GeomNodeBackType } from "@/utils/schemas";
import { CircleDot } from "lucide-react";
import { Input } from "../ui/input";
import { useCallback, useEffect, useRef, useState } from "react";
import { NodeSlot } from "@/utils/customHooks/useNodeSystem";

interface GeometryNodeProps {
  node: GeomNodeBackType;
  startDraggingNode: (nodeId: string, e: React.MouseEvent) => void;
  changeNodeValue: (nodeId: string, inputId: number, value: string) => void;
  registerNodeSlot: (slotData: NodeSlot) => void;
  startConnecting: (nodeId: string, slotId: number) => void;
  finishConnecting: (nodeId: string, slotId: number, clear?: boolean) => void;
  nodeNavigation: boolean;
  viewTransform: { x: number; y: number; scale: number };
}
const DraggableNode = ({
  node,
  startDraggingNode,
  changeNodeValue,
  registerNodeSlot,
  startConnecting,
  finishConnecting,
  nodeNavigation,
  viewTransform,
}: GeometryNodeProps) => {
  const nodeDef = nodeDefinitions.filter((def) => def.type === node.type)[0];
  const nodeRef = useRef<HTMLDivElement>(null);
  const changeThisNodeValues = changeNodeValue.bind(null, node.id);

  const getSlotRelativePosition = useCallback(
    (
      nodeRef: React.RefObject<HTMLDivElement>,
      slotRef: React.RefObject<SVGSVGElement>,
    ) => {
      const nodeRect = nodeRef.current.getBoundingClientRect();
      const slotRect = slotRef.current.getBoundingClientRect();
      const relativeX =
        (slotRect.left + slotRect.width / 2 - nodeRect.left) /
        viewTransform.scale;
      const relativeY =
        (slotRect.top + slotRect.height / 2 - nodeRect.top) /
        viewTransform.scale;

      return { relativeX, relativeY };
    },
    [viewTransform],
  );

  return (
    <div
      ref={nodeRef}
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
        pointerEvents: `${nodeNavigation ? "auto" : "none"}`,
      }}
      className={`draggable-node w-50 min-h-15 bg-accent absolute z-20 border-2 rounded-lg hover:border-primary transition-colors cursor-grab`}
      onMouseDown={(e) => {
        if ((e.target as HTMLDivElement).closest(".connect-slot")) return;
        startDraggingNode(node.id, e);
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
        <div>
          {nodeDef.outputs.map((output, i) => {
            const partialSlotData: Partial<NodeSlot> = {
              nodeId: node.id,
              slotId: output.id,
              slotType: "output",
            };
            return (
              <OutputSlot
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
  finishConnecting: (nodeId: string, slotId: number, clear?: boolean) => void;
  nodeRef: React.RefObject<HTMLDivElement>;
  getSlotRelativePosition: (
    nodeRef: React.RefObject<HTMLDivElement>,
    slotRef: React.RefObject<SVGSVGElement>,
  ) => {
    relativeX: number;
    relativeY: number;
  };
}

const InputSlot = ({
  name,
  partialSlotData,
  registerNodeSlot,
  finishConnecting,
  getSlotRelativePosition,
  nodeRef,
}: InputNodeSlotsProps) => {
  const { nodeId, slotId, slotType } = partialSlotData;
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
      slotType: slotType!,
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
      className="flex space-x-1 items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer mx-[-8px] connect-slot"
      onMouseOver={() => finishConnecting(nodeId!, slotId!)}
      onMouseLeave={() => finishConnecting(nodeId!, slotId!, true)}
    >
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
  nodeRef: React.RefObject<HTMLDivElement>;
  getSlotRelativePosition: (
    nodeRef: React.RefObject<HTMLDivElement>,
    slotRef: React.RefObject<SVGSVGElement>,
  ) => {
    relativeX: number;
    relativeY: number;
  };
}

const OutputSlot = ({
  name,
  partialSlotData,
  registerNodeSlot,
  startConnecting,
  nodeRef,
  getSlotRelativePosition,
}: OutputNodeSlotsProps) => {
  const { nodeId, slotId, slotType } = partialSlotData;
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
      slotType: slotType!,
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
      className="flex space-x-1 justify-end items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer mx-[-8px] connect-slot"
      onMouseDown={() => startConnecting(nodeId!, slotId!)}
    >
      <p className="text-sm select-none">{name}</p>
      <CircleDot ref={ref} size={16} className="bg-background rounded-full" />
    </div>
  );
};
