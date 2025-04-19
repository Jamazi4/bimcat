import React, { Dispatch, SetStateAction } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Button } from "../ui/button";
import { Eraser } from "lucide-react";

const EreaseSelectionButton = ({
  disabled,
  setSelection,
}: {
  disabled: boolean;
  setSelection: Dispatch<SetStateAction<object>>;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            disabled={disabled}
            variant="ghost"
            className="text-destructive"
            onClick={() => {
              setSelection([]);
            }}
          >
            <Eraser />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Deselect</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default EreaseSelectionButton;
