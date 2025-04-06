"use client";

import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import FormContainer from "../global/FormContainer";
import SubmitButton from "../global/SubmitButton";
import { Button } from "../ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { deleteComponentAction } from "@/utils/actions";
import { Trash } from "lucide-react";

function ComponentDeleteButton({
  componentId,
  componentName,
}: {
  componentId: string;
  componentName: string;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const removeActionWithId = deleteComponentAction.bind(null, componentId);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-destructive cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setDialogOpen(true);
            }}
          >
            <Trash />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Remove</TooltipContent>
      </Tooltip>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Remove {componentName}</DialogTitle>
            <DialogDescription>
              You are about to remove your component, there is no undo
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <FormContainer
              action={removeActionWithId}
              onSuccess={() => setDialogOpen(false)}
            >
              <SubmitButton />
            </FormContainer>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

export default ComponentDeleteButton;
