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
import { addPsetAction } from "@/utils/actions/componentActions";
import FormContainer from "../global/FormContainer";
import { useCallback, useState } from "react";
import SubmitButton from "../global/SubmitButton";

const AddPsetButton = () => {
  const { id } = useParams() || "";
  const [open, setOpen] = useState(false);
  const handleSuccess = useCallback(() => {
    setOpen(false);
  }, []);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex w-full  ">
        <Button
          asChild
          className="flex w-full justify-center rounded-sm cursor-pointer"
          variant="outline"
        >
          <Plus size={15} className="" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="bg-background w-100" align="center">
        <FormContainer action={addPsetAction} onSuccess={handleSuccess}>
          <p>Creating new Pset, please enter name:</p>
          <div className="flex gap-2 mb-4 mt-4">
            <Input name="psetTitle" required={true} placeholder="Pset name" />
            <input type="hidden" name="componentId" value={id} />
          </div>
          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </FormContainer>
      </PopoverContent>
    </Popover>
  );
};
export default AddPsetButton;
