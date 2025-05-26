"use client";
import { useState } from "react";
import TooltipActionTriggerButton from "../componentList/TooltipActionTriggerButton";
import { LoaderCircle, SquareLibrary, Users, X } from "lucide-react";
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
}: {
  guests: LibraryInfoType["guests"];
}) => {
  const { libraryId } = useParams<{ libraryId: string }>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const dispatch = useAppDispatch();

  const removeGuestMutation = useMutation({
    mutationFn: ({
      libraryId,
      userId,
    }: {
      libraryId: string;
      userId: string;
    }) => {
      return removeGuestAction(libraryId, userId);
    },
    meta: { invalidates: ["libraryComponents"] },
  });

  const handleRemove = async (userId: string) => {
    setPending(true);
    removeGuestMutation.mutate(
      { libraryId, userId },
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
                  <p className="flex">
                    - {guest.numAuthoredCompositeLibraries}
                    <SquareLibrary className="ml-2 w-5 h-5" />
                  </p>
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
