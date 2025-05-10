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
    header: "Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2 font-medium">
        {row.original.name}
        {row.getCanExpand() && (
          <span className="flex items-center text-xs text-muted-foreground"></span>
        )}
      </div>
    ),
  },
  {
    id: "Components",
    accessorFn: (row) => row.components.length,
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
];
