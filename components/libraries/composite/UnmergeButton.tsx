"use client";

import NameList from "@/components/componentList/NameList";
import TooltipActionTriggerButton from "@/components/componentList/TooltipActionTriggerButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SelectedComposite } from "@/utils/types";
import { BookX } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

const UnmergeButton = ({
  libraries,
  setSelection,
}: {
  libraries: SelectedComposite[];
  setSelection: Dispatch<SetStateAction<object>>;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const disabled = libraries.length === 0;
  return (
    <>
      <TooltipActionTriggerButton
        action={setDialogOpen}
        disabled={disabled}
        pending={pending}
        icon={<BookX />}
        tooltip="Unmerge"
        destructive={false}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              Unmerge {libraries.length}
              {libraries.length > 1 ? " libraries" : " library"} from current
              composite library.
            </DialogTitle>
            <DialogDescription>
              You are about to remove following libraries from current composite
              library:
              {/* <NameList components={libraries} /> */}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setDialogOpen(false);
                setPending(true);
              }}
              disabled={pending}
              className="w-30 mt-4"
            >
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UnmergeButton;
