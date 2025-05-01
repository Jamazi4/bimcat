import { RootState } from "@/lib/store";
import { Dispatch, SetStateAction, useState } from "react";
import { useSelector } from "react-redux";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Check, ChevronsUpDown, FolderDot } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "../ui/command";
import { cn } from "@/lib/utils";
const DialogLibraryList = ({
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
      (component) => component.id,
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
      isPublic: lib.isPublic,
      componentIds: lib.components.map((comp) => comp.id),
    };
  });

  const onSelect = (currentValue: string) => {
    const selectedLibrary = libraries.find(
      (lib) => lib.label === currentValue,
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
                        value === library.value ? "opacity-100" : "opacity-0",
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
export default DialogLibraryList;
