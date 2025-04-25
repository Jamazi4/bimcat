"use client";

import { Dispatch, SetStateAction } from "react";
import RemoveComponentButton from "./RemoveComponentButton";
import { SelectedRow } from "@/utils/types";
import ComponentPrivateToggle from "./ComponentPrivateToggle";
import AddComponentToLibraryButton from "./AddComponentToLibraryButton";
import EreaseSelectionButton from "../global/EreaseSelectionButton";
import CopyComponentButton from "./CopyComponentButton";

const BrowserActionButtons = ({
  components,
  setSelection,
}: {
  components: SelectedRow[];
  setSelection: Dispatch<SetStateAction<object>>;
}) => {
  const noSelected = components.length === 0;
  const oneSelected = components.length === 1;
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
        disabled={noSelected || !onlyEditable}
        setSelection={setSelection}
      />
      <ComponentPrivateToggle
        components={components}
        disabled={noSelected || !onlyEditable}
        setSelection={setSelection}
      />
      <CopyComponentButton
        components={components}
        disabled={!oneSelected}
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
