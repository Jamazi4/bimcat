"use client";

import { Dispatch, SetStateAction, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BookPlus,
  Check,
  ChevronsUpDown,
  FolderDot,
  LoaderCircle,
} from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { useMutation } from "@tanstack/react-query";
import { mergeLibraryAction } from "@/utils/actions/libraryActions";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { fetchUserLibraries } from "@/lib/features/user/userSlice";
import InfoMessage from "@/components/global/InfoMessage";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const MergeLibraryButton = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [libraryId, setLibraryId] = useState("");
  const [displayInfo, setDisplayInfo] = useState(false);
  const { compositeLibraryId } = useParams<{ compositeLibraryId: string }>();
  const dispatch = useAppDispatch();
  const infoMessage =
    "Selected library is already merged with this composite library, this action will take no effect.";

  const mergeMutation = useMutation({
    mutationFn: ({
      libraryId,
      compositeId,
    }: {
      libraryId: string;
      compositeId: string;
    }) => {
      return mergeLibraryAction(compositeId, libraryId);
    },
    meta: { invalidates: ["compositeLibrary"] },
  });

  const handleMerge = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setPending(true);

    mergeMutation.mutate(
      { libraryId, compositeId: compositeLibraryId },
      {
        onSuccess: (result) => {
          toast(result.message);
          setLibraryId("");
          dispatch(fetchUserLibraries());
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
    <Dialog
      open={dialogOpen}
      onOpenChange={() => {
        setDialogOpen(!dialogOpen);
      }}
    >
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="cursor-pointer"
                onClick={() => setDialogOpen(true)}
                disabled={pending}
              >
                {pending ? (
                  <LoaderCircle className="animate-spin" />
                ) : (
                  <BookPlus />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Merge</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Merge Library</DialogTitle>
          <DialogDescription>
            <span>Pick library to merge:</span>
          </DialogDescription>
        </DialogHeader>
        <MergableList
          setDisplayInfo={setDisplayInfo}
          compositeLibraryId={compositeLibraryId}
          setLibraryId={setLibraryId}
          libraryId={libraryId}
        />
        {displayInfo && <InfoMessage message={infoMessage} />}
        <DialogFooter>
          <Button
            onClick={(e) => {
              handleMerge(e);
              setDialogOpen(false);
            }}
            disabled={pending}
            className="w-30 mt-4"
          >
            {pending ? <LoaderCircle className="animate-spin" /> : "Accept"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default MergeLibraryButton;

const MergableList = ({
  setLibraryId,
  setDisplayInfo,
  libraryId,
  compositeLibraryId,
}: {
  setLibraryId: Dispatch<SetStateAction<string>>;
  setDisplayInfo: Dispatch<SetStateAction<boolean>>;
  libraryId: string;
  compositeLibraryId: string;
}) => {
  const stateLibraries = useAppSelector((state) => state.userSlice).libraries;
  const curCompositeLibrary = stateLibraries.find(
    (lib) => lib.id === compositeLibraryId,
  );

  const [open, setOpen] = useState(false);
  const libraries = stateLibraries
    .filter((lib) => (lib.isEditable || lib.isFavorite) && !lib.isComposite)
    .map((lib) => {
      return {
        value: lib.id,
        label: lib.name,
        isPublic: lib.isPublic,
        content: lib.content,
      };
    });

  const alreadyInsideIds = curCompositeLibrary?.content.map((lib) => lib.id);

  const onSelect = (currentValue: string) => {
    const selectedLibrary = libraries.find((lib) => lib.label === currentValue);
    const selectedId = selectedLibrary ? selectedLibrary.value : "";
    setLibraryId(selectedId);
    setDisplayInfo(alreadyInsideIds?.includes(selectedId) || false);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {libraryId
            ? libraries.find((lib) => lib.value === libraryId)?.label
            : "Select a library"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search library..." />
          <CommandList>
            <CommandEmpty>No libraries found.</CommandEmpty>
            <CommandGroup>
              {libraries.map((library) => {
                const highlight = alreadyInsideIds?.includes(library.value);

                return (
                  <CommandItem
                    className="w-90"
                    key={library.value}
                    value={library.label}
                    onSelect={(currentValue) => onSelect(currentValue)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        libraryId === library.value
                          ? "opacity-100"
                          : "opacity-0",
                      )}
                    />
                    {library.label}
                    {highlight && <FolderDot className="absolute right-2" />}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
