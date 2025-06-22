"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { ArrowUpDown, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import GoToLibraryButton from "../libraries/composite/GoToLibraryButton";

export type ComponentRow = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  author: string;
  editable: boolean;
  public: boolean;
  containingLibId?: string;
};

export const columns: ColumnDef<ComponentRow>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        onClick={(e) => e.stopPropagation()}
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: true,
  },
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
    cell: ({ row }) => {
      const name = row.original.name;
      const shortLength = 60;
      return name.length > shortLength
        ? `${name.slice(0, shortLength)}...`
        : name;
    },
  },
  {
    accessorKey: "createdAt",
    sortingFn: "datetime",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
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
      const date = new Date(row.getValue("updatedAt"));
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
    accessorKey: "public",
    id: "private",
    header: ({ column }) => {
      return (
        <div className="flex mx-auto justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Public
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      const component = row.original;
      const className = "h-5 w-5 mx-auto";
      return (
        <div className="flex">
          {component.public ? (
            <Eye className={className} />
          ) : (
            <EyeOff className={className} />
          )}
        </div>
      );
    },
  },
  {
    id: "action",
    cell: ({ row }) => {
      let path: string;
      const containingLibId = row.original.containingLibId;
      if (containingLibId) {
        path = `${containingLibId}/${row.original.id}`;
      } else {
        path = row.original.id;
      }

      return <GoToLibraryButton id={path} />;
    },
  },
];
