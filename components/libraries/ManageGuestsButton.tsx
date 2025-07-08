"use client";
import { useState } from "react";
import TooltipActionTriggerButton from "../componentList/TooltipActionTriggerButton";
import { Book, LoaderCircle, SquareLibrary, Users, X } from "lucide-react";
import {
  DialogHeader,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { useParams } from "next/navigation";
import { removeGuestAction } from "@/utils/actions/libraryActions";
import { useAppDispatch } from "@/lib/hooks";
import { fetchUserLibraries } from "@/lib/features/user/userSlice";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { LibraryInfoType } from "@/utils/types";
const ManageGuestsButton = ({
  guests,
  isComposite,
}: {
  guests: LibraryInfoType["guests"];
  isComposite: boolean;
}) => {
  const params = useParams();
  let libraryId: string;
  if (isComposite) {
    libraryId = params["compositeLibraryId"] as string;
  } else {
    libraryId = params["libraryId"] as string;
  }
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const dispatch = useAppDispatch();

  const removeGuestMutation = useMutation({
    mutationFn: ({
      libraryId,
      userId,
      isComposite,
    }: {
      libraryId: string;
      userId: string;
      isComposite: boolean;
    }) => {
      return removeGuestAction(libraryId, userId, isComposite);
    },
    meta: { invalidates: ["libraryComponents"] },
  });

  const handleRemove = async (userId: string) => {
    setPending(true);
    removeGuestMutation.mutate(
      { libraryId, userId, isComposite },
      {
        onSuccess: (result) => {
          toast(result.message);
        },
        onError: (error) => {
          toast(error.message);
        },
        onSettled: () => {
          setPending(false);
          dispatch(fetchUserLibraries());
        },
      },
    );
  };

  return (
    <>
      <TooltipActionTriggerButton
        action={setDialogOpen}
        disabled={false}
        pending={false}
        icon={<Users />}
        tooltip="Show Guests"
        destructive={false}
      />
      <Dialog
        open={dialogOpen}
        onOpenChange={() => {
          setDialogOpen(!dialogOpen);
        }}
      >
        <DialogContent
          onOpenAutoFocus={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle>Manage Guests</DialogTitle>
            <DialogDescription>
              See and remove users that can access this library.
            </DialogDescription>
          </DialogHeader>
          {guests.map((guest) => {
            return (
              <div key={guest.id} className="flex justify-between items-center">
                <div className="flex space-x-2">
                  <p>{guest.name}</p>
                  {!isComposite && (
                    <p className="flex">
                      <SquareLibrary className="ml-5 mr-2 w-5 h-5" />
                      {guest.numAuthoredCompositeLibraries}
                    </p>
                  )}
                  {isComposite && (
                    <p className="flex">
                      <Book className="ml-5 mr-2 w-5 h-5" />
                      {guest.numMergedLibraries}
                    </p>
                  )}
                  {/* TODO: Show number of libraries if in composite  */}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => handleRemove(guest.id)}
                >
                  {pending ? <LoaderCircle className="animate-spin" /> : <X />}
                </Button>
              </div>
            );
          })}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ManageGuestsButton;
