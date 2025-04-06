"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { ArrowUpDown } from "lucide-react";
import { format } from "date-fns";

import ComponentPrivateToggle from "./ComponentPrivateToggle";
import ComponentDeleteButton from "./ComponentDeleteButton";

import AddComponentToLibraryButton from "./AddComponentToLibraryButton";

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
          <AddComponentToLibraryButton
            componentId={component.id}
            componentName={component.name}
          />
          <ComponentPrivateToggle
            componentId={component.id}
            componentName={component.name}
            componentPublic={component.public}
          />
          <ComponentDeleteButton
            componentId={component.id}
            componentName={component.name}
          />
        </div>
      ) : (
        <>
          <AddComponentToLibraryButton
            componentId={component.id}
            componentName={component.name}
          />
        </>
      );
    },
  },
];
