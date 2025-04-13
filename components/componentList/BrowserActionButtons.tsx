"use client";

import { BookUp, EyeIcon, Eraser } from "lucide-react";
import { Button } from "../ui/button";
import { Dispatch, SetStateAction } from "react";
import RemoveComponentButton from "./RemoveComponentButton";
import { selectedRow } from "@/utils/types";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";

const BrowserActionButtons = ({
  components,
  setSelection,
}: {
  components: selectedRow[];
  setSelection: Dispatch<SetStateAction<object>>;
}) => {
  const noSelected = components.length === 0;
  const onlyEditable = components.every(
    (component) => Object.values(component)[0].editable
  );

  return (
    <div className="flex space-x-2">
      <Button variant="ghost" disabled={noSelected}>
        <BookUp />
      </Button>
      <Button variant="ghost" disabled={noSelected || !onlyEditable}>
        <EyeIcon />
      </Button>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              disabled={noSelected}
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
      <RemoveComponentButton
        components={components}
        disabled={noSelected || !onlyEditable}
        setSelection={setSelection}
      />
    </div>
  );
};
export default BrowserActionButtons;
