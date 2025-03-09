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
import { Label } from "@/components/ui/label";
import type { PsetContent } from "@/utils/types";
import { Pencil } from "lucide-react";
import PsetEditInput from "./PsetEditInput";
import { updatePsetsAction } from "@/utils/actions";
import { useParams } from "next/navigation";
import FormContainer from "../global/FormContainer";

function PsetDialog({
  content,
  title,
}: {
  content: PsetContent[];
  title: string;
}) {
  const { id } = useParams();
  console.log(id);
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="icon" className="place-items-end cursor-pointer ml-auto">
          <Pencil />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <FormContainer action={updatePsetsAction}>
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
            {content.map((entry, index) => {
              const [[name, value]] = Object.entries(entry);
              return (
                <div className="items-center gap-4" key={index}>
                  <Label htmlFor={name} className="mb-2">
                    <p className="text-sm text-secondary-foreground">{name}</p>
                  </Label>
                  <PsetEditInput value={value} name={name} />
                </div>
              );
            })}
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
