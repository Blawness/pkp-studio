
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
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { DataTablePagination } from '@/components/shared/DataTablePagination';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { MoreHorizontal, FilePenLine, Trash2, ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { format } from 'date-fns';

type SortableCertificateKey = 'kode' | 'nama_pemegang' | 'surat_hak' | 'no_sertifikat' | 'luas_m2' | 'tgl_terbit';

interface CertificateTableProps {
  certificates: Certificate[];
  onEdit: (certificate: Certificate) => void;
  onDelete: (certificateId: string) => void;
  itemsPerPage?: number;
  showPagination?: boolean;
  caption?: string;
  sortConfig: { key: SortableCertificateKey; direction: 'asc' | 'desc' } | null;
  handleSort: (key: SortableCertificateKey) => void;
}

export function CertificateTable({
  certificates,
  onEdit,
  onDelete,
  itemsPerPage = 10,
  showPagination = true,
  caption,
  sortConfig,
  handleSort,
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

  const renderSortIcon = (columnKey: SortableCertificateKey) => {
    if (sortConfig?.key !== columnKey) {
      return <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground/50" />;
    }
    return sortConfig.direction === 'asc' ? <ArrowUp className="ml-2 h-4 w-4" /> : <ArrowDown className="ml-2 h-4 w-4" />;
  };

  const tableHeaders: { key: SortableCertificateKey | 'no' | 'lokasi_tanah' | 'surat_ukur' | 'nib' | 'pendaftaran_pertama' | 'actions'; label: string; sortable: boolean }[] = [
    { key: "no", label: "No", sortable: false },
    { key: "kode", label: "Kode", sortable: true },
    { key: "nama_pemegang", label: "Nama Pemegang", sortable: true },
    { key: "surat_hak", label: "Surat Hak", sortable: true },
    { key: "no_sertifikat", label: "No Sertifikat", sortable: true },
    { key: "lokasi_tanah", label: "Letak Tanah", sortable: false },
    { key: "luas_m2", label: "Luas (M2)", sortable: true },
    { key: "tgl_terbit", label: "Tgl Terbit", sortable: true },
    { key: "surat_ukur", label: "Surat Ukur", sortable: false },
    { key: "nib", label: "NIB", sortable: false },
    { key: "pendaftaran_pertama", label: "Pendaftaran Pertama", sortable: false },
    { key: "actions", label: "Actions", sortable: false },
  ];


  return (
    <div className="rounded-xl border shadow-xs">
      <div>
        <Table className="min-w-full">
          {caption && <caption className="p-4 text-lg font-semibold text-left">{caption}</caption>}
          <TableHeader>
            <TableRow>
              {tableHeaders.map((header) => (
                <TableHead key={header.key} className="px-4 py-3 text-xs sm:text-sm">
                  {header.sortable ? (
                    <Button variant="ghost" onClick={() => handleSort(header.key as SortableCertificateKey)} className="px-0 py-0 h-auto hover:bg-transparent font-medium text-muted-foreground hover:text-foreground">
                      {header.label}
                      {renderSortIcon(header.key as SortableCertificateKey)}
                    </Button>
                  ) : (
                    header.label
                  )}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentCertificates.map((cert, index) => (
              <TableRow key={cert.id}>
                <TableCell className="px-4 py-2 text-center sm:text-left">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{cert.kode}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">
                  {cert.nama_pemegang && cert.nama_pemegang.length > 0 ? (
                    cert.nama_pemegang.length === 1 ? (
                      cert.nama_pemegang[0]
                    ) : (
                      <Popover>
                        <PopoverTrigger asChild>
                          <span className="cursor-pointer hover:text-primary transition-colors">
                            {cert.nama_pemegang[0]}
                            <Badge variant="outline" className="ml-1.5 px-1.5 py-0.5 text-xs">
                              +{cert.nama_pemegang.length - 1} more
                            </Badge>
                          </span>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-3 shadow-lg rounded-md border bg-popover text-popover-foreground">
                          <ul className="space-y-1">
                            {cert.nama_pemegang.map((name, idx) => (
                              <li key={idx} className="text-sm">{name}</li>
                            ))}
                          </ul>
                        </PopoverContent>
                      </Popover>
                    )
                  ) : (
                    '-' 
                  )}
                </TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{cert.surat_hak}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{cert.no_sertifikat}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{cert.lokasi_tanah}</TableCell>
                <TableCell className="px-4 py-2 text-center sm:text-left">{cert.luas_m2.toLocaleString()}</TableCell>
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
