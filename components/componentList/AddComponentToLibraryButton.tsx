"use client";

import { Dispatch, SetStateAction, useState } from "react";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { addComponentToLibraryAction } from "@/utils/actions";
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
import { selectedRow } from "@/utils/types";
import { toast } from "sonner";
import { AiOutlineReload } from "react-icons/ai";
import NameList from "./NameList";
import TooltipActionButton from "./TooltipActionButton";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store";

const AddComponentToLibraryButton = ({
  components,
  disabled,
  setSelection,
}: {
  components: selectedRow[];
  disabled: boolean;
  setSelection: Dispatch<SetStateAction<object>>;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [libraryId, setLibraryId] = useState("");
  const [pending, setPending] = useState(false);

  const componentIds = components.map((component) => Object.keys(component)[0]);

  return (
    <>
      <TooltipActionButton
        action={setDialogOpen}
        disabled={disabled}
        pending={pending}
        icon={<BookUp />}
        tooltip="Add to library"
        destructive={false}
      />
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Add to library.</DialogTitle>
            <DialogDescription>
              <span>Pick library for:</span>
              <NameList components={components} />
            </DialogDescription>
          </DialogHeader>
          <LibraryList setValue={setLibraryId} value={libraryId} />
          <DialogFooter>
            <Button
              onClick={async (e) => {
                e.stopPropagation();
                setDialogOpen(false);
                setPending(true);

                const result = await addComponentToLibraryAction(
                  componentIds,
                  libraryId
                );

                if (result.message) {
                  toast(result.message);
                  setSelection([]);
                } else {
                  toast("Something went wrong");
                }

                setPending(false);
              }}
              disabled={pending}
              className="w-30 mt-4"
            >
              {pending ? (
                <AiOutlineReload className="animate-spin" />
              ) : (
                "Accept"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AddComponentToLibraryButton;

const LibraryList = ({
  setValue,
  value,
}: {
  setValue: Dispatch<SetStateAction<string>>;
  value: string;
}) => {
  const [open, setOpen] = useState(false);

  type libraryListPosition = {
    value: string;
    label: string;
  };

  const libraries: libraryListPosition[] = useSelector(
    (state: RootState) => state.userSlice
  ).libraries.map((lib) => {
    return {
      value: lib.id,
      label: lib.name,
    };
  });

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
