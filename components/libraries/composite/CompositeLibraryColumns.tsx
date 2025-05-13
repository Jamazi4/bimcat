import { ComponentRow } from "@/components/componentList/ComponentListColumns";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, ChevronDown, ChevronRight } from "lucide-react";

export type LibraryRow = {
  id: string;
  name: string;
  author: string;
  updatedAt: string;
  createdAt: string;
  components: ComponentRow[];
  public: boolean;
};
const headerClassname = "flex items-center justify-center font-medium text-lg";
const headerClassnameLeft =
  "flex items-center justify-start font-medium text-xl";
const cellClassname = "flex justify-center gap-2 font-medium";
const cellClassnameLeft = "flex justify-start gap-2 font-medium";
export const compositeColumns: ColumnDef<LibraryRow>[] = [
  {
    id: "expander",
    header: () => null,
    cell: ({ row }) => {
      return row.getCanExpand() ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={row.getToggleExpandedHandler()}
          aria-label="Expand row"
          className="p-0 h-8 w-8"
        >
          {row.getIsExpanded() ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      ) : null;
    },
  },
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <div className="flex justify-start">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className={headerClassnameLeft}>Name</span>
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <span className={cellClassnameLeft}>{row.original.name}</span>
    ),
  },
  {
    id: "Components",
    accessorFn: (row) => row.components.length,
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className={headerClassname}>Components</span>
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <div className={cellClassname}>{row.original.components.length}</div>
    ),
  },
  {
    accessorKey: "createdAt",
    sortingFn: "datetime",
    cell: ({ row }) => {
      const date = new Date(row.getValue("createdAt"));
      const formatted = format(date, "dd-MM-yy HH:mm");
      return <div className={cellClassname}>{formatted}</div>;
    },
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className={headerClassname}>Created</span>
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "updatedAt",
    sortingFn: "datetime",
    cell: ({ row }) => {
      const date = new Date(row.getValue("updatedAt"));
      const formatted = format(date, "dd-MM-yy HH:mm");
      return <div className={cellClassname}>{formatted}</div>;
    },
    header: ({ column }) => {
      return (
        <div className="flex justify-center">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className={headerClassname}>Updated</span>
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "author",
    sortingFn: "text",
    header: ({ column }) => {
      return (
        <div className="flex justify-start">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span className={headerClassname}>Author</span>
            <ArrowUpDown />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => {
      return <div className={cellClassnameLeft}>{row.original.author}</div>;
    },
  },
];
