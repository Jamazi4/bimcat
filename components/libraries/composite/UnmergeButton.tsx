"use client";

import TooltipActionTriggerButton from "@/components/componentList/TooltipActionTriggerButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchUserLibraries } from "@/lib/features/user/userSlice";
import { useAppDispatch } from "@/lib/hooks";
import { unmergeLibraryAction } from "@/utils/actions/libraryActions";
import { SelectedComposite } from "@/utils/types";
import { useMutation } from "@tanstack/react-query";
import { BookX } from "lucide-react";
import { useParams } from "next/navigation";
import { Dispatch, SetStateAction, useState } from "react";
import { toast } from "sonner";

const UnmergeButton = ({
  libraries,
  setSelection,
}: {
  libraries: SelectedComposite[];
  setSelection: Dispatch<SetStateAction<object>>;
}) => {
  const dispatch = useAppDispatch();
  const { compositeLibraryId } = useParams<{ compositeLibraryId: string }>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const disabled = libraries.length === 0;

  const libraryIds = libraries.map((lib) => Object.keys(lib)[0]);

  const unmergeMutation = useMutation({
    mutationFn: ({
      libraryIds,
      compositeId,
    }: {
      libraryIds: string[];
      compositeId: string;
    }) => {
      return unmergeLibraryAction(libraryIds, compositeId);
    },
    meta: { invalidates: ["libraryBrowser", "compositeLibrary"] },
  });

  return (
    <>
      <TooltipActionTriggerButton
        action={setDialogOpen}
        disabled={disabled}
        pending={pending}
        icon={<BookX />}
        tooltip="Unmerge"
        destructive={true}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>
              Unmerge {libraries.length}
              {libraries.length > 1 ? " libraries" : " library"} from current
              composite library.
            </DialogTitle>
            <DialogDescription>
              This action will remove selected libraries from current composite
              library.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                setDialogOpen(false);
                setPending(true);

                unmergeMutation.mutate(
                  {
                    libraryIds,
                    compositeId: compositeLibraryId,
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
                    onSettled: () => setPending(false),
                  },
                );
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

export default UnmergeButton;
