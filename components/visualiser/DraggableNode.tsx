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
  useMemo,
  useRef,
  useState,
} from "react";
import {
  GeomNodeBackType,
  NodeEdgeType,
  NodeInputType,
  NodeSlot,
  SlotValues,
  backgroundColorClasses,
  fillColorClasses,
} from "@/utils/nodeTypes";
import { Switch } from "../ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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
      <div className="flex justify-center text-secondary border-b-1 rounded-tl-md rounded-tr-md font-bold select-none mx-2 py-2 text-xl">
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
              <InputGroup
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
                <ComboSlot
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
    <div className="h-12 w-30 flex space-x-1 items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer ml-2 connect-slot">
      <Switch checked={curVal} onCheckedChange={(e) => changeValue(e)} />
      <div className="m-2 text-lg">{displayName}</div>
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
    <div className="h-12 flex space-x-1 items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer ml-2 connect-slot">
      <Input
        type="text"
        value={curVal}
        onChange={(e) => handleChange(e)}
        className={`${!isValidValue && "text-destructive border-destructive"} w-30 !text-lg`}
      />
    </div>
  );
};

interface ComboNodeSlotProps {
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

const ComboSlot = ({
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
  const { nodeId, slotId, slotIO: slotType } = partialSlotData;
  const ref = useRef<SVGSVGElement>(null);

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
        className={`${!isValidValue && "text-destructive border-destructive"} w-30 !text-lg`}
        disabled={connected}
      />
      <p className="text-lg select-none ml-2">{name}</p>
    </div>
  );
};

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
}

const InputGroup = ({
  switchGroupInputActive,
  activeIndex,
  inputs,
  groupIndex,
  nodeId,
  registerNodeSlot,
  finishConnecting,
  getSlotRelativePosition,
  nodeRef,
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
        <SelectTrigger className="text-lg w-40">
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
      className="h-12 flex space-x-1 justify-end items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer mx-[-12px] connect-slot"
      onMouseDown={() => startConnecting(nodeId!, slotId!)}
    >
      <p className="text-lg select-none">{name}</p>
      <CircleDot
        ref={ref}
        size={24}
        className={`bg-background rounded-full ${fillColorClasses[slotValueType]} text-primary`}
      />
    </div>
  );
};
