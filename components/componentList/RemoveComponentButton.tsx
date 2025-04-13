"use client";

import { Dispatch, SetStateAction, useState } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
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
import { selectedRow } from "@/utils/types";
import { AiOutlineReload } from "react-icons/ai";
import { toast } from "sonner";

function RemoveComponentButton({
  components,
  disabled,
  setSelection,
}: {
  components: selectedRow[];
  disabled: boolean;
  setSelection: Dispatch<SetStateAction<object>>;
}) {
  const componentIds = components.map((component) => Object.keys(component)[0]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const removeActionWithId = deleteComponentAction.bind(null, componentIds);
  const [pending, setPending] = useState(false);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            disabled={disabled}
            size="icon"
            variant="ghost"
            className="text-destructive cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setDialogOpen(true);
            }}
          >
            {pending ? (
              <AiOutlineReload className="animate-spin w-10 h-10" />
            ) : (
              <Trash />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>Remove</TooltipContent>
      </Tooltip>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              Remove {components.length} component
              {components.length > 1 ? "s" : ""}
            </DialogTitle>
            <DialogDescription>
              You are about to remove:
              {components.map((component) => {
                return (
                  <span
                    className="flex font-semibold "
                    key={Object.keys(component)[0]}
                  >
                    {`- ${Object.values(component)[0].name}`}
                  </span>
                );
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={async (e) => {
                e.stopPropagation();
                setDialogOpen(false);
                setPending(true);

                const result = await removeActionWithId();

                if (result.message) {
                  toast(result.message);
                  setSelection([]);
                } else {
                  toast("Something went wrong");
                }

                setPending(false); // Reset spinner
              }}
              disabled={pending}
              className="w-30 mt-4"
            >
              {pending ? (
                <AiOutlineReload className="animate-spin" />
              ) : (
                "Accept"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

export default RemoveComponentButton;
