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
import FormContainer from "./FormContainer";
import { Input } from "../ui/input";
import SubmitButton from "./SubmitButton";
import { useAppDispatch } from "@/lib/hooks";
import { fetchUserLibraries } from "@/lib/features/user/userSlice";

export type RenameButtonProps = {
  action: (
    prevState: unknown,
    formData: FormData,
  ) => Promise<{
    message: string;
  }>;
  curName: string;
};

const RenameButtonTitleBar = (props: RenameButtonProps) => {
  const { action, curName } = props;
  const params = useParams() || "";
  const id = Object.values(params)[0];
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(curName);
  const dispatch = useAppDispatch();
  const handleSuccess = useCallback(() => {
    dispatch(fetchUserLibraries());
    setOpen(false);
    // TODO: solve with mutation
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        <FormContainer action={action} onSuccess={handleSuccess}>
          <p>Enter new name</p>
          <div className="flex gap-2 mb-4 mt-4">
            <Input
              onChange={(e) => setValue(e.target.value)}
              value={value}
              name="newName"
              required={true}
              placeholder="Component name"
            />
            <input type="hidden" name="id" value={id} />
          </div>
          <div className="flex justify-end">
            <SubmitButton />
          </div>
        </FormContainer>
      </PopoverContent>
    </Popover>
  );
};
export default RenameButtonTitleBar;
