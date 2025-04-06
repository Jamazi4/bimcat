"use client";

import { Dispatch, SetStateAction, useEffect, useState } from "react";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import FormContainer from "../global/FormContainer";
import SubmitButton from "../global/SubmitButton";
import {
  addComponentToLibraryAction,
  getUserLibrariesAction,
} from "@/utils/actions";
import {
  TooltipTrigger,
  Tooltip,
  TooltipProvider,
  TooltipContent,
} from "../ui/tooltip";
import { BookUp, Check, ChevronsUpDown } from "lucide-react";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";
import { Input } from "../ui/input";

type libraryListPosition = {
  value: string;
  label: string;
};

const AddComponentToLibraryButton = ({
  componentId,
  componentName,
}: {
  componentId: string;
  componentName: string;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [libraryId, setLibraryId] = useState("");

  const [userLibraries, setUserLibraries] = useState<libraryListPosition[]>([]);

  useEffect(() => {
    const fetchLibraries = async () => {
      const libraries = await getUserLibrariesAction();
      if (!libraries) return; //TODO: handle
      const libraryListPositions = libraries.map((lib) => {
        return {
          value: lib.id,
          label: lib.name,
        };
      });
      setUserLibraries(libraryListPositions);
    };
    fetchLibraries();
  }, [dialogOpen]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setDialogOpen(true);
            }}
          >
            <BookUp />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add to library</TooltipContent>
      </Tooltip>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Add {componentName} to library.</DialogTitle>
            <DialogDescription>
              Pick one of your libraries from the list below:
            </DialogDescription>
          </DialogHeader>
          <LibraryList
            setValue={setLibraryId}
            value={libraryId}
            libraries={userLibraries}
          />
          <DialogFooter>
            <FormContainer
              action={addComponentToLibraryAction}
              onSuccess={() => setDialogOpen(false)}
            >
              <Input
                type="hidden"
                value={libraryId}
                name="libraryId"
                id="libraryId"
              />
              <Input
                type="hidden"
                value={componentId}
                name="componentId"
                id="componentId"
              />
              <SubmitButton />
            </FormContainer>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

export default AddComponentToLibraryButton;

const LibraryList = ({
  setValue,
  value,
  libraries,
}: {
  setValue: Dispatch<SetStateAction<string>>;
  value: string;
  libraries: libraryListPosition[];
}) => {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {value
            ? libraries.find((library) => library.value === value)?.label
            : "Select library..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search library..." />
          <CommandList>
            <CommandEmpty>No library found.</CommandEmpty>
            <CommandGroup>
              {libraries.map((library) => (
                <CommandItem
                  key={library.value}
                  value={library.label}
                  onSelect={(currentValue) => {
                    const selectedLibrary = libraries.find(
                      (lib) => lib.label === currentValue
                    );
                    setValue(selectedLibrary ? selectedLibrary.value : "");
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === library.value ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {library.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
};
