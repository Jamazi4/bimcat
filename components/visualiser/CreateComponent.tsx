"use client";
import { Dispatch, SetStateAction, useCallback, useState } from "react";
import { MenubarItem } from "../ui/menubar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { createComponentAction } from "@/utils/actions/componentActions";
import FormContainer from "../global/FormContainer";
import SubmitButton from "../global/SubmitButton";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import { Pset } from "@/utils/schemas";
import { ComponentGeometry } from "@/utils/types";

const CreateComponent = ({
  disabled,
  setNodeMode,
}: {
  disabled: boolean;
  setNodeMode: Dispatch<SetStateAction<boolean>>;
}) => {
  // const handleCreateComponent = () => {
  //   setNodeMode(true);
  // };
  const [open, setOpen] = useState(false);
  const geometry: ComponentGeometry[] = [];
  const psets: Pset[] = [];

  const handleSuccess = useCallback(() => {
    setOpen(false);
    setNodeMode(true);
  }, [setNodeMode]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <MenubarItem disabled={disabled} onSelect={(e) => e.preventDefault()}>
          Create
        </MenubarItem>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload component to BimCAT:</DialogTitle>
          <DialogDescription>
            Please provide a name for the component.
          </DialogDescription>
        </DialogHeader>
        <FormContainer action={createComponentAction} onSuccess={handleSuccess}>
          <Label htmlFor="name">
            <p className="text-sm text-secondary-foreground">Component Name</p>
          </Label>
          <Input name="name" id="name"></Input>
          <div className="flex mt-4 space-x-2">
            <Checkbox name="makePrivate" id="makePrivate" />
            <Label htmlFor="makePrivate">Make private</Label>
          </div>
          {geometry && (
            <input
              type="hidden"
              name="geometry"
              value={JSON.stringify(geometry)}
            />
          )}
          {psets && (
            <input type="hidden" name="psets" value={JSON.stringify(psets)} />
          )}
          <input type="hidden" name="useNodes" value={"true"} />
          <DialogFooter>
            <SubmitButton />
          </DialogFooter>
        </FormContainer>
      </DialogContent>
    </Dialog>
  );
};

export default CreateComponent;
