"use client";

import { Trash, BookUp, EyeIcon, Eraser } from "lucide-react";
import { Button } from "../ui/button";
import { useDispatch } from "react-redux";
import { clearBrowserSelection } from "@/lib/features/browser/componentBrowserSlice";

const BrowserActionButtons = () => {
  const dispatch = useDispatch();
  return (
    <div className="flex space-x-2">
      {" "}
      <Button variant="outline">
        <BookUp />
      </Button>
      <Button variant="outline">
        <EyeIcon />
      </Button>
      <Button
        variant="outline"
        className="text-destructive"
        onClick={() => {
          dispatch(clearBrowserSelection());
        }}
      >
        <Eraser />
      </Button>
      <Button variant="outline" className="text-destructive">
        <Trash />
      </Button>
    </div>
  );
};
export default BrowserActionButtons;
