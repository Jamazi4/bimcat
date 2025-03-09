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
import PsetEditInput from "./PsetEditInput";
import { updatePsetsAction } from "@/utils/actions";
import { useParams } from "next/navigation";
import FormContainer from "../global/FormContainer";
import { Plus } from "lucide-react";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Input } from "../ui/input";

function PsetDialog({
  content,
  title,
}: {
  content: PsetContent[];
  title: string;
}) {
  const { id } = useParams();

  const [curContent, setCurContent] = useState(content);

  const removePsetRow = (index: number) => {
    const updatedContent = curContent.filter((el, i) => !(i === index));
    setCurContent(updatedContent);
  };

  const addPsetRow = ({ key, value }: { key: string; value: string }) => {
    const updatedContent = [...curContent, { [key]: value }];
    setCurContent(updatedContent);
  };

  useEffect(() => {
    setCurContent(content);
  }, [content]);

  return (
    <Dialog
      onOpenChange={() => {
        setCurContent(content);
      }}
    >
      <DialogTrigger asChild>
        <Button size="icon" className="place-items-end cursor-pointer ml-auto">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] overflow-y-scroll max-h-screen">
        <FormContainer action={updatePsetsAction}>
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
              const [[name, value]] = Object.entries(entry);
              return (
                <div className="items-center gap-4" key={index}>
                  <Label htmlFor={name} className="mb-2">
                    <p className="text-sm text-secondary-foreground">{name}</p>
                  </Label>
                  <div className="flex gap-4">
                    {/* Custom inputs */}
                    <PsetEditInput value={value} name={name} />

                    {/* Remove button */}
                    <Button
                      className="cursor-pointer"
                      type="button"
                      size="icon"
                      variant="destructive"
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
            <Button type="submit">Save changes</Button>
          </DialogFooter>
        </FormContainer>
      </DialogContent>
    </Dialog>
  );
}

export default PsetDialog;

const AddRow = ({
  updateFunction,
}: {
  updateFunction: ({ key, value }: { key: string; value: string }) => void;
}) => {
  const [curKey, setCurKey] = useState("");
  const [curValue, setCurValue] = useState("");
  return (
    <Popover>
      <PopoverTrigger className="flex w-full bg-primary text-primary-foreground justify-center p-2 rounded-sm cursor-pointer hover:brightness-90">
        <Plus size={15} />
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
          }}
        >
          Add
        </Button>
      </PopoverContent>
    </Popover>
  );
};
