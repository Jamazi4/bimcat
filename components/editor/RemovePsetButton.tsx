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
import { removePsetAction } from "@/utils/actions/componentActions";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import SubmitButton from "../global/SubmitButton";
const RemovePsetButton = ({ title }: { title: string }) => {
  const [open, setOpen] = useState(false);
  const params = useParams();
  const componentId = params["id"] ?? params["componentId"];

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
            <input type="hidden" value={componentId} name="componentId" />
            <input type="hidden" value={title} name="psetTitle" />
            <SubmitButton />
          </DialogFooter>
        </FormContainer>
      </DialogContent>
    </Dialog>
  );
};
export default RemovePsetButton;
