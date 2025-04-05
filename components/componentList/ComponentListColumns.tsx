"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import { ArrowUpDown } from "lucide-react";
import { deleteComponentAction } from "@/utils/actions";
import { toast } from "sonner";
import { format } from "date-fns";
import { Eye, EyeOff } from "lucide-react";
import { TooltipTrigger, Tooltip, TooltipProvider } from "../ui/tooltip";
import { TooltipContent } from "@radix-ui/react-tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { useState } from "react";
import FormContainer from "../global/FormContainer";
import SubmitButton from "../global/SubmitButton";

export type ComponentRow = {
  id: string;
  name: string;
  createdAt: Date;
  updatedAt: Date;
  author: string;
  editable: boolean;
  public: boolean;
};

export const columns: ColumnDef<ComponentRow>[] = [
  {
    accessorKey: "name",
    sortingFn: "text",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Name
          <ArrowUpDown />
        </Button>
      );
    },
  },
  {
    accessorKey: "createdAt",
    sortingFn: "datetime",
    cell: ({ row }) => {
      const date = row.getValue("createdAt") as Date;
      const formatted = format(date, "dd-MM-yy HH:mm");
      return formatted;
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Created
          <ArrowUpDown />
        </Button>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    sortingFn: "datetime",
    cell: ({ row }) => {
      const date = row.getValue("updatedAt") as Date;
      const formatted = format(date, "dd-MM-yy HH:mm");
      return formatted;
    },
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Updated
          <ArrowUpDown />
        </Button>
      );
    },
  },
  {
    accessorKey: "author",
    sortingFn: "text",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Author
          <ArrowUpDown />
        </Button>
      );
    },
  },

  {
    id: "actions",
    cell: ({ row }) => {
      const component = row.original;

      return component.editable ? (
        <div className="flex">
          <RemoveButton
            componentId={component.id}
            componentName={component.name}
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                {component.public ? <Eye /> : <EyeOff />}
              </TooltipTrigger>
              <TooltipContent>
                {component.public ? "Public" : "Private"}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ) : (
        <></>
      );
    },
  },
];

const RemoveButton = ({
  componentId,
  componentName,
}: {
  componentId: string;
  componentName: string;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const removeActionWithId = deleteComponentAction.bind(null, componentId);

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                size="icon"
                variant="destructive"
                className="h-6 w-6 mr-2"
                onClick={(e) => {
                  e.stopPropagation();
                }}
              >
                <Trash className="p-1" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Remove</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Remove {componentName}</DialogTitle>
          <DialogDescription>
            You are about to remove your component, there is no undo
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <FormContainer
            action={removeActionWithId}
            onSuccess={() => setDialogOpen(false)}
          >
            <SubmitButton />
          </FormContainer>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
