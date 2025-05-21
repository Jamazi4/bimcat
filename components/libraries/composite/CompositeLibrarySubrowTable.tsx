"use client";

import {
  ColumnDef,
  VisibilityState,
  flexRender,
  getCoreRowModel,
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
import { useParams, useRouter } from "next/navigation";
import { ComponentRow } from "@/components/componentList/ComponentListColumns";
import { useState } from "react";

export function CompositeLibrarySubrowTable<TData, TValue>({
  columns,
  data,
  libraryId,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  libraryId: string;
}) {
  const router = useRouter();
  const { compositeLibraryId } = useParams<{ compositeLibraryId: string }>();
  const [sorting, setSorting] = useState<SortingState>([]);
  const visibilityState: VisibilityState = { select: false, author: false };

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getRowId: (data) => (data as ComponentRow).id,
    state: {
      sorting,
      columnVisibility: visibilityState,
    },
  });

  const handleRowClick = (row: Row<TData>) => {
    const isAnyDialogOpen = document.querySelector('[data-state="open"]');
    if (isAnyDialogOpen) return;
    const originalRow = row.original as ComponentRow;
    router.push(
      `/libraries/composite/${compositeLibraryId}/${libraryId}/${originalRow.id}`,
    );
  };

  return (
    <div>
      <Table>
        <TableHeader className="bg-muted/90">
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
    </div>
  );
}
