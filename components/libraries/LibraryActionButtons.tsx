"use client";

import { SelectedRow } from "@/utils/types";
import { Dispatch, SetStateAction } from "react";
import RemoveFromLibraryActionButton from "./RemoveFromLibraryActionButton";
import EreaseSelectionButton from "../global/EreaseSelectionButton";

const LibraryActionButtons = ({
  components,
  setSelection,
}: {
  components: SelectedRow[];
  setSelection: Dispatch<SetStateAction<object>>;
}) => {
  const noSelected = components.length === 0;
  return (
    <div className="flex space-x-2">
      {" "}
      <RemoveFromLibraryActionButton
        components={components}
        setSelection={setSelection}
      />
      <EreaseSelectionButton
        setSelection={setSelection}
        disabled={noSelected}
      />
    </div>
  );
};
export default LibraryActionButtons;
