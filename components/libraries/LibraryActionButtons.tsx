"use client";

import { BookX, Eraser } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { clearLibrarySelection } from "@/lib/features/libraries/libraryBrowserSlice";

const LibraryActionButtons = () => {
  const dispatch = useDispatch();
  return (
    <div className="flex space-x-2">
      {" "}
      <Button variant="outline">
        <BookX />
      </Button>
      <Button
        variant="outline"
        className="text-destructive"
        onClick={() => {
          dispatch(clearLibrarySelection());
        }}
      >
        <Eraser />
      </Button>
    </div>
  );
};
export default LibraryActionButtons;
