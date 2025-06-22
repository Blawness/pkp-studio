
"use client";

import React, { useState, useMemo, useCallback, useEffect } from 'react';
import type { TanahGarapanEntry } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit3, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TanahGarapanForm, type TanahGarapanFormData } from '@/components/tanah-garapan/TanahGarapanForm';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { getTanahGarapanEntries, addTanahGarapanEntry, updateTanahGarapanEntry, deleteTanahGarapanEntry } from '@/lib/actions';

interface GroupedTanahGarapanData {
  [key: string]: {
    totalLuas: number;
    entries: TanahGarapanEntry[];
  };
}

export default function TanahGarapanPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [entries, setEntries] = useState<TanahGarapanEntry[] | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TanahGarapanEntry | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeAccordionItem, setActiveAccordionItem] = useState<string | undefined>(undefined);

  const canManage = user?.role === 'admin' || user?.role === 'manager';

  const fetchTanahGarapanEntries = useCallback(async () => {
    try {
      const fetchedEntries = await getTanahGarapanEntries();
      setEntries(fetchedEntries);
    } catch (error) {
      console.error("Failed to fetch Tanah Garapan entries:", error);
      toast({
        title: "Error",
        description: "Failed to load Tanah Garapan data.",
        variant: "destructive",
      });
      setEntries([]);
    }
  }, [toast]);

  useEffect(() => {
    fetchTanahGarapanEntries();
  }, [fetchTanahGarapanEntries]);

  const groupedData: GroupedTanahGarapanData = useMemo(() => {
    if (!entries) return {};
    return entries.reduce((acc, entry) => {
      const groupKey = entry.letakTanah;
      if (!acc[groupKey]) {
        acc[groupKey] = { totalLuas: 0, entries: [] };
      }
      acc[groupKey].totalLuas += entry.luas;
      acc[groupKey].entries.push(entry);
      acc[groupKey].entries.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      return acc;
    }, {} as GroupedTanahGarapanData);
  }, [entries]);

  const sortedGroupKeys = useMemo(() => {
    return Object.keys(groupedData).sort((a, b) => a.localeCompare(b));
  }, [groupedData]);

  const handleAddEntry = useCallback(() => {
    setEditingEntry(undefined);
    setIsModalOpen(true);
  }, []);

  const handleEditEntry = useCallback((entry: TanahGarapanEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
    setActiveAccordionItem(entry.letakTanah);
  }, []);

  const handleDeleteEntry = useCallback(async (entryId: string) => {
    if (!user || !canManage) return;
    setIsSubmitting(true);
    try {
      await deleteTanahGarapanEntry(entryId, user.name || user.email);
      toast({ variant: "destructive", title: "Data Dihapus", description: `Data tanah garapan telah dihapus.` });
      fetchTanahGarapanEntries();
    } catch (error) {
      console.error("Failed to delete Tanah Garapan entry:", error);
      toast({ variant: "destructive", title: "Error", description: `Gagal menghapus data tanah garapan.` });
    } finally {
      setIsSubmitting(false);
    }
  }, [toast, fetchTanahGarapanEntries, user, canManage]);

  const handleFormSubmit = useCallback(async (data: TanahGarapanFormData) => {
    if (!user || !canManage) return;
    setIsSubmitting(true);
    try {
      const userName = user.name || user.email;
      if (editingEntry) {
        await updateTanahGarapanEntry(editingEntry.id, data, userName);
        toast({ title: "Data Diperbarui", description: `Data untuk ${data.letakTanah} telah diperbarui.` });
      } else {
        await addTanahGarapanEntry(data, userName);
        toast({ title: "Data Ditambahkan", description: `Data baru untuk ${data.letakTanah} telah ditambahkan.` });
        setActiveAccordionItem(data.letakTanah);
      }
      fetchTanahGarapanEntries();
    } catch (error) {
      console.error("Failed to save Tanah Garapan entry:", error);
      toast({ variant: "destructive", title: "Error", description: `Gagal menyimpan data.` });
    } finally {
      setIsSubmitting(false);
      setIsModalOpen(false);
      setEditingEntry(undefined);
    }
  }, [editingEntry, toast, fetchTanahGarapanEntries, user, canManage]);

  if (entries === null) {
    return (
      <div className="flex flex-col flex-1 space-y-8 items-center justify-center">
        <p>Memuat data tanah garapan...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h1 className="text-3xl font-headline font-semibold">Data Tanah Garapan</h1>
        {canManage && (
          <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingEntry(undefined); }}>
            <DialogTrigger asChild>
              <Button onClick={handleAddEntry}>
                <PlusCircle className="mr-2 h-4 w-4" /> Tambah Data
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="font-headline">{editingEntry ? 'Edit Data' : 'Tambah Data Baru'}</DialogTitle>
                <DialogDescription>{editingEntry ? 'Perbarui detail data.' : 'Isi formulir untuk menambah data baru.'}</DialogDescription>
              </DialogHeader>
              <TanahGarapanForm
                onSubmit={handleFormSubmit}
                initialData={editingEntry}
                isSubmitting={isSubmitting}
                onCancel={() => { setIsModalOpen(false); setEditingEntry(undefined); }}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {Object.keys(groupedData).length === 0 ? (
         <Card className="mt-4"><CardContent className="p-6 text-center">
            <p className="text-muted-foreground">Belum ada data tanah garapan.</p>
          </CardContent></Card>
      ) : (
        <Accordion type="single" collapsible className="w-full space-y-2" value={activeAccordionItem} onValueChange={setActiveAccordionItem}>
          {sortedGroupKeys.map((groupKey) => (
            <AccordionItem value={groupKey} key={groupKey} className="border rounded-lg shadow-sm bg-card">
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full">
                    <span className="font-semibold text-lg">Letak Tanah: {groupKey}</span>
                    <span className="text-sm text-muted-foreground md:ml-4">
                        Total Luas: {groupedData[groupKey].totalLuas.toLocaleString()} m² ({groupedData[groupKey].entries.length} entri)
                    </span>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-0">
                <div className="space-y-3 mt-2">
                  {groupedData[groupKey].entries.map((entry) => (
                    <Card key={entry.id} className="p-4 shadow-sm">
                      <CardHeader className="p-0 mb-2">
                        <CardTitle className="text-base font-medium">Pemegang Hak: {entry.namaPemegangHak}</CardTitle>
                        <CardDescription className="text-xs">Ditambahkan: {new Date(entry.createdAt).toLocaleDateString()}</CardDescription>
                      </CardHeader>
                      <CardContent className="p-0 text-sm space-y-1">
                        <p><strong>Letter C:</strong> {entry.letterC}</p>
                        <p><strong>No. Surat Ket. Garapan:</strong> {entry.nomorSuratKeteranganGarapan}</p>
                        <p><strong>Luas:</strong> {entry.luas.toLocaleString()} m²</p>
                        {entry.keterangan && <p><strong>Keterangan:</strong> {entry.keterangan}</p>}
                      </CardContent>
                      {canManage && (
                        <div className="flex justify-end gap-2 mt-3">
                          <Button variant="outline" size="sm" onClick={() => handleEditEntry(entry)}><Edit3 className="mr-1 h-3 w-3" /> Edit</Button>
                          <Button variant="destructive" size="sm" onClick={() => handleDeleteEntry(entry.id)}><Trash2 className="mr-1 h-3 w-3" /> Hapus</Button>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}
    </div>
  );
}
