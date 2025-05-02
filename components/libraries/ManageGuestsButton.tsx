"use client";
import { useState } from "react";
import TooltipActionTriggerButton from "../componentList/TooltipActionTriggerButton";
import { LoaderCircle, Users, X } from "lucide-react";
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
const ManageGuestsButton = ({
  guests,
}: {
  guests: { name: string; id: string }[];
}) => {
  const { libraryId } = useParams<{ libraryId: string }>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const handleRemove = async (userId: string) => {
    setPending(true);
    await removeGuestAction(libraryId, userId);
    setPending(false);
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
              <div key={guest.id} className="flex space-x-2 items-center">
                <p>{guest.name}</p>
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
