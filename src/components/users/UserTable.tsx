
"use client";

import React, { useState, useMemo } from 'react';
import type { User } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTablePagination } from '@/components/shared/DataTablePagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, FilePenLine, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface UserTableProps {
  users: User[];
  onEdit: (user: User) => void;
  onDelete: (userId: string) => void;
  itemsPerPage?: number;
}

export function UserTable({ users, onEdit, onDelete, itemsPerPage = 10 }: UserTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const currentUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return users.slice(startIndex, startIndex + itemsPerPage);
  }, [users, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const tableHeaders = ["No", "Name", "Email", "Role", "Created", "Actions"];

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
            {currentUsers.map((user, index) => (
              <TableRow key={user.id}>
                <TableCell className="px-4 py-2 text-center sm:text-left">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{user.name}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{user.email}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">
                  <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </Badge>
                </TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{format(new Date(user.createdAt), 'dd MMM yyyy, HH:mm')}</TableCell>
                <TableCell className="px-4 py-2 text-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(user)}>
                        <FilePenLine className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onDelete(user.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {currentUsers.length === 0 && (
              <TableRow>
                <TableCell colSpan={tableHeaders.length} className="h-24 text-center px-4 py-2">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {users.length > itemsPerPage && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={users.length}
        />
      )}
    </div>
  );
}
