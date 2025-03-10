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
import { X } from "lucide-react";
import FormContainer from "../global/FormContainer";
import { removePsetAction } from "@/utils/actions";
import { useParams } from "next/navigation";

const RemovePsetButton = ({ title }: { title: string }) => {
  const { id } = useParams();
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button
          variant="destructive"
          size="icon"
          className="place-items-end cursor-pointer ml-auto"
        >
          <X />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="capitalize">Remove {title}?</DialogTitle>
          <DialogDescription>
            You are about to remove Pset {title}, are you sure? There is no
            undo.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <FormContainer action={removePsetAction}>
            <input type="hidden" value={id} name="componentId" />
            <input type="hidden" value={title} name="psetTitle" />
            <Button type="submit">OK</Button>
          </FormContainer>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default RemovePsetButton;
