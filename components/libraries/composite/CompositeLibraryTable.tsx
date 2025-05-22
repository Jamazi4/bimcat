import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ExpandedState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  useReactTable,
  Row,
  getSortedRowModel,
  SortingState,
  getPaginationRowModel,
} from "@tanstack/react-table";
import React, { useState, Fragment, useEffect } from "react";
import { LibraryRow, compositeColumns } from "./CompositeLibraryColumns";
import { columns } from "@/components/componentList/ComponentListColumns";
import { CompositeLibrarySubrowTable } from "./CompositeLibrarySubrowTable";
import { Button } from "@/components/ui/button";
import { SelectedComposite } from "@/utils/types";
import UnmergeButton from "./UnmergeButton";

interface ExpandableTableProps {
  data: LibraryRow[];
}

export function ExpandableTable({ data }: ExpandableTableProps) {
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const [sorting, setSorting] = useState<SortingState>([]);
  const [localSelection, setLocalSelection] = useState({});
  const [actionableItems, setActionableItems] = useState<SelectedComposite[]>(
    [],
  );

  const table = useReactTable<LibraryRow>({
    data,
    columns: compositeColumns,
    state: {
      expanded,
      sorting,
      rowSelection: localSelection,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
    onExpandedChange: setExpanded,
    getSubRows: () => undefined,
    getSortedRowModel: getSortedRowModel(),
    getRowCanExpand: (row: Row<LibraryRow>) =>
      !!(row.original.components && row.original.components.length > 0),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onRowSelectionChange: setLocalSelection,
    onSortingChange: setSorting,
  });

  useEffect(() => {
    const tempSelectedComponents: SelectedComposite[] = Object.entries(
      table.getSelectedRowModel().rows,
    ).map((entry) => {
      const { id, name } = entry[1].original;
      return {
        [id]: {
          name,
        },
      };
    });
    setActionableItems(tempSelectedComponents);
  }, [localSelection, table]);

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead
                  className="bg-muted font-bold first:rounded-l-md last:rounded-r-md"
                  key={header.id}
                  colSpan={header.colSpan}
                >
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext(),
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row: Row<LibraryRow>) => {
              const isExpanded = row.getIsExpanded();
              return (
                <Fragment key={row.id}>
                  <TableRow
                    data-state={row.getIsSelected() && "selected"}
                    className={
                      isExpanded
                        ? "border-b-0 text-background !bg-secondary"
                        : ""
                    }
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                  {isExpanded &&
                    row.original.components &&
                    row.original.components.length > 0 && (
                      <TableRow className="hover:bg-background">
                        <TableCell colSpan={row.getVisibleCells().length}>
                          <CompositeLibrarySubrowTable
                            columns={columns}
                            data={row.original.components}
                          />
                        </TableCell>
                      </TableRow>
                    )}
                </Fragment>
              );
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={compositeColumns.length}
                className="h-24 text-center"
              >
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      <div className="grid items-center grid-cols-3 w-full space-x-2 py-4">
        <div className="text-sm text-muted-foreground space-x-2">
          <UnmergeButton
            libraries={actionableItems}
            setSelection={setLocalSelection}
          />
        </div>

        <p className="text-muted-foreground text-center">
          Selected {Object.keys(localSelection).length} /{" "}
          {table.getFilteredRowModel().rows.length}
        </p>

        <div className="space-x-2 items-end justify-end text-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
