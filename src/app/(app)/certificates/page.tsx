
"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CertificateTable } from '@/components/certificates/CertificateTable';
import { CertificateForm, type CertificateFormData } from '@/components/certificates/CertificateForm';
import type { Certificate } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { SURAT_HAK_OPTIONS, KODE_CERTIFICATE_OPTIONS } from '@/lib/constants';
import { getCertificates, addCertificate, updateCertificate, deleteCertificate } from '@/lib/actions';
import { ExportButton } from '@/components/certificates/ExportButton';

type SortableCertificateKey = 'kode' | 'nama_pemegang' | 'surat_hak' | 'no_sertifikat' | 'luas_m2' | 'tgl_terbit';

export default function CertificatesPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  
  const [certificates, setCertificates] = useState<Certificate[] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [suratHakFilter, setSuratHakFilter] = useState<string>('all');
  const [kodeFilter, setKodeFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortConfig, setSortConfig] = useState<{ key: SortableCertificateKey; direction: 'asc' | 'desc' } | null>(null);

  const canManage = user?.role === 'admin' || user?.role === 'manager';

  const fetchCertificates = useCallback(async () => {
    try {
      const fetchedCertificates = await getCertificates();
      const formattedCertificates = fetchedCertificates.map(cert => ({
        ...cert,
        nama_pemegang: Array.isArray(cert.nama_pemegang) ? cert.nama_pemegang as string[] : [],
      }));
      setCertificates(formattedCertificates);
    } catch (error) {
      console.error("Failed to fetch certificates:", error);
      toast({
        title: "Error",
        description: "Failed to load certificates.",
        variant: "destructive",
      });
      setCertificates([]);
    }
  }, [toast]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleSort = useCallback((key: SortableCertificateKey) => {
    setSortConfig(prevSortConfig => {
      const isAsc = prevSortConfig?.key === key && prevSortConfig.direction === 'asc';
      return { key, direction: isAsc ? 'desc' : 'asc' };
    });
  }, []);

  const filteredAndSortedCertificates = useMemo(() => {
    if (!certificates) return [];
    let filtered = certificates.filter(cert =>
      (suratHakFilter === 'all' || cert.surat_hak === suratHakFilter) &&
      (kodeFilter === 'all' || cert.kode === kodeFilter) &&
      (Object.values(cert).some(value => 
        Array.isArray(value) 
          ? value.join(', ').toLowerCase().includes(searchTerm.toLowerCase())
          : String(value).toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );

    if (sortConfig) {
      filtered.sort((a, b) => {
        let valA: any = a[sortConfig.key];
        let valB: any = b[sortConfig.key];

        if (sortConfig.key === 'nama_pemegang') {
          valA = Array.isArray(valA) ? valA[0] || '' : '';
          valB = Array.isArray(valB) ? valB[0] || '' : '';
        } else if (sortConfig.key === 'tgl_terbit') {
            valA = new Date(valA as Date).getTime();
            valB = new Date(valB as Date).getTime();
        }

        if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
        if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return filtered;
  }, [certificates, searchTerm, suratHakFilter, kodeFilter, sortConfig]);

  const handleAddCertificate = useCallback(() => {
    setEditingCertificate(undefined);
    setIsModalOpen(true);
  }, []);

  const handleEditCertificate = useCallback((certificate: Certificate) => {
    setEditingCertificate(certificate);
    setIsModalOpen(true);
  }, []);

  const handleDeleteCertificate = useCallback(async (certificateId: string) => {
    if (!user || !canManage) return;
    try {
      await deleteCertificate(certificateId, user.name || user.email);
      toast({ variant: "destructive", title: "Certificate Deleted", description: "Certificate has been removed." });
      fetchCertificates(); // Refresh data
    } catch (error) {
      console.error("Failed to delete certificate:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to delete certificate.";
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    }
  }, [toast, fetchCertificates, user, canManage]);

  const handleFormSubmit = useCallback(async (data: CertificateFormData) => {
    if (!user || !canManage) return;
    setIsSubmitting(true);
    try {
      const userName = user.name || user.email;
      if (editingCertificate) {
        await updateCertificate(editingCertificate.id, data, userName);
        toast({ title: "Certificate Updated", description: "Certificate has been updated." });
      } else {
        await addCertificate(data, userName);
        toast({ title: "Certificate Added", description: "New certificate has been added." });
      }
      fetchCertificates();
      setIsModalOpen(false);
      setEditingCertificate(undefined);
    } catch (error) {
      console.error("Failed to save certificate:", error);
      const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
      toast({ variant: "destructive", title: "Save Failed", description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  }, [editingCertificate, toast, fetchCertificates, user, canManage]);
  
  if (certificates === null) {
    return (
      <div className="flex flex-col flex-1 space-y-8">
        <h1 className="text-3xl font-headline font-semibold">Certificate Management</h1>
        <div className="rounded-xl border shadow-xs p-4 text-center">
            <p className="text-muted-foreground">Loading certificates...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-headline font-semibold">Certificate Management</h1>
        <div className="flex items-center gap-2">
          {canManage && (
            <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingCertificate(undefined); }}>
              <DialogTrigger asChild>
                <Button onClick={handleAddCertificate} className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Certificate
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-headline">{editingCertificate ? 'Edit Certificate' : 'Add New Certificate'}</DialogTitle>
                  <DialogDescription>{editingCertificate ? 'Update certificate details.' : 'Fill in the form to add a new certificate.'}</DialogDescription>
                </DialogHeader>
                <CertificateForm
                  onSubmit={handleFormSubmit}
                  initialData={editingCertificate}
                  isSubmitting={isSubmitting}
                  onCancel={() => { setIsModalOpen(false); setEditingCertificate(undefined); }}
                />
              </DialogContent>
            </Dialog>
          )}
          <ExportButton />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
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
          <Label htmlFor="kodeFilter" className="text-sm font-medium">Filter by Kode</Label>
          <Select value={kodeFilter} onValueChange={setKodeFilter}>
            <SelectTrigger id="kodeFilter" className="w-full mt-1"><SelectValue placeholder="All Kode" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Kode</SelectItem>
              {KODE_CERTIFICATE_OPTIONS.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="suratHakFilter" className="text-sm font-medium">Filter by Surat Hak</Label>
          <Select value={suratHakFilter} onValueChange={setSuratHakFilter}>
            <SelectTrigger id="suratHakFilter" className="w-full mt-1"><SelectValue placeholder="All Surat Hak" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Surat Hak</SelectItem>
              {SURAT_HAK_OPTIONS.map(option => <SelectItem key={option} value={option}>{option}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <CertificateTable
        certificates={filteredAndSortedCertificates}
        onEdit={canManage ? handleEditCertificate : undefined}
        onDelete={canManage ? handleDeleteCertificate : undefined}
        sortConfig={sortConfig}
        handleSort={handleSort}
      />
    </div>
  );
}
