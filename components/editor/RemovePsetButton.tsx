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
import { useCallback, useState } from "react";

const RemovePsetButton = ({ title }: { title: string }) => {
  const [open, setOpen] = useState(false);
  const { id } = useParams();

  const handleSuccess = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          className="place-items-end cursor-pointer ml-auto text-destructive"
        >
          <X />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <FormContainer action={removePsetAction} onSuccess={handleSuccess}>
          <DialogHeader>
            <DialogTitle className="capitalize">Remove {title}?</DialogTitle>
            <DialogDescription>
              You are about to remove Pset {title}, are you sure? There is no
              undo.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <input type="hidden" value={id} name="componentId" />
            <input type="hidden" value={title} name="psetTitle" />
            <SubmitButton />
          </DialogFooter>
        </FormContainer>
      </DialogContent>
    </Dialog>
  );
};
export default RemovePsetButton;

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-30 cursor-pointer">
      {pending ? <AiOutlineReload className="animate-spin" /> : "Save Changes"}
    </Button>
  );
}
