"use client";

import { Eraser } from "lucide-react";
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
import ComponentPrivateToggle from "./ComponentPrivateToggle";
import AddComponentToLibraryButton from "./AddComponentToLibraryButton";
import EreaseSelectionButton from "../global/EreaseSelectionButton";

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
  const anyComponentPrivate = components.some((component) => {
    return Object.values(component)[0].isPublic === false;
  });

  return (
    <div className="flex space-x-2">
      <AddComponentToLibraryButton
        anyComponentPrivate={anyComponentPrivate}
        components={components}
        disabled={noSelected}
        setSelection={setSelection}
      />
      <ComponentPrivateToggle
        components={components}
        disabled={noSelected || !onlyEditable}
        setSelection={setSelection}
      />
      <EreaseSelectionButton
        setSelection={setSelection}
        disabled={noSelected}
      />
      <RemoveComponentButton
        components={components}
        disabled={noSelected || !onlyEditable}
        setSelection={setSelection}
      />
    </div>
  );
};
export default BrowserActionButtons;
