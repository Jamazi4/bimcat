"use client";

import { toggleComponentPrivateAction } from "@/utils/actions";
import { useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import { Eye, EyeOff } from "lucide-react";
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

function ComponentPrivateToggle({
  componentId,
  componentName,
  componentPublic,
}: {
  componentId: string;
  componentName: string;
  componentPublic: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const togglePrivateActionWithId = toggleComponentPrivateAction.bind(
    null,
    componentId
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setDialogOpen(true);
            }}
          >
            {componentPublic ? <Eye /> : <EyeOff />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {componentPublic ? "Public" : "Private"}
        </TooltipContent>
      </Tooltip>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Toggle public status {componentName}</DialogTitle>
            <DialogDescription>
              You are about to change {componentName} to be{" "}
              {componentPublic ? "private" : "public"}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <FormContainer
              action={togglePrivateActionWithId}
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

export default ComponentPrivateToggle;
