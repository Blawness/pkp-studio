
"use client";

import React, { useState, useMemo, useCallback } from 'react';
import type { Certificate } from '@/lib/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { DataTablePagination } from '@/components/shared/DataTablePagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, FilePenLine, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface CertificateTableProps {
  certificates: Certificate[];
  onEdit: (certificate: Certificate) => void;
  onDelete: (certificateId: string) => void;
  itemsPerPage?: number;
  showPagination?: boolean;
  caption?: string;
}

export function CertificateTable({
  certificates,
  onEdit,
  onDelete,
  itemsPerPage = 10,
  showPagination = true,
  caption,
}: CertificateTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(certificates.length / itemsPerPage);
  
  const currentCertificates = useMemo(() => {
    if (!showPagination) return certificates;
    const startIndex = (currentPage - 1) * itemsPerPage;
    return certificates.slice(startIndex, startIndex + itemsPerPage);
  }, [certificates, currentPage, itemsPerPage, showPagination]);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const tableHeaders = [
    "No", "Kode", "Nama Pemegang", "Surat Hak", "No Sertifikat", 
    "Letak Tanah", "Luas (M2)", "Tgl Terbit", "Surat Ukur", "NIB", 
    "Pendaftaran Pertama", "Actions"
  ];

  return (
    <div className="rounded-xl border shadow-xs">
      <div>
        <Table className="min-w-full">{/* Ensure no whitespace before/between direct children */}
          {caption && <caption className="p-4 text-lg font-semibold text-left">{caption}</caption>}<TableHeader>
            <TableRow>
              {tableHeaders.map((header) => (
                <TableHead key={header} className="px-4 py-3 text-xs sm:text-sm">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader><TableBody>
            {currentCertificates.map((cert, index) => (
              <TableRow key={cert.id}>
                <TableCell className="px-4 py-2 text-center sm:text-left">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{cert.kode}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{cert.nama_pemegang}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{cert.surat_hak}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{cert.no_sertifikat}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{cert.lokasi_tanah}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{cert.luas_m2}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{format(new Date(cert.tgl_terbit), 'dd MMM yyyy')}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{cert.surat_ukur}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{cert.nib}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{format(new Date(cert.pendaftaran_pertama), 'dd MMM yyyy')}</TableCell>
                <TableCell className="px-4 py-2 text-center">
                  {cert.actions !== false && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Open menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(cert)}>
                          <FilePenLine className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onDelete(cert.id)} className="text-destructive focus:text-destructive focus:bg-destructive/10">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </TableCell>
              </TableRow>
            ))}
             {currentCertificates.length === 0 && (
              <TableRow>
                <TableCell colSpan={tableHeaders.length} className="h-24 text-center px-4 py-2">
                  No certificates found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {showPagination && certificates.length > itemsPerPage && (
        <DataTablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          itemsPerPage={itemsPerPage}
          totalItems={certificates.length}
        />
      )}
    </div>
  );
}
