"use client";

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import type { PsetContent } from "@/utils/types";
import { Pencil } from "lucide-react";
import { updatePsetsAction } from "@/utils/actions";
import { useParams } from "next/navigation";
import FormContainer from "../global/FormContainer";
import { Plus } from "lucide-react";
import { X } from "lucide-react";
import { useCallback, useState } from "react";
import { Input } from "../ui/input";
import { useFormStatus } from "react-dom";
import { AiOutlineReload } from "react-icons/ai";

function PsetEditDialog({
  content,
  title,
}: {
  content: PsetContent[];
  title: string;
}) {
  const { id } = useParams();

  const [curContent, setCurContent] = useState(content);
  const [open, setOpen] = useState(false);

  const removePsetRow = (index: number) => {
    setCurContent((prevContent) => prevContent.filter((_, i) => i !== index));
  };

  const addPsetRow = ({ key, value }: { key: string; value: string }) => {
    if (!key) return;
    setCurContent((prevContent) => [...prevContent, { [key]: value }]);
  };

  const updatePsetValue = (index: number, newValue: string) => {
    setCurContent((prevContent) => {
      const updatedContent = [...prevContent];
      const key = Object.keys(updatedContent[index])[0];
      updatedContent[index] = { [key]: newValue };
      return updatedContent;
    });
  };

  const handleSuccess = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Dialog
      open={open}
      onOpenChange={(newState) => {
        setOpen(newState);
        setCurContent(content);
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="place-items-end cursor-pointer ml-auto"
        >
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-y-scroll max-h-screen">
        <FormContainer action={updatePsetsAction} onSuccess={handleSuccess}>
          {/* Metadata for backend queries */}

          <input type="hidden" value={id} name="componentId" />
          <input type="hidden" value={title} name="psetTitle" />
          <DialogHeader>
            <DialogTitle className="capitalize">Editing {title}</DialogTitle>
            <DialogDescription>
              Make changes to component properties. Click save when you are
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Map over content */}

            {curContent.map((entry, index) => {
              const name = Object.keys(entry)[0];
              const value = entry[name];
              return (
                <div className="items-center gap-4" key={index}>
                  <Label htmlFor={name} className="mb-2">
                    <p className="text-sm text-secondary-foreground">{name}</p>
                  </Label>
                  <div className="flex gap-4">
                    {/* Inputs */}

                    <div className="flex-grow">
                      <Input
                        id={name}
                        name={name}
                        value={value}
                        onChange={(e) => updatePsetValue(index, e.target.value)}
                      />
                    </div>

                    {/* Remove button */}
                    <Button
                      className="cursor-pointer text-destructive"
                      type="button"
                      size="icon"
                      variant="outline"
                      onClick={() => {
                        removePsetRow(index);
                      }}
                    >
                      <X />
                    </Button>
                  </div>
                </div>
              );
            })}
            {/* Add row */}

            <AddRow updateFunction={addPsetRow} />
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </FormContainer>
      </DialogContent>
    </Dialog>
  );
}

export default PsetEditDialog;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-30 cursor-pointer">
      {pending ? <AiOutlineReload className="animate-spin" /> : "Save Changes"}
    </Button>
  );
}

const AddRow = ({
  updateFunction,
}: {
  updateFunction: ({ key, value }: { key: string; value: string }) => void;
}) => {
  const [curKey, setCurKey] = useState("");
  const [curValue, setCurValue] = useState("");
  const [open, setOpen] = useState(false);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex w-full  justify-center rounded-sm cursor-pointer hover:brightness-90">
        <Button
          asChild
          size="icon"
          variant="outline"
          className="w-full cursor-pointer p-2 m-0"
        >
          <Plus className="h-9 w-8" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-background w-100" align="center">
        <div className="flex gap-2 mb-4">
          <Input
            value={curKey}
            onChange={(e) => {
              setCurKey(e.target.value);
            }}
            placeholder="key"
          />
          :
          <Input
            value={curValue}
            onChange={(e) => {
              setCurValue(e.target.value);
            }}
            placeholder="value"
          />
        </div>
        <Button
          type="button"
          className="w-full ml-auto"
          onClick={() => {
            updateFunction({ key: curKey, value: curValue });
            setCurKey("");
            setCurValue("");
            setOpen(false);
          }}
        >
          Add
        </Button>
      </PopoverContent>
    </Popover>
  );
};
