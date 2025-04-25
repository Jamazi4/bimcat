import { SelectedRow } from "@/utils/types";
import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "../ui/button";
import { BookX } from "lucide-react";
import TooltipActionTriggerButton from "../componentList/TooltipActionTriggerButton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import NameList from "../componentList/NameList";
import { toast } from "sonner";
import { removeComponentFromLibraryAction } from "@/utils/actions/libraryActions";
import { useParams } from "next/navigation";

const RemoveFromLibraryActionButton = ({
  components,
  setSelection,
}: {
  components: SelectedRow[];
  setSelection: Dispatch<SetStateAction<object>>;
}) => {
  const { libraryId } = useParams<{ libraryId: string }>();

  const componentIds = components.map((component) => Object.keys(component)[0]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const disabled = components.length === 0;

  return (
    <>
      <TooltipActionTriggerButton
        action={setDialogOpen}
        disabled={disabled}
        pending={pending}
        icon={<BookX />}
        tooltip="Remove from library"
        destructive={false}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              Remove {components.length} component
              {components.length > 1 ? "s" : ""} from current library.
            </DialogTitle>
            <DialogDescription>
              You are about to remove following components from current library:
              <NameList components={components} />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={async (e) => {
                e.stopPropagation();
                setDialogOpen(false);
                setPending(true);

                const result = await removeComponentFromLibraryAction(
                  componentIds,
                  libraryId
                );

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
              Accept
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RemoveFromLibraryActionButton;
