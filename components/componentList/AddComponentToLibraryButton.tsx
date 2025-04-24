"use client";

import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import {
  DialogHeader,
  DialogFooter,
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { addComponentToLibraryAction } from "@/utils/actions/libraryActions";
import {
  BookUp,
  Check,
  ChevronsUpDown,
  FolderDot,
  LoaderCircle,
} from "lucide-react";
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
import NameList from "./NameList";
import TooltipActionButton from "./TooltipActionButton";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchUserLibraries } from "@/lib/features/user/userSlice";
import WarningMessage from "../global/WarningMessage";
import InfoMessage from "../global/InfoMessage";

const AddComponentToLibraryButton = ({
  components,
  disabled,
  setSelection,
  anyComponentPrivate,
}: {
  components: selectedRow[];
  disabled: boolean;
  setSelection?: Dispatch<SetStateAction<object>>;
  anyComponentPrivate: boolean;
}) => {
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

  const handleClick = async (
    e: React.MouseEvent<HTMLButtonElement, MouseEvent>
  ) => {
    e.stopPropagation();
    setDialogOpen(false);
    setPending(true);

    const result = await addComponentToLibraryAction(componentIds, libraryId);

    if (result.message) {
      toast(result.message);
      if (setSelection) {
        setSelection([]);
      }
      setLibraryId("");
      setDisplayInfo(false);
      setDisplayAlert(false);
    } else {
      toast("Something went wrong");
    }

    dispatch(fetchUserLibraries());
    setPending(false);
  };

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
            <DialogTitle>Add to library.</DialogTitle>
            <DialogDescription>
              <span>Pick library for:</span>
              <NameList
                components={components}
                highlightDestructiveIds={highlightDestructiveIds}
                highlightedConstructiveIds={highlightConstructiveIds}
              />
            </DialogDescription>
          </DialogHeader>
          <LibraryList
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
                handleClick(e);
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

const LibraryList = ({
  setValue,
  value,
  setDisplayAlert,
  setDisplayInfo,
  componentIds,
  anyComponentPrivate,
  setHighlighConstructiveIds,
}: {
  setValue: Dispatch<SetStateAction<string>>;
  setDisplayAlert: Dispatch<SetStateAction<boolean>>;
  setDisplayInfo: Dispatch<SetStateAction<boolean>>;
  value: string;
  componentIds: string[];
  anyComponentPrivate: boolean;
  setHighlighConstructiveIds: Dispatch<SetStateAction<string[]>>;
}) => {
  const [open, setOpen] = useState(false);

  type libraryListPosition = {
    value: string;
    label: string;
    isPublic: boolean;
    componentIds: string[];
  };

  const userState = useSelector((state: RootState) => state.userSlice);

  const librariesContaining = userState.libraries.map((library) => {
    const componentIdsInside = library.components.map(
      (component) => component.id
    );
    let found = false;
    for (const id of componentIds) {
      if (componentIdsInside.includes(id)) {
        found = true;
      }
    }
    if (found) return library.id;
  });

  const libraries: libraryListPosition[] = userState.libraries.map((lib) => {
    return {
      value: lib.id,
      label: lib.name,
      isPublic: lib.public,
      componentIds: lib.components.map((comp) => comp.id),
    };
  });

  const onSelect = (currentValue: string) => {
    const selectedLibrary = libraries.find(
      (lib) => lib.label === currentValue
    )!;

    const selectedLibraryPublic = selectedLibrary.isPublic!;
    const displayAlertFlag = selectedLibraryPublic && anyComponentPrivate;

    const alreadyInside = librariesContaining.includes(selectedLibrary?.value);

    if (alreadyInside) {
      if (!selectedLibrary) return;
      setHighlighConstructiveIds(selectedLibrary?.componentIds);
    } else {
      setHighlighConstructiveIds([]);
    }

    setDisplayInfo(alreadyInside);
    setDisplayAlert(displayAlertFlag);
    setValue(selectedLibrary ? selectedLibrary.value : "");
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
              {libraries.map((library) => {
                const highlight = librariesContaining.includes(library.value);
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
                        value === library.value ? "opacity-100" : "opacity-0"
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
