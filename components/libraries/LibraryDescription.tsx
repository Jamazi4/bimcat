"use client";

import { LibraryInfo } from "@/utils/types";
import { Button } from "../ui/button";
import { useMutation } from "@tanstack/react-query";
import { editLibraryDescriptionAction } from "@/utils/actions/libraryActions";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { DialogDescription } from "@radix-ui/react-dialog";
import { Textarea } from "../ui/textarea";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

const LibraryDescription = ({
  libraryInfo,
  libraryId,
}: {
  libraryInfo: LibraryInfo;
  libraryId: string;
}) => {
  const [description, setDescription] = useState(libraryInfo.desc);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);

  const renameMutation = useMutation({
    mutationFn: ({
      libraryId,
      newDescription,
    }: {
      libraryId: string;
      newDescription: string;
    }) => {
      return editLibraryDescriptionAction(libraryId, newDescription);
    },
    meta: { invalidates: ["libraryComponents"] },
  });

  const handleEdit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setPending(true);

    renameMutation.mutate(
      { libraryId, newDescription: description },
      {
        onSuccess: (result) => {
          toast(result.message);
        },
        onError: (error) => {
          toast(error.message);
        },
        onSettled: () => {
          setPending(false);
          setDialogOpen(false);
        },
      },
    );
  };

  return (
    <div className="mt-12">
      <h1 className="font-semibold mb-4">Description:</h1>
      <div className="flex flex-col items-end gap-y-2">
        <p className="w-full bg-accent text-muted-foreground rounded-sm p-2 ">
          {libraryInfo.desc}
        </p>
        {libraryInfo.isEditable && (
          <Dialog
            open={dialogOpen}
            onOpenChange={() => {
              setDialogOpen(!dialogOpen);
              setDescription(libraryInfo.desc);
            }}
          >
            <DialogTrigger asChild>
              <Button variant="outline">Edit</Button>
            </DialogTrigger>
            <DialogContent onInteractOutside={(e) => e.preventDefault()}>
              <DialogHeader>
                <DialogTitle className="mb-4">Edit Description</DialogTitle>
                <DialogDescription>
                  Provide new description below:
                  <Textarea
                    className="mt-4"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></Textarea>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button
                  onClick={(e) => {
                    handleEdit(e);
                  }}
                  disabled={pending}
                  className="w-30 mt-4"
                >
                  {pending ? (
                    <LoaderCircle className="animate-spin" />
                  ) : (
                    "Accept"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default LibraryDescription;
