"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../ui/button";
import { Trash } from "lucide-react";

export type ComponentRow = {
  id: string;
  name: any;
  createdAt: string;
  updatedAt: string;
  author: string;
  editable: boolean;
};

export const columns: ColumnDef<ComponentRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "createdAt",
    header: "Created",
  },
  {
    accessorKey: "updatedAt",
    header: "Updated",
  },
  {
    accessorKey: "author",
    header: "Author",
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
          className="h-8 w-8"
          onClick={(e) => handleClick(e)}
        >
          <Trash className="p-2" />
        </Button>
      ) : (
        <></>
      );
    },
  },
];
