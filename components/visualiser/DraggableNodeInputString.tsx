import { useState } from "react";
import { Input } from "../ui/input";

const DraggableNodeInputString = ({
  value,
  changeThisValue,
}: {
  value: string;
  changeThisValue: (value: string) => void;
}) => {
  const [curVal, setCurVal] = useState(String(value));

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCurVal(val);
    changeThisValue(val);
    console.log("changed");
  };
  return (
    <div className="h-12 w-60">
      <div className="absolute h-12 w-full flex space-x-1 items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer p-4 connect-slot">
        <Input
          type="text"
          value={curVal}
          onChange={(e) => handleChange(e)}
          placeholder="control name"
          className={`w-full !text-2xl`}
        />
      </div>
    </div>
  );
};

export default DraggableNodeInputString;
