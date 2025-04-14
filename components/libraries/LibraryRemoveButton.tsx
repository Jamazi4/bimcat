"use client";

import { Trash } from "lucide-react";
import { Button } from "../ui/button";
import { useState } from "react";
import { deleteLibraryAction } from "@/utils/actions";
import { toast } from "sonner";
import TooltipActionButton from "../componentList/TooltipActionButton";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";

const LibraryRemoveButton = ({
  libraryId,
  libraryName,
}: {
  libraryId: string;
  libraryName: string;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handleRemove = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setDialogOpen(false);
    setPending(true);

    const result = await deleteLibraryAction(libraryId);

    if (result.message) {
      toast(result.message);
    } else {
      toast("Something went wrong");
    }

    setPending(false);
  };
  return (
    <>
      <TooltipActionButton
        action={setDialogOpen}
        disabled={false}
        pending={pending}
        icon={<Trash />}
        tooltip="Remove"
        destructive={true}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Remove {libraryName}</DialogTitle>
            <DialogDescription>
              You are about to remove library: {libraryName}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={handleRemove}
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

export default LibraryRemoveButton;
