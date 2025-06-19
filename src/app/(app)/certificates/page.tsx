
"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { CertificateTable } from '@/components/certificates/CertificateTable';
import { CertificateForm } from '@/components/certificates/CertificateForm';
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
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";

export default function CertificatesPage() {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCertificate, setEditingCertificate] = useState<Certificate | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load mock certificates on the client side to avoid hydration mismatch
    setCertificates(mockCertificates);
  }, []);

  const filteredCertificates = useMemo(() => {
    if (!certificates) {
      return []; // Return empty array if certificates are not yet loaded
    }
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

  const handleEditCertificate = useCallback((certificate: Certificate) => {
    setEditingCertificate(certificate);
    setIsModalOpen(true);
  }, []);

  const handleDeleteCertificate = useCallback((certificateId: string) => {
    setCertificates(prev => prev ? prev.filter(cert => cert.id !== certificateId) : null);
    toast({ variant: "destructive", title: "Certificate Deleted", description: `Certificate ID ${certificateId} has been removed.` });
  }, [toast, setCertificates]);

  const handleFormSubmit = useCallback(async (data: any) => {
    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call

    setCertificates(prevCertificates => {
      const currentCertificates = prevCertificates || [];
      if (editingCertificate) {
        toast({ title: "Certificate Updated", description: `Certificate ${data.kode} has been updated.` });
        return currentCertificates.map(cert => cert.id === editingCertificate.id ? { ...cert, ...data, id: cert.id } : cert);
      } else {
        const newCertificate: Certificate = { ...data, id: `cert-${Date.now()}` };
        toast({ title: "Certificate Added", description: `Certificate ${data.kode} has been added.` });
        return [newCertificate, ...currentCertificates];
      }
    });

    setIsSubmitting(false);
    setIsModalOpen(false);
    setEditingCertificate(undefined);
  }, [editingCertificate, toast, setCertificates, setIsSubmitting, setIsModalOpen, setEditingCertificate]);
  
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
            />
             {/* Add DialogClose to the form's cancel button or handle close explicitly */}
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
        certificates={filteredCertificates}
        onEdit={handleEditCertificate}
        onDelete={handleDeleteCertificate}
      />
    </div>
  );
}
