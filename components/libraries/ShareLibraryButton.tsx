"use client";

import { Copy, LoaderCircle, Share2 } from "lucide-react";
import TooltipActionTriggerButton from "../componentList/TooltipActionTriggerButton";
import { useState } from "react";
import { useParams } from "next/navigation";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { useMutation } from "@tanstack/react-query";
import {
  disableShareLibraryAction,
  shareLibraryAction,
} from "@/utils/actions/libraryActions";
import { toast } from "sonner";

const ShareLibraryButton = ({
  sharedId,
  isComposite,
}: {
  sharedId: string;
  isComposite: boolean;
}) => {
  const basePath = window.location.origin + "/libraries/share";
  //TODO: might break, move window statement to useEffect for example

  const params = useParams();

  let libraryId: string;
  if (isComposite) {
    libraryId = params["compositeLibraryId"] as string;
  } else {
    libraryId = params["libraryId"] as string;
  }
  const searchParams = new URLSearchParams();
  searchParams.set("isComposite", isComposite.toString());
  const [shareUrl, setShareUrl] = useState(
    sharedId ? `${basePath}/${sharedId}?${searchParams.toString()}` : "",
  );

  const [isShared, setIsShared] = useState(!!sharedId);

  const [dialogOpen, setDialogOpen] = useState(false);

  const shareLibraryMutation = useMutation({
    mutationFn: (libraryId: string) => {
      return shareLibraryAction(libraryId, isComposite);
    },
  });

  const disableShareLibraryMutation = useMutation({
    mutationFn: (libraryId: string) => {
      return disableShareLibraryAction(libraryId, isComposite);
    },
  });

  if (typeof libraryId !== "string") {
    return <div>Invalid library ID</div>;
  }

  const pending =
    shareLibraryMutation.isPending || disableShareLibraryMutation.isPending;

  const handleGenerate = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation();

    shareLibraryMutation.mutate(libraryId, {
      onSuccess: (result) => {
        setShareUrl(`${basePath}/${result}?${searchParams.toString()}`);
        setIsShared(true);
        toast("Generated private share link.");
      },
      onError: (error) => {
        toast(error.message);
      },
    });
  };

  const handleDisable = (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    e.stopPropagation();

    disableShareLibraryMutation.mutate(libraryId, {
      onSuccess: (result) => {
        setShareUrl("");
        setIsShared(false);
        toast(result.message);
      },
      onError: (error) => {
        toast(error.message);
      },
      onSettled: () => {},
    });
  };

  return (
    <>
      <TooltipActionTriggerButton
        action={setDialogOpen}
        disabled={false}
        pending={false}
        icon={<Share2 />}
        tooltip="Share Library"
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
            <DialogTitle>Share Library.</DialogTitle>
            <DialogDescription>
              <span>
                {isShared ? "Copy the link below" : "Generate a new link"}
              </span>
            </DialogDescription>
          </DialogHeader>
          <div className="flex">
            <Input className="rounded-r-none" value={shareUrl} readOnly></Input>
            <Button
              variant="outline"
              className="rounded-l-none"
              disabled={!isShared}
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
                toast("Link copied to clipboard!");
              }}
            >
              <Copy />
            </Button>
          </div>

          <DialogFooter>
            {isShared ? (
              <Button
                disabled={pending}
                variant="destructive"
                className="w-30 mt-4"
                onClick={(e) => {
                  handleDisable(e);
                }}
              >
                {pending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Disable Link"
                )}
              </Button>
            ) : (
              <Button
                onClick={(e) => {
                  handleGenerate(e);
                }}
                disabled={pending}
                className="w-30 mt-4"
                autoFocus
              >
                {pending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  "Generate"
                )}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
export default ShareLibraryButton;
