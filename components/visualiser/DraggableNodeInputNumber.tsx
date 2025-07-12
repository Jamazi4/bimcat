import { useState } from "react";
import { Input } from "../ui/input";

const DraggableNodeInputNumber = ({
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

export default DraggableNodeInputNumber;
