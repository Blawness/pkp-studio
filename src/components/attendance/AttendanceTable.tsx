
"use client";

import React, { useState, useMemo } from 'react';
import type { Attendance } from '@/lib/types';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DataTablePagination } from '@/components/shared/DataTablePagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, FilePenLine, Trash2 } from 'lucide-react';
import { format, formatDistance } from 'date-fns';

interface AttendanceTableProps {
  records: Attendance[];
  onEdit: (record: Attendance) => void;
  onDelete: (recordId: string) => void;
  itemsPerPage?: number;
}

export function AttendanceTable({ records, onEdit, onDelete, itemsPerPage = 15 }: AttendanceTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(records.length / itemsPerPage);

  const currentRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return records.slice(startIndex, startIndex + itemsPerPage);
  }, [records, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const calculateDuration = (checkIn: Date, checkOut: Date | null) => {
    if (!checkOut) return '-';
    return formatDistance(new Date(checkOut), new Date(checkIn), { includeSeconds: true });
  };

  const tableHeaders = ["User", "Date", "Check In", "Check Out", "Duration", "Actions"];

  return (
    <div className="rounded-xl border shadow-xs">
      <div>
        <Table className="min-w-full">
          <TableHeader>
            <TableRow>
              {tableHeaders.map((header) => (
                <TableHead key={header} className="px-4 py-3 text-xs sm:text-sm">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentRecords.length > 0 ? (
              currentRecords.map(record => (
                <TableRow key={record.id}>
                  <TableCell>{record.user.name}</TableCell>
                  <TableCell>{format(new Date(record.date), 'dd MMM yyyy')}</TableCell>
                  <TableCell>{format(new Date(record.checkIn), 'HH:mm:ss')}</TableCell>
                  <TableCell>{record.checkOut ? format(new Date(record.checkOut), 'HH:mm:ss') : '-'}</TableCell>
                  <TableCell>{calculateDuration(record.checkIn, record.checkOut)}</TableCell>
                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(record)}>
                          <FilePenLine className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(record.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={tableHeaders.length} className="h-24 text-center">
                  No attendance records found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {records.length > itemsPerPage && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={records.length}
        />
      )}
    </div>
  );
}
