"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";
import { ArrowUpDown } from "lucide-react";

export type ComponentRow = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  editable: boolean;
  public: boolean;
};

export const columns: ColumnDef<ComponentRow>[] = [
  {
    accessorKey: "name",
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
      const handleClick = (
        e: React.MouseEvent<HTMLButtonElement, MouseEvent>
      ) => {
        e.stopPropagation();
        console.log(component.id);
      };

      return component.editable ? (
        <Button
          asChild
          size="icon"
          variant="destructive"
          className="h-6 w-6"
          onClick={(e) => handleClick(e)}
        >
          <Trash className="p-1" />
        </Button>
      ) : (
        <></>
      );
    },
  },
];
