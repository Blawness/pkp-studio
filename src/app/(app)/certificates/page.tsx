
"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { CertificateTable } from '@/components/certificates/CertificateTable';
import { CertificateForm } from '@/components/certificates/CertificateForm';
// Use generated types from Data Connect SDK
import type { Certificate as GeneratedCertificate, CertificateCreateInput, CertificateUpdateInput } from '@firebasegen/default-connector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, PlusCircle, RefreshCw } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
  DialogClose, // Import DialogClose
} from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import { 
  useListCertificatesQuery, 
  useCreateCertificateMutation, 
  useUpdateCertificateMutation, 
  useDeleteCertificateMutation 
} from '@firebasegen/default-connector/react'; // Adjusted import path

// Adapt GeneratedCertificate to local Certificate type if needed, or use GeneratedCertificate directly
// For simplicity, we'll adapt the data for the table. The form will use stricter types.
export interface DisplayCertificate extends Omit<GeneratedCertificate, 'tgl_terbit' | 'pendaftaran_pertama' | 'createdAt' | 'updatedAt'> {
  id: string; // Ensure id is string, DataConnect uses 'kode' as id for Certificate
  tgl_terbit: Date;
  pendaftaran_pertama: Date;
  createdAt?: Date;
  updatedAt?: Date;
  actions?: boolean;
}


export default function CertificatesPage() {
  const { toast } = useToast();
  
  const { data: certificatesData, isLoading, error, refetch } = useListCertificatesQuery({});
  
  const createCertificateMutation = useCreateCertificateMutation();
  const updateCertificateMutation = useUpdateCertificateMutation();
  const deleteCertificateMutation = useDeleteCertificateMutation();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<DisplayCertificate | undefined>(undefined);

  const certificates = useMemo(() => {
    if (!certificatesData?.listCertificates) return [];
    return certificatesData.listCertificates.map(cert => ({
      ...cert,
      id: cert.kode, // Use kode as id for display consistency if needed
      tgl_terbit: new Date(cert.tgl_terbit),
      pendaftaran_pertama: new Date(cert.pendaftaran_pertama),
      createdAt: cert.createdAt ? new Date(cert.createdAt) : undefined,
      updatedAt: cert.updatedAt ? new Date(cert.updatedAt) : undefined,
    }));
  }, [certificatesData]);

  const filteredCertificates = useMemo(() => {
    return certificates.filter(cert =>
      Object.values(cert).some(value =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [certificates, searchTerm]);

  const handleAddCertificate = useCallback(() => {
    setEditingCertificate(undefined);
    setIsModalOpen(true);
  }, []);

  const handleEditCertificate = useCallback((certificate: DisplayCertificate) => {
    setEditingCertificate(certificate);
    setIsModalOpen(true);
  }, []);

  const handleDeleteCertificate = useCallback(async (certificateKode: string) => {
    try {
      await deleteCertificateMutation.mutateAsync({ kode: certificateKode });
      toast({ variant: "destructive", title: "Certificate Deleted", description: `Certificate with kode ${certificateKode} has been removed.` });
      refetch(); // Refetch list after deletion
    } catch (e: any) {
      toast({ variant: "destructive", title: "Deletion Failed", description: e.message || "Could not delete certificate." });
    }
  }, [deleteCertificateMutation, toast, refetch]);

  const handleFormSubmit = useCallback(async (data: CertificateCreateInput | Omit<CertificateUpdateInput, 'id'>) => { // Omit id from update input type here as kode is used
    try {
      if (editingCertificate) {
        const updateData: CertificateUpdateInput = {
          kode: editingCertificate.kode, // Use kode from editingCertificate
          ...(data as Omit<CertificateUpdateInput, 'kode'>), // Cast data, ensuring kode isn't duplicated from data
        };
        await updateCertificateMutation.mutateAsync(updateData);
        toast({ title: "Certificate Updated", description: `Certificate ${updateData.kode} has been updated.` });
      } else {
        await createCertificateMutation.mutateAsync(data as CertificateCreateInput);
        toast({ title: "Certificate Added", description: `Certificate ${(data as CertificateCreateInput).kode} has been added.` });
      }
      refetch(); // Refetch list after creation/update
      setIsModalOpen(false);
      setEditingCertificate(undefined);
    } catch (e: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: e.message || "Could not save certificate." });
    }
  }, [editingCertificate, createCertificateMutation, updateCertificateMutation, toast, refetch]);
  
  if (isLoading) {
    return (
      <div className="flex flex-col flex-1 space-y-8 items-center justify-center">
        <RefreshCw className="mr-2 h-8 w-8 animate-spin text-primary" />
        <p>Loading certificates...</p>
      </div>
    );
  }

  if (error) {
     return (
      <div className="flex flex-col flex-1 space-y-8 items-center justify-center text-destructive">
        <p>Error loading certificates: {error.message}</p>
        <Button onClick={() => refetch()}>Try Again</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-headline font-semibold">Certificate Management</h1>
        <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingCertificate(undefined); }}>
          <DialogTrigger asChild>
            <Button onClick={handleAddCertificate} className="w-full sm:w-auto">
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
              isSubmitting={createCertificateMutation.isPending || updateCertificateMutation.isPending}
              onCancel={() => setIsModalOpen(false)} // Pass cancel handler
            />
          </DialogContent>
        </Dialog>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search certificates..."
          className="pl-10 w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <CertificateTable
        certificates={filteredCertificates as any[]} // Cast to any[] if DisplayCertificate causes issues with table props
        onEdit={handleEditCertificate as any}
        onDelete={handleDeleteCertificate}
      />
    </div>
  );
}
