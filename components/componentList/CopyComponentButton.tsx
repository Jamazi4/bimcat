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
import { selectedRow } from "@/utils/types";
import { toast } from "sonner";
import NameList from "./NameList";
import TooltipActionButton from "./TooltipActionButton";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { fetchUserLibraries } from "@/lib/features/user/userSlice";
import { Input } from "../ui/input";
import { useBrowserParams } from "@/utils/customHooks/useBrowserParams";
import { fetchBrowserComponents } from "@/lib/features/browser/componentBrowserSlice";

const CopyComponentButton = ({
  components,
  disabled,
  setSelection,
}: {
  components: selectedRow[];
  disabled: boolean;
  setSelection: Dispatch<SetStateAction<object>>;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [newName, setNewName] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const params = useBrowserParams();

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    setDialogOpen(false);
    setPending(true);

    const componentId = Object.keys(components[0])[0];
    const result = await copyComponentAction(componentId, newName);

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
