"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  getSortedRowModel,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ComponentRow } from "./ComponentListColumns";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import BrowserActionButtons from "./BrowserActionButtons";
import { usePathname } from "next/navigation";
import LibraryActionButtons from "../libraries/LibraryActionButtons";
import { SelectedRow } from "@/utils/types";

export function ComponentList<TData, TValue>({
  columns,
  data,
  libraryEditable,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  libraryEditable?: boolean;
}) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const isInLibraries = pathname.split("/")[1] === "libraries";
  const showSelect = libraryEditable === undefined ? true : libraryEditable;

  const [sorting, setSorting] = useState<SortingState>([]);
  const [localSelection, setLocalSelection] = useState({});
  const [actionableItems, setActionableItems] = useState<SelectedRow[]>([]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setLocalSelection,
    initialState: {
      columnVisibility: {
        select: showSelect,
      },
      pagination: {
        pageSize: 10,
      },
    },
    getRowId: (data) => (data as ComponentRow).id,
    state: {
      sorting,
      rowSelection: localSelection,
    },
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    const tempSelectedComponents: SelectedRow[] = Object.entries(
      table.getSelectedRowModel().rows,
    ).map((entry) => {
      const {
        id,
        name,
        editable,
        public: isPublic,
      } = entry[1].original as ComponentRow;
      return {
        [id]: {
          name,
          editable,
          isPublic,
        },
      };
    });

    setActionableItems(tempSelectedComponents);
  }, [localSelection, table]);

  useEffect(() => {
    setActionableItems([]);
    setLocalSelection([]);
  }, [searchParams]);

  return (
    <div className="rounded-md">
      <Table>
        <TableHeader className="bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead
                    key={header.id}
                    className="bg-muted font-bold first:rounded-l-md last:rounded-r-md"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <TableRow
                key={row.id}
                data-state={row.getIsSelected() && "selected"}
                className="h-12"
              >
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell
                rowSpan={2}
                colSpan={columns.length}
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
          {isInLibraries ? (
            <LibraryActionButtons
              components={actionableItems}
              setSelection={setLocalSelection}
            />
          ) : (
            <BrowserActionButtons
              components={actionableItems}
              setSelection={setLocalSelection}
            />
          )}
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
