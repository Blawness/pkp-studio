
"use client";

import React, { useState, useMemo } from 'react';
import type { ActivityLog } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/shared/DataTablePagination';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { History, Loader2 } from 'lucide-react';

interface LogTableProps {
  logs: ActivityLog[];
  itemsPerPage?: number;
  onRestore?: (logId: string) => void;
  restoringLogId?: string | null;
}

export function LogTable({ logs, itemsPerPage = 20, onRestore, restoringLogId }: LogTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(logs.length / itemsPerPage);
  const currentLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return logs.slice(startIndex, startIndex + itemsPerPage);
  }, [logs, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const canBeRestored = (log: ActivityLog) => {
    const recoverableActions = ['DELETE_CERTIFICATE', 'DELETE_USER', 'DELETE_TANAH_GARAPAN'];
    return recoverableActions.includes(log.action) && log.payload;
  };

  const tableHeaders = ["No", "User", "Action", "Details", "Timestamp", "Actions"];

  return (
    <div className="rounded-xl border shadow-xs">
      <div>
        <Table className="min-w-full">{/* Ensure no whitespace between direct children */}
          <TableHeader>
            <TableRow>
              {tableHeaders.map((header) => (
                <TableHead key={header} className="px-4 py-3 text-xs sm:text-sm">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader><TableBody>
            {currentLogs.map((log, index) => (
              <TableRow key={log.id}>
                <TableCell className="px-4 py-2 text-center sm:text-left">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{log.user}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{log.action}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{log.details}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{format(new Date(log.timestamp), 'dd MMM yyyy, HH:mm:ss')}</TableCell>
                <TableCell className="px-4 py-2 text-center">
                  {onRestore && canBeRestored(log) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onRestore(log.id)}
                      disabled={restoringLogId === log.id}
                    >
                      {restoringLogId === log.id ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <History className="mr-2 h-4 w-4" />
                      )}
                      Restore
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
            {currentLogs.length === 0 && (
              <TableRow>
                <TableCell colSpan={tableHeaders.length} className="h-24 text-center px-4 py-2">
                  No activity logs found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {logs.length > itemsPerPage && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={logs.length}
        />
      )}
    </div>
  );
}
