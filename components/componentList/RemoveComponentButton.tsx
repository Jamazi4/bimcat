"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "../ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { deleteComponentAction } from "@/utils/actions/componentActions";
import { Trash } from "lucide-react";
import { SelectedRow } from "@/utils/types";
import { toast } from "sonner";
import NameList from "./NameList";
import TooltipActionTriggerButton from "./TooltipActionTriggerButton";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { fetchUserLibraries } from "@/lib/features/user/userSlice";
import { useMutation } from "@tanstack/react-query";

function RemoveComponentButton({
  components,
  disabled,
  setSelection,
}: {
  components: SelectedRow[];
  disabled: boolean;
  setSelection: Dispatch<SetStateAction<object>>;
}) {
  const componentIds = components.map((component) => Object.keys(component)[0]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const dispatch = useDispatch<AppDispatch>();

  const deleteComponentMutation = useMutation({
    mutationFn: (componentIds: string[]) => {
      return deleteComponentAction(componentIds);
    },
    meta: { invalidates: ["componentBrowser"] },
  });

  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.stopPropagation();
    setDialogOpen(false);
    setPending(true);

    deleteComponentMutation.mutate(componentIds, {
      onSuccess: (result) => {
        toast(result.message);
        setSelection([]);
        dispatch(fetchUserLibraries());
      },
      onError: (error) => {
        toast(error.message);
      },
      onSettled: () => {
        setPending(false);
      },
    });
  };

  return (
    <>
      <TooltipActionTriggerButton
        action={setDialogOpen}
        disabled={disabled}
        pending={pending}
        icon={<Trash />}
        tooltip="Remove"
        destructive={true}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              Remove {components.length} component
              {components.length > 1 ? "s" : ""}
            </DialogTitle>
            <DialogDescription>
              You are about to remove:
              <NameList components={components} />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={(e) => {
                handleClick(e);
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
}

export default RemoveComponentButton;
