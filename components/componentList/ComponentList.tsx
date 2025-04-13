"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  Row,
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
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import BrowserActionButtons from "./BrowserActionButtons";
import { useDispatch, useSelector } from "react-redux";
import { updateBrowserSelection } from "@/lib/features/browser/componentBrowserSlice";
import { updateLibrarySelection } from "@/lib/features/libraries/libraryBrowserSlice";
import { RootState } from "@/lib/store";
import { usePathname } from "next/navigation";
import LibraryActionButtons from "../libraries/LibraryActionButtons";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function ComponentList<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const isInLibraries = usePathname().split("/")[1] === "libraries";
  const router = useRouter();

  const { selectedComponents } = useSelector((state: RootState) =>
    isInLibraries ? state.libraryBrowser : state.componentBrowser
  );

  const updateSelection = isInLibraries
    ? updateLibrarySelection
    : updateBrowserSelection;

  const [rowSelection, setRowSelection] = useState(selectedComponents);

  const dispatch = useDispatch();

  useEffect(() => {
    setRowSelection(selectedComponents);
  }, [selectedComponents]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onRowSelectionChange: setRowSelection,
    getRowId: (data) => (data as ComponentRow).id,
    state: {
      sorting,
      rowSelection,
    },
    getPaginationRowModel: getPaginationRowModel(),
  });

  useEffect(() => {
    dispatch(updateSelection(rowSelection));
  }, [rowSelection]);

  useEffect(() => {
    console.log("component browser mounted");
  }, []);

  const handleRowClick = (row: Row<TData>) => {
    const isAnyDialogOpen = document.querySelector('[data-state="open"]');
    if (isAnyDialogOpen) return;
    const originalRow = row.original as ComponentRow;
    router.push(`/components/${originalRow.id}`);
  };

  return (
    <div className="rounded-md">
      <Table>
        <TableHeader className="bg-muted">
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => {
                return (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
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
                onClick={() => handleRowClick(row)}
                className="cursor-pointer h-12"
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
      <div className="flex items-center justify-between space-x-2 py-4">
        <div className="text-sm text-muted-foreground space-x-2">
          {isInLibraries ? <LibraryActionButtons /> : <BrowserActionButtons />}
        </div>

        <p className="text-muted-foreground">
          Selected {Object.keys(selectedComponents).length}
        </p>

        <div className="space-x-2">
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
