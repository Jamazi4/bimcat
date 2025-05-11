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
} from "@tanstack/react-table";
import React, { useState, Fragment } from "react";

import { LibraryRow, compositeColumns } from "./CompositeLibraryColumns";
import { columns } from "@/components/componentList/ComponentListColumns";
import { CompositeLibrarySubrowTable } from "./CompositeLibrarySubrowTable";

interface ExpandableTableProps {
  data: LibraryRow[];
}

export function ExpandableTable({ data }: ExpandableTableProps) {
  const [expanded, setExpanded] = useState<ExpandedState>({});

  const table = useReactTable<LibraryRow>({
    data,
    columns: compositeColumns,
    state: {
      expanded,
    },
    onExpandedChange: setExpanded,
    getSubRows: () => undefined,
    getSortedRowModel: getSortedRowModel(),
    getRowCanExpand: (row: Row<LibraryRow>) =>
      !!(row.original.components && row.original.components.length > 0),
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  });

  return (
    <div>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id} className="">
              {headerGroup.headers.map((header) => (
                <TableHead
                  className="bg-muted font-bold"
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
                    data-state={isExpanded ? "selected" : undefined}
                    className={
                      isExpanded
                        ? "border-b-0 text-background !bg-primary/80"
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
                      <TableRow className="hover:bg-primary/90 bg-primary/80 text-background">
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
    </div>
  );
}
