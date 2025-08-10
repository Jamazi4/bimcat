import { useState } from "react";
import { Slider } from "../ui/slider";

const DraggableNodeSliderInput = ({
  value,
  changeThisValue,
}: {
  value: number;
  changeThisValue: (value: number) => void;
}) => {
  const [curVal, setCurVal] = useState(String(value));

  const handleChange = (e: number[]) => {
    const val = e[0];

    setCurVal(String(val));
    changeThisValue(val);
  };
  return (
    <div className="h-12">
      <div className="absolute h-12 w-full p-4 flex space-x-1 items-center text-muted-foreground hover:text-primary transition-colors cursor-pointer connect-slot">
        <Slider
          value={[parseFloat(curVal)]}
          onValueChange={(e) => handleChange(e)}
          className={`"w-30 !text-2xl`}
        />
      </div>
    </div>
  );
};

export default DraggableNodeSliderInput;
