"use client";

import { Pencil } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useState } from "react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import FormContainer from "../global/FormContainer";
import { Input } from "../ui/input";
import SubmitButton from "../global/SubmitButton";
import { renameComponentAction } from "@/utils/actions/componentActions";

const RenameComponentButton = () => {
  const { id } = useParams() || "";
  const [open, setOpen] = useState(false);
  const handleSuccess = useCallback(() => {
    setOpen(false);
  }, []);
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className="flex w-full  ">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Pencil
                size={36}
                className="p-2.5 cursor-pointer rounded-md hover:bg-accent hover:text-accent-foreground"
              />
            </TooltipTrigger>
            <TooltipContent>Rename</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </PopoverTrigger>
      <PopoverContent className="bg-background w-100" align="center">
        <FormContainer action={renameComponentAction} onSuccess={handleSuccess}>
          <p>Enter new name</p>
          <div className="flex gap-2 mb-4 mt-4">
            <Input
              name="componentName"
              required={true}
              placeholder="Component name"
            />
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
export default RenameComponentButton;
