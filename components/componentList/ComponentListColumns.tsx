"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { BookUp, Trash } from "lucide-react";
import { ArrowUpDown } from "lucide-react";
import {
  deleteComponentAction,
  toggleComponentPrivateAction,
} from "@/utils/actions";
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
        <div className="flex items-center justify-between">
          <AddToLibrary />
          <PrivateToggle
            componentId={component.id}
            componentName={component.name}
            componentPublic={component.public}
          />
          <RemoveButton
            componentId={component.id}
            componentName={component.name}
          />
        </div>
      ) : (
        <>
          <AddToLibrary />
        </>
      );
    },
  },
];

const AddToLibrary = () => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
            }}
          >
            <BookUp />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Add to library</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const PrivateToggle = ({
  componentId,
  componentName,
  componentPublic,
}: {
  componentId: string;
  componentName: string;
  componentPublic: boolean;
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const togglePrivateActionWithId = toggleComponentPrivateAction.bind(
    null,
    componentId
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setDialogOpen(true);
            }}
          >
            {componentPublic ? <Eye /> : <EyeOff />}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          {componentPublic ? "Public" : "Private"}
        </TooltipContent>
      </Tooltip>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
          <DialogHeader>
            <DialogTitle>Toggle public status {componentName}</DialogTitle>
            <DialogDescription>
              You are about to change {componentName} to be{" "}
              {componentPublic ? "private" : "public"}.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <FormContainer
              action={togglePrivateActionWithId}
              onSuccess={() => setDialogOpen(false)}
            >
              <SubmitButton />
            </FormContainer>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};

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
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            size="icon"
            variant="ghost"
            className="h-6 w-6 text-destructive cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setDialogOpen(true);
            }}
          >
            <Trash />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Remove</TooltipContent>
      </Tooltip>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent onInteractOutside={(e) => e.preventDefault()}>
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
    </TooltipProvider>
  );
};
