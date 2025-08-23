"use client";

import { useEffect } from "react";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

const DraggableNodeInputBoolean = ({
  removeEdgeToSlot,
  dependentInputId,
  name,
  value,
  changeThisValue,
  nodeId,
}: {
  removeEdgeToSlot: (toNodeId: string, toSlotId: number) => void;
  dependentInputId?: number;
  name: string;
  value: boolean;
  changeThisValue: (value: boolean) => void;
  nodeId: string;
}) => {
  const changeValue = (e: boolean) => {
    changeThisValue(e);
  };

  const displayName = name === "boolean" ? `${value}` : `${name}`;

  useEffect(() => {
    if (dependentInputId !== undefined && value === false) {
      removeEdgeToSlot(nodeId, dependentInputId);
    }
  }, [dependentInputId, nodeId, removeEdgeToSlot, value]);

  return (
    <div className="h-12 w-50 flex space-x-1 items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer ml-2 connect-slot text-2xl">
      <Switch
        id={`${nodeId}-${name}`}
        checked={value}
        onCheckedChange={(e) => changeValue(e)}
      />
      <div className="m-2 text-2xl">
        <Label className="text-2xl" htmlFor={`${nodeId}-${name}`}>
          {displayName}
        </Label>
      </div>
    </div>
  );
};

export default DraggableNodeInputBoolean;
