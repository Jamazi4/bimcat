"use client";

import { useEffect, useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface DraggableNodeSelectInputProps {
  switchSelectInputValue: (
    nodeId: string,
    inputId: number,
    activeValueId: number,
  ) => void;
  activeIndex: number;
  inputValues: string[];
  nodeId: string;
  inputId: number;
}
const DraggableNodeSelectInput = ({
  switchSelectInputValue,
  activeIndex,
  inputValues,
  nodeId,
  inputId,
}: DraggableNodeSelectInputProps) => {
  const nameIndexMap = inputValues.reduce(
    (acc, cur, id) => {
      acc[cur] = id;
      return acc;
    },
    {} as Record<string, number>,
  );

  const [selectedInput, setSelectedInput] = useState(
    inputValues.find((_, id) => id === activeIndex),
  );

  useEffect(() => {
    setSelectedInput(inputValues.find((_, id) => id === activeIndex));
  }, [activeIndex, inputValues]);

  if (!selectedInput) return;

  const handleChangeInputState = (value: string) => {
    const newActiveIndex = nameIndexMap[value];
    switchSelectInputValue(nodeId, inputId, newActiveIndex);
    setSelectedInput(value);
  };

  return (
    <div className="absolute left-1/2 top-0 transform -translate-x-1/2  z-10 pointer-events-auto">
      <div className="h-12 flex space-x-1 items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer connect-slot">
        <Select
          value={selectedInput}
          onValueChange={(value) => handleChangeInputState(value)}
        >
          <SelectTrigger className="text-2xl w-40">
            <SelectValue className="text-lg" />
          </SelectTrigger>
          <SelectContent
            defaultValue={inputValues[0]}
            onMouseDown={(e) => {
              e.stopPropagation();
            }}
          >
            {inputValues.map((i, id) => {
              return (
                <SelectItem value={i} key={`${nodeId}${id}select`}>
                  {i}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};
export default DraggableNodeSelectInput;
