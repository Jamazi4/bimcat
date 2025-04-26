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
import { copyComponentAction } from "@/utils/actions/componentActions";
import { Copy } from "lucide-react";
import { SelectedRow } from "@/utils/types";
import { toast } from "sonner";
import NameList from "./NameList";
import TooltipActionTriggerButton from "./TooltipActionTriggerButton";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { fetchUserLibraries } from "@/lib/features/user/userSlice";
import { Input } from "../ui/input";
import { useMutation, useQueryClient } from "@tanstack/react-query";

const CopyComponentButton = ({
  components,
  disabled,
  setSelection,
}: {
  components: SelectedRow[];
  disabled: boolean;
  setSelection: Dispatch<SetStateAction<object>>;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [newName, setNewName] = useState("");
  const dispatch = useDispatch<AppDispatch>();

  const copyComponentMutation = useMutation({
    mutationFn: ({
      componentId,
      newName,
    }: {
      componentId: string;
      newName: string;
    }) => {
      return copyComponentAction(componentId, newName);
    },
    meta: { invalidates: ["componentBrowser"] },
  });

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    setDialogOpen(false);
    setPending(true);

    const componentId = Object.keys(components[0])[0];

    copyComponentMutation.mutate(
      {
        componentId,
        newName,
      },
      {
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
      }
    );
  };
  return (
    <>
      <TooltipActionTriggerButton
        action={setDialogOpen}
        disabled={disabled}
        pending={pending}
        icon={<Copy />}
        tooltip="Copy"
        destructive={false}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Copy component</DialogTitle>
            <DialogDescription>
              <span className="flex flex-col space-y-2">
                You are about to copy:
                <NameList components={components} />
                <span>Please provide a new name for your copy:</span>
                <Input
                  required
                  className="mt-2"
                  placeholder="New name"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </span>
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
};
export default CopyComponentButton;
