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
import { useFormStatus } from "react-dom";
import { AiOutlineReload } from "react-icons/ai";

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
            <SubmitButton />
          </FormContainer>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
export default RemovePsetButton;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-30">
      {pending ? <AiOutlineReload className="animate-spin" /> : "OK"}
    </Button>
  );
}
