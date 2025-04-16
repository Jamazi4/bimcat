"use client";

import { toggleComponentPrivateAction } from "@/utils/actions";
import { Dispatch, SetStateAction, useState } from "react";
import { Eye } from "lucide-react";
import { Button } from "../ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { selectedRow } from "@/utils/types";
import { AiOutlineReload } from "react-icons/ai";
import { toast } from "sonner";
import NameList from "./NameList";
import TooltipActionButton from "./TooltipActionButton";

function ComponentPrivateToggle({
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
  const togglePrivateActionWithId = toggleComponentPrivateAction.bind(
    null,
    componentIds
  );
  const [pending, setPending] = useState(false);

  return (
    <>
      <TooltipActionButton
        action={setDialogOpen}
        disabled={disabled}
        pending={pending}
        icon={<Eye />}
        tooltip="Toggle Private"
        destructive={false}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent
          onInteractOutside={(e) => e.preventDefault()}
          className="p-6"
        >
          <DialogHeader>
            <DialogTitle>
              Toggle private for {components.length} component
              {components.length > 1 ? "s" : ""}
            </DialogTitle>
            <DialogDescription>
              You are about to invert &quot;private&quot; property for:
              <NameList components={components} />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={async (e) => {
                e.stopPropagation();
                setDialogOpen(false);
                setPending(true);

                const result = await togglePrivateActionWithId();

                if (result.message) {
                  toast(result.message);
                  setSelection([]);
                } else {
                  toast("Something went wrong");
                }

                setPending(false);
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
    </>
  );
}

export default ComponentPrivateToggle;
