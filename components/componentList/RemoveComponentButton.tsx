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
import { selectedRow } from "@/utils/types";
import { toast } from "sonner";
import NameList from "./NameList";
import TooltipActionButton from "./TooltipActionButton";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { fetchUserLibraries } from "@/lib/features/user/userSlice";
import { useBrowserParams } from "@/utils/customHooks/useBrowserParams";
import { fetchBrowserComponents } from "@/lib/features/browser/componentBrowserSlice";

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
  const dispatch = useDispatch<AppDispatch>();
  const params = useBrowserParams();

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
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

    dispatch(fetchBrowserComponents(params));
    dispatch(fetchUserLibraries());
    setPending(false);
  };

  return (
    <>
      <TooltipActionButton
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
