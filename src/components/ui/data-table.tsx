"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search, Rows3 } from "lucide-react";
import { PremiumSpinner } from "@/components/ui/Spinner";

export interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  searchKey?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

export function DataTable<T>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search...",
  emptyMessage = "No results found."
}: DataTableProps<T>) {
  const [search, setSearch] = useState("");

  const filteredData = React.useMemo(() => {
    if (!searchKey || !search) return data;
    return data.filter((item) => {
      let val: unknown = item;
      const keys = (searchKey as string).split('.');
      for (const k of keys) {
        if (val && typeof val === "object") {
          val = (val as Record<string, unknown>)[k];
        }
      }
      if (typeof val === "string") {
        return val.toLowerCase().includes(search.toLowerCase());
      }
      return false;
    });
  }, [data, search, searchKey]);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 border-b bg-muted/20 p-3 sm:flex-row sm:items-center sm:justify-between">
        {searchKey ? (
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchPlaceholder}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 bg-background pl-9"
            />
          </div>
        ) : (
          <div />
        )}
        <div className="flex items-center gap-2 rounded-md border bg-background px-2.5 py-1.5 text-xs font-medium text-muted-foreground">
          <Rows3 className="h-3.5 w-3.5" />
          {filteredData.length} records
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-36 text-center">
                  <div className="mx-auto flex max-w-sm flex-col items-center gap-2 text-muted-foreground">
                    <Rows3 className="h-8 w-8 text-muted-foreground/50" />
                    <span className="text-sm font-medium">{emptyMessage}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row, i) => (
                <TableRow key={i} className="odd:bg-background even:bg-muted/15">
                  {columns.map((col) => (
                    <TableCell key={col.key}>{col.cell(row)}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
