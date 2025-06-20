
"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CertificateTable } from '@/components/certificates/CertificateTable';
import { CertificateForm, type CertificateFormData } from '@/components/certificates/CertificateForm';
import type { Certificate } from '@/lib/types';
import { mockCertificates } from '@/lib/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { SURAT_HAK_OPTIONS } from '@/lib/constants';

type SortableCertificateKey = 'kode' | 'nama_pemegang' | 'surat_hak' | 'no_sertifikat' | 'luas_m2' | 'tgl_terbit';

export default function CertificatesPage() {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suratHakFilter, setSuratHakFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortableCertificateKey; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    setCertificates(mockCertificates);
  }, []);

  const handleSort = useCallback((key: SortableCertificateKey) => {
    setSortConfig(prevSortConfig => {
      const isAsc = prevSortConfig?.key === key && prevSortConfig.direction === 'asc';
      return { key, direction: isAsc ? 'desc' : 'asc' };
    });
  }, []);

  const filteredAndSortedCertificates = useMemo(() => {
    if (!certificates) {
      return [];
    }
    let filtered = certificates.filter(cert =>
      (suratHakFilter === 'all' || cert.surat_hak === suratHakFilter) &&
      (Object.values(cert).some(value => {
        if (Array.isArray(value)) {
          return value.some(name => String(name).toLowerCase().includes(searchTerm.toLowerCase()));
        }
        return String(value).toLowerCase().includes(searchTerm.toLowerCase());
      }))
    );

    if (sortConfig) {
      filtered.sort((a, b) => {
        let valA = a[sortConfig.key];
        let valB = b[sortConfig.key];

        if (sortConfig.key === 'nama_pemegang') {
          valA = Array.isArray(valA) ? valA[0] || '' : '';
          valB = Array.isArray(valB) ? valB[0] || '' : '';
        }
        
        if (sortConfig.key === 'tgl_terbit') { // Removed 'pendaftaran_pertama' as it's not a SortableCertificateKey
            valA = new Date(valA as Date).getTime();
            valB = new Date(valB as Date).getTime();
        }


        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });
    }
    return filtered;
  }, [certificates, searchTerm, suratHakFilter, sortConfig]);

  const handleAddCertificate = useCallback(() => {
    setEditingCertificate(undefined);
    setIsModalOpen(true);
  }, []);

  const handleEditCertificate = useCallback((certificate: Certificate) => {
    setEditingCertificate(certificate);
    setIsModalOpen(true);
  }, []);

  const handleDeleteCertificate = useCallback((certificateId: string) => {
    setCertificates(prev => prev ? prev.filter(cert => cert.id !== certificateId) : null);
    toast({ variant: "destructive", title: "Certificate Deleted", description: `Certificate ID ${certificateId} has been removed.` });
  }, [toast]);

  const handleFormSubmit = useCallback(async (data: CertificateFormData) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); 

    const namesArray = data.nama_pemegang.split(',').map(name => name.trim()).filter(name => name.length > 0);

    setCertificates(prevCertificates => {
      const currentCertificates = prevCertificates || [];
      if (editingCertificate) {
        toast({ title: "Certificate Updated", description: `Certificate ${data.kode} has been updated.` });
        return currentCertificates.map(cert => 
          cert.id === editingCertificate.id 
            ? { ...cert, ...data, nama_pemegang: namesArray, id: cert.id, tgl_terbit: data.tgl_terbit, pendaftaran_pertama: data.pendaftaran_pertama } 
            : cert
        );
      } else {
        const newCertificate: Certificate = { 
          ...data, 
          id: `cert-${Date.now()}`, 
          nama_pemegang: namesArray,
          tgl_terbit: data.tgl_terbit,
          pendaftaran_pertama: data.pendaftaran_pertama
        };
        toast({ title: "Certificate Added", description: `Certificate ${data.kode} has been added.` });
        return [newCertificate, ...currentCertificates];
      }
    });

    setIsSubmitting(false);
    setIsModalOpen(false);
    setEditingCertificate(undefined);
  }, [editingCertificate, toast]);
  
  if (certificates === null) {
    return (
      <div className="flex flex-col flex-1 space-y-8 items-center justify-center">
        <p>Loading certificates...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-headline font-semibold">Certificate Management</h1>
        <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingCertificate(undefined); }}>
          <DialogTrigger asChild>
            <Button onClick={handleAddCertificate}>
              <PlusCircle className="mr-2 h-4 w-4" /> Add Certificate
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="font-headline">
                {editingCertificate ? 'Edit Certificate' : 'Add New Certificate'}
              </DialogTitle>
              <DialogDescription>
                {editingCertificate ? 'Update the details of the existing certificate.' : 'Fill in the form to add a new certificate.'}
              </DialogDescription>
            </DialogHeader>
            <CertificateForm
              onSubmit={handleFormSubmit}
              initialData={editingCertificate}
              isSubmitting={isSubmitting}
              onCancel={() => {
                setIsModalOpen(false);
                setEditingCertificate(undefined);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search certificates..."
            className="pl-10 w-full"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="suratHakFilter" className="text-sm font-medium">Filter by Surat Hak</Label>
          <Select value={suratHakFilter} onValueChange={setSuratHakFilter}>
            <SelectTrigger id="suratHakFilter" className="w-full mt-1">
              <SelectValue placeholder="All Surat Hak" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Surat Hak</SelectItem>
              {SURAT_HAK_OPTIONS.map(option => (
                <SelectItem key={option} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <CertificateTable
        certificates={filteredAndSortedCertificates}
        onEdit={handleEditCertificate}
        onDelete={handleDeleteCertificate}
        sortConfig={sortConfig}
        handleSort={handleSort}
      />
    </div>
  );
}
