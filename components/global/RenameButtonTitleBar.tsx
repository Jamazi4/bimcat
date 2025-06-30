"use client";

import { LoaderCircle, Pencil } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
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
import { Input } from "../ui/input";
import { useAppDispatch } from "@/lib/hooks";
import { fetchUserLibraries } from "@/lib/features/user/userSlice";
import { useMutation } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { toast } from "sonner";

export type RenameButtonProps = {
  action: (
    newName: string,
    id: string,
    isComposite?: boolean,
  ) => Promise<{
    message: string;
  }>;
  curName: string;
  isComposite?: boolean;
  isComponent: boolean;
};

const RenameButtonTitleBar = ({
  curName,
  isComposite,
  action,
}: RenameButtonProps) => {
  const params = useParams() || "";
  const paramValues = Object.values(params);
  const id = paramValues[paramValues.length - 1] as string;
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [newName, setNewName] = useState(curName);
  const dispatch = useAppDispatch();

  const queryKey = isComposite ? ["compositeLibrary"] : ["libraryComponents"];
  const renameMutation = useMutation({
    mutationFn: ({ id, newName }: { id: string; newName: string }) => {
      return action(id, newName, isComposite ?? false);
    },
    meta: { invalidates: queryKey },
  });

  const handleEdit = (
    e:
      | React.MouseEvent<HTMLButtonElement>
      | React.KeyboardEvent<HTMLInputElement>,
  ) => {
    e.stopPropagation();
    setPending(true);

    renameMutation.mutate(
      { id: id, newName },
      {
        onSuccess: (result) => {
          toast(result.message);
        },
        onError: (error) => {
          toast(error.message);
        },
        onSettled: () => {
          setPending(false);
          dispatch(fetchUserLibraries());
          setOpen(false);
        },
      },
    );
  };
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
        <p>Enter new name</p>
        <div className="flex gap-2 mb-4 mt-4">
          <Input
            onChange={(e) => setNewName(e.target.value)}
            value={newName}
            required={true}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleEdit(e);
              }
            }}
          />
          <input type="hidden" name="id" value={id} />
        </div>
        <div className="flex justify-end">
          <Button
            onClick={(e) => {
              handleEdit(e);
            }}
            disabled={pending}
            className="w-30 mt-4"
          >
            {pending ? <LoaderCircle className="animate-spin" /> : "Accept"}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
export default RenameButtonTitleBar;
