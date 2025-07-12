"use client";

import { useState } from "react";
import { Switch } from "../ui/switch";

const DraggableNodeInputBoolean = ({
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
      <div className="m-2 text-2xl">{displayName}</div>
    </div>
  );
};

export default DraggableNodeInputBoolean;
