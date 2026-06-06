"use client";

import * as React from "react";
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

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
      let val: any = item;
      const keys = (searchKey as string).split('.');
      for (const k of keys) {
        if (val) val = val[k];
      }
      if (typeof val === "string") {
        return val.toLowerCase().includes(search.toLowerCase());
      }
      return false;
    });
  }, [data, search, searchKey]);

  return (
    <div className="space-y-4">
      {searchKey && (
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      )}
      <div className="rounded-md border bg-card text-card-foreground shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col.key}>{col.header}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              filteredData.map((row, i) => (
                <TableRow key={i}>
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
