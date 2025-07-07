"use client";

import { nodeDefinitions } from "@/utils/nodes";
import { CircleDot, CircleDotDashed } from "lucide-react";
import { Input } from "../ui/input";
import {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  GeomNodeBackType,
  NodeSlot,
  SlotValues,
  backgroundColorClasses,
  fillColorClasses,
} from "@/utils/nodeTypes";
import { Switch } from "../ui/switch";

interface DraggableNodeProps {
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
  finishConnecting: (nodeId: string, slotId: number, clear?: boolean) => void;
  nodeNavigation: boolean;
  getViewTransformScale: () => number;
  setNodeDivs: Dispatch<SetStateAction<Record<string, HTMLDivElement>>>;
}
const DraggableNode = memo(function DraggableNode({
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
}: DraggableNodeProps) {
  const nodeDef = nodeDefinitions.filter((def) => def.type === node.type)[0];
  const nodeRef = useRef<HTMLDivElement>(null);
  const changeThisNodeValues = changeNodeValue.bind(null, node.id);

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

  return (
    <div
      ref={nodeRef}
      style={{
        transform: `translate(${node.x}px, ${node.y}px)`,
        pointerEvents: `${nodeNavigation ? "auto" : "none"}`,
      }}
      className={`draggable-node w-50 min-h-15 bg-accent absolute z-20 border-2 rounded-lg transition-colors cursor-grab ${selected ? "border-primary" : "hover:border-primary "}`}
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
                  value={node.values[input.id] as number}
                  changeThisValue={changeThisValue}
                />
              );
            } else if (input.type === "boolean") {
              const changeThisValue = changeThisNodeValues.bind(null, input.id);
              if (!node.values) return;
              return (
                <InputBoolean
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
                <InputSlot
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
            }
          })}
        </div>

        {/* outputs */}
        <div>
          {nodeDef.outputs.map((output, i) => {
            const partialSlotData: Partial<NodeSlot> = {
              nodeId: node.id,
              slotId: output.id,
              slotIO: "output",
            };
            return (
              <OutputSlot
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

const InputBoolean = ({
  name,
  value,
  changeThisValue,
}: {
  name: string;
  value: boolean;
  changeThisValue: (value: boolean) => void;
}) => {
  const [curVal, setCurVal] = useState(value);

  const changeValue = (e: boolean) => {
    setCurVal(e);
    changeThisValue(e);
  };

  const displayName = name === "boolean" ? `${value}` : `${name}`;

  return (
    <div className="flex space-x-1 items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer ml-2 connect-slot">
      <Switch checked={curVal} onCheckedChange={(e) => changeValue(e)} />
      <div className="m-2 text-sm">{displayName}</div>
    </div>
  );
};

const InputNumber = ({
  value,
  changeThisValue,
}: {
  value: number;
  changeThisValue: (value: number) => void;
}) => {
  const [curVal, setCurVal] = useState(String(value));
  const [isValidValue, setIsValidValue] = useState(true);

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
  return (
    <div className="flex space-x-1 items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer ml-2 connect-slot">
      <Input
        type="text"
        value={curVal}
        onChange={(e) => handleChange(e)}
        className={isValidValue ? "" : "text-destructive border-destructive"}
      />
    </div>
  );
};

interface InputNodeSlotsProps {
  optional: boolean;
  slotValueType: SlotValues;
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
      className="flex space-x-1 items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer mx-[-8px] connect-slot"
      onMouseOver={() => finishConnecting(nodeId!, slotId!)}
      onMouseLeave={() => finishConnecting(nodeId!, slotId!, true)}
    >
      {!optional ? (
        <CircleDot
          ref={ref}
          size={16}
          className={`bg-background rounded-full ${fillColorClasses[slotValueType]} text-primary`}
        />
      ) : (
        <CircleDotDashed
          ref={ref}
          size={16}
          className={`bg-background rounded-full ${backgroundColorClasses[slotValueType]} text-primary`}
        />
      )}
      <p className="text-sm select-none">{name}</p>
    </div>
  );
};

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

const OutputSlot = ({
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
      className="flex space-x-1 justify-end items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer mx-[-8px] connect-slot"
      onMouseDown={() => startConnecting(nodeId!, slotId!)}
    >
      <p className="text-sm select-none">{name}</p>
      <CircleDot
        ref={ref}
        size={16}
        className={`bg-background rounded-full ${fillColorClasses[slotValueType]} text-primary`}
      />
    </div>
  );
};
