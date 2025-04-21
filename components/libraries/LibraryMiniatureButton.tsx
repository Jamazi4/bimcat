"use client";

import { Button } from "../ui/button";
import { useState } from "react";
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
import WarningMessage from "../global/WarningMessage";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { fetchUserLibraries } from "@/lib/features/user/userSlice";

type LibraryMiniatureButtonProps = {
  libraryId: string;
  title: string;
  message: string;
  action: (libraryId: string) => Promise<{ message: string }>;
  icon: React.ReactNode;
  destructive: boolean;
  tooltip: string;
  warningMessage?: string;
};
const LibraryMiniatureButton = ({
  libraryId,
  title,
  message,
  action,
  icon,
  destructive,
  tooltip,
  warningMessage,
}: LibraryMiniatureButtonProps) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const handleAction = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    e.preventDefault();
    setDialogOpen(false);
    setPending(true);

    const result = await action(libraryId);

    if (result.message) {
      toast(result.message);
    } else {
      toast("Something went wrong");
    }

    dispatch(fetchUserLibraries());
    setPending(false);
  };
  return (
    <>
      <TooltipActionButton
        action={setDialogOpen}
        disabled={false}
        pending={pending}
        icon={icon}
        tooltip={tooltip}
        destructive={destructive}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{message}</DialogDescription>
          </DialogHeader>
          {warningMessage && <WarningMessage message={warningMessage} />}
          <DialogFooter>
            <Button
              onClick={handleAction}
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

export default LibraryMiniatureButton;
