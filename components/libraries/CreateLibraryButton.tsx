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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import SubmitButton from "../global/SubmitButton";
import FormContainer from "../global/FormContainer";
import { createLibraryAction } from "@/utils/actions";
import { useState } from "react";
const CreateLibraryButton = () => {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="default" className="cursor-pointer">
          Create
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create Library</DialogTitle>
          <DialogDescription>
            Provide a name and a short description for your new library.
          </DialogDescription>
        </DialogHeader>
        <FormContainer
          action={createLibraryAction}
          onSuccess={() => {
            setOpen(!open);
          }}
        >
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input id="name" name="name" className="col-span-4" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                className="col-span-4"
              />
            </div>
            <div className="flex space-x-2">
              <Checkbox name="makePrivate" id="makePrivate" />
              <Label htmlFor="makePrivate" className="text-right">
                Make private
              </Label>
            </div>
          </div>
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </FormContainer>
      </DialogContent>
    </Dialog>
  );
};
export default CreateLibraryButton;
