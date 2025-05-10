"use client";

import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { addComponentToLibraryAction } from "@/utils/actions/libraryActions";
import { BookUp, LoaderCircle } from "lucide-react";
import { Button } from "../ui/button";
import { SelectedRow } from "@/utils/types";
import { toast } from "sonner";
import NameList from "./NameList";
import TooltipActionTriggerButton from "./TooltipActionTriggerButton";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { fetchUserLibraries } from "@/lib/features/user/userSlice";
import WarningMessage from "../global/WarningMessage";
import InfoMessage from "../global/InfoMessage";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import DialogLibraryList from "./DialogLibraryList";

const AddComponentToLibraryButton = ({
  components,
  disabled,
  setSelection,
  anyComponentPrivate,
}: {
  components: SelectedRow[];
  disabled: boolean;
  setSelection?: Dispatch<SetStateAction<object>>;
  anyComponentPrivate: boolean;
}) => {
  const queryClient = useQueryClient();
  const dispatch = useDispatch<AppDispatch>();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [libraryId, setLibraryId] = useState("");
  const [pending, setPending] = useState(false);
  const [highlightDestructiveIds, setHighlightDestructiveIds] = useState<
    string[]
  >([]);
  const [highlightConstructiveIds, setHighlighConstructiveIds] = useState<
    string[]
  >([]);

  const [displayAlert, setDisplayAlert] = useState(false);
  const alertMessage = `Highlighted components are private, while the selected library is public.
        Continuing this action will cause the components to automatically switch
        to public.`;

  const [displayInfo, setDisplayInfo] = useState(false);
  const infoMessage = `Highlighted components are already in selected library.`;

  const privateComponentIds = useMemo(() => {
    return components.reduce<string[]>((acc, component) => {
      const isPublic = Object.values(component)[0].isPublic;
      if (!isPublic) acc.push(Object.keys(component)[0]);
      return acc;
    }, []);
  }, [components]);

  useEffect(() => {
    setHighlightDestructiveIds(displayAlert ? privateComponentIds : []);
    if (!displayInfo) {
      setHighlighConstructiveIds([]);
    }
  }, [displayAlert, displayInfo, privateComponentIds]);

  const componentIds = components.map((component) => Object.keys(component)[0]);

  const addComponentToLibraryMutation = useMutation({
    mutationFn: ({
      componentIds,
      libraryId,
    }: {
      componentIds: string[];
      libraryId: string;
    }) => {
      return addComponentToLibraryAction(componentIds, libraryId);
    },
    meta: { invalidates: ["componentBrowser"] },
  });
  const handleAdd = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setDialogOpen(false);
    setPending(true);

    addComponentToLibraryMutation.mutate(
      { componentIds, libraryId },
      {
        onSuccess: (result) => {
          toast(result.message);
          if (setSelection) {
            setSelection([]);
          }
          setLibraryId("");
          setDisplayInfo(false);
          setDisplayAlert(false);
          dispatch(fetchUserLibraries());
          queryClient.invalidateQueries({ queryKey: ["componentBrowser"] });
        },
        onError: (error) => {
          toast(error.message);
        },
        onSettled: () => {
          setPending(false);
        },
      },
    );
  };

  return (
    <>
      <TooltipActionTriggerButton
        action={setDialogOpen}
        disabled={disabled}
        pending={pending}
        icon={<BookUp />}
        tooltip="Add to Library"
        destructive={false}
      />
      <Dialog
        open={dialogOpen}
        onOpenChange={() => {
          setDialogOpen(!dialogOpen);
          setDisplayAlert(false);
          setDisplayInfo(false);
          setLibraryId("");
        }}
      >
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Add to Library.</DialogTitle>
            <DialogDescription>
              <span>Pick library for:</span>
              <NameList
                components={components}
                highlightDestructiveIds={highlightDestructiveIds}
                highlightedConstructiveIds={highlightConstructiveIds}
              />
            </DialogDescription>
          </DialogHeader>
          <DialogLibraryList
            setHighlighConstructiveIds={setHighlighConstructiveIds}
            anyComponentPrivate={anyComponentPrivate}
            setValue={setLibraryId}
            setDisplayAlert={setDisplayAlert}
            setDisplayInfo={setDisplayInfo}
            value={libraryId}
            componentIds={componentIds}
          />
          {displayAlert && <WarningMessage message={alertMessage} />}
          {displayInfo && <InfoMessage message={infoMessage} />}
          <DialogFooter>
            <Button
              onClick={(e) => {
                handleAdd(e);
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
};

export default AddComponentToLibraryButton;
