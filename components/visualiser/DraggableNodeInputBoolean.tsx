"use client";

import { Label } from "../ui/label";
import { Switch } from "../ui/switch";

const DraggableNodeInputBoolean = ({
  name,
  value,
  changeThisValue,
  nodeId,
}: {
  name: string;
  value: boolean;
  changeThisValue: (value: boolean) => void;
  nodeId: string;
}) => {
  const changeValue = (e: boolean) => {
    changeThisValue(e);
  };

  const displayName = name === "boolean" ? `${value}` : `${name}`;

  return (
    <div className="h-12 w-30 flex space-x-1 items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer ml-2 connect-slot">
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
