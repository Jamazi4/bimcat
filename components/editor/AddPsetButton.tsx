"use client";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Plus } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useParams } from "next/navigation";
import { addPsetAction } from "@/utils/actions";
import FormContainer from "../global/FormContainer";
import { useFormStatus } from "react-dom";
import { useState } from "react";

const AddPsetButton = () => {
  const { id } = useParams() || "";
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex w-full bg-primary text-primary-foreground justify-center p-2 rounded-sm cursor-pointer hover:brightness-90 mb-4 mt-4">
        <Plus size={15} />
      </PopoverTrigger>
      <PopoverContent className="bg-background w-100" align="center">
        <FormContainer
          action={addPsetAction}
          onSuccess={() => {
            setOpen(false);
          }}
        >
          <div className="flex gap-2 mb-4 mt-4">
            <Input name="psetTitle" required={true} placeholder="Pset name" />
            <input type="hidden" name="componentId" value={id} />
          </div>
          <SubmitButton />
        </FormContainer>
      </PopoverContent>
    </Popover>
  );
};
export default AddPsetButton;

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" className="w-full" disabled={pending}>
      Add
    </Button>
  );
}
