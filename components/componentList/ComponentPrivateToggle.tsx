"use client";

import { toggleComponentPrivateAction } from "@/utils/actions/componentActions";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
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
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import WarningMessage from "../global/WarningMessage";
import { fetchUserLibraries } from "@/lib/features/user/userSlice";

function ComponentPrivateToggle({
  components,
  disabled,
  setSelection,
}: {
  components: selectedRow[];
  disabled: boolean;
  setSelection: Dispatch<SetStateAction<object>>;
}) {
  const userState = useSelector((state: RootState) => state.userSlice);
  const dispatch = useDispatch<AppDispatch>();

  const publicSelectedComponentIds = components.reduce<string[]>(
    (acc, component) => {
      const componentData = Object.values(component)[0];
      if (componentData.isPublic === true) {
        acc.push(Object.keys(component)[0]);
      }
      return acc;
    },
    []
  );

  const affectedPairs = userState.libraries.flatMap((library) => {
    if (!library.public) return [];

    return library.components
      .filter((component) => publicSelectedComponentIds.includes(component.id))
      .map((component) => ({
        library,
        componentId: component.id,
        componentName: component.name,
      }));
  });

  const affectedLibraryNames = [
    ...new Set(affectedPairs.map((pair) => pair.library.name)),
  ];
  const affectedComponentIds = affectedPairs.map((pair) => pair.componentId);

  const warningMessage = `Private components can not be inside public libraries. Continuing this action will remove highlighted components from following libraries: ${affectedLibraryNames.map(
    (libName) => ` ${libName}`
  )}.`;
  const warningMessageOn = affectedPairs.length > 0;
  const [displayWarning, setDisplayWarning] = useState(false);

  useEffect(() => {
    setDisplayWarning(warningMessageOn);
  }, [affectedPairs, warningMessageOn]);

  const componentIds = components.map((component) => Object.keys(component)[0]);
  const [dialogOpen, setDialogOpen] = useState(false);

  const togglePrivateActionWithId = toggleComponentPrivateAction.bind(
    null,
    componentIds
  );
  const [pending, setPending] = useState(false);

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
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
    dispatch(fetchUserLibraries());
    setPending(false);
  };

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
      <Dialog
        open={dialogOpen}
        onOpenChange={() => {
          setDialogOpen(!dialogOpen);
        }}
      >
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
              <NameList
                components={components}
                highlightDestructiveIds={affectedComponentIds}
              />
            </DialogDescription>
          </DialogHeader>
          {displayWarning && <WarningMessage message={warningMessage} />}
          <DialogFooter>
            <Button
              onClick={(e) => {
                handleClick(e);
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
