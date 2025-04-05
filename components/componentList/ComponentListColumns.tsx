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
      const handleClick = async (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
      ) => {
        e.stopPropagation();
        await deleteComponentAction(component.id);
        toast(`Component ${component.name} deleted successfully!`);
      };

      return component.editable ? (
        <div className="flex">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  size="icon"
                  variant="destructive"
                  className="h-6 w-6 mr-2"
                  onClick={(e) => handleClick(e)}
                >
                  <Trash className="p-1" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Remove component</TooltipContent>
            </Tooltip>
          </TooltipProvider>
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
