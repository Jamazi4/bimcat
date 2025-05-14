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
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "../ui/button";
import BrowserActionButtons from "./BrowserActionButtons";
import { usePathname } from "next/navigation";
import LibraryActionButtons from "../libraries/LibraryActionButtons";
import { SelectedRow } from "@/utils/types";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function ComponentList<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const isInLibraries = pathname.split("/")[1] === "libraries";
  const isInComposite = pathname.split("/")[2] === "composite";

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

  const handleRowClick = (row: Row<TData>) => {
    const isAnyDialogOpen = document.querySelector('[data-state="open"]');
    if (isAnyDialogOpen) return;
    const originalRow = row.original as ComponentRow;
    if (isInComposite) {
      const libraryId = pathname.split("/")[4];
      const compositeId = pathname.split("/")[3];
      router.push(
        `/libraries/composite/${compositeId}/${libraryId}/${originalRow.id}`,
      );
    } else if (isInLibraries) {
      const libraryId = pathname.split("/")[2];
      router.push(`/libraries/${libraryId}/${originalRow.id}`);
    } else {
      router.push(`/components/${originalRow.id}`);
    }
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
