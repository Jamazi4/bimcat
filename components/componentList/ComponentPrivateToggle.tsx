"use client";

import { toggleComponentPrivateAction } from "@/utils/actions/componentActions";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import { Eye, LoaderCircle } from "lucide-react";
import { Button } from "../ui/button";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { SelectedRow } from "@/utils/types";
import { toast } from "sonner";
import NameList from "./NameList";
import TooltipActionTriggerButton from "./TooltipActionTriggerButton";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import WarningMessage from "../global/WarningMessage";
import { fetchUserLibraries } from "@/lib/features/user/userSlice";
import { useMutation } from "@tanstack/react-query";

function ComponentPrivateToggle({
  components,
  disabled,
  setSelection,
}: {
  components: SelectedRow[];
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
  const [pending, setPending] = useState(false);

  const toggleComponentPrivateMutation = useMutation({
    mutationFn: (componentIds: string[]) => {
      return toggleComponentPrivateAction(componentIds);
    },
    meta: { invalidates: ["componentBrowser"] },
  });

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    setDialogOpen(false);
    setPending(true);

    toggleComponentPrivateMutation.mutate(componentIds, {
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
              {pending ? <LoaderCircle className="animate-spin" /> : "Accept"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default ComponentPrivateToggle;
