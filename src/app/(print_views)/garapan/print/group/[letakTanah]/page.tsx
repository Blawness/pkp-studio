
'use client';

import React, { useState, useEffect } from 'react';
import { getTanahGarapanEntriesByLetakTanah } from '@/lib/server-actions/tanahGarapan';
import type { TanahGarapanEntry } from '@/lib/types';
import { Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function TanahGarapanGroupPrintPage({ params }: { params: { letakTanah: string } }) {
  const [entries, setEntries] = useState<TanahGarapanEntry[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const decodedLetakTanah = decodeURIComponent(params.letakTanah);

  useEffect(() => {
    const fetchEntries = async () => {
      try {
        const entriesData = await getTanahGarapanEntriesByLetakTanah(decodedLetakTanah);
        setEntries(entriesData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load Tanah Garapan data.';
        setError(errorMessage);
        toast({
            variant: "destructive",
            title: "Error",
            description: errorMessage
        });
      } finally {
        setLoading(false);
      }
    };
    fetchEntries();
  }, [decodedLetakTanah, toast]);
  
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-200">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Memuat data tanah garapan...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-200 text-red-600">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!entries || entries.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-200">
        <p>Data tanah garapan tidak ditemukan.</p>
      </div>
    );
  }

  const totalLuas = entries.reduce((sum, entry) => sum + entry.luas, 0);

  return (
    <div className="bg-gray-200 p-4 md:p-8 font-sans">
      <div className="fixed top-4 right-4 print:hidden z-50">
        <Button onClick={() => window.print()}>
          <Printer className="mr-2 h-4 w-4" />
          Cetak
        </Button>
      </div>
      
      <main className="mx-auto w-full max-w-4xl md:w-[210mm] md:min-h-[297mm] bg-white p-8 md:p-12 shadow-lg">
        <header className="mb-10 border-b-2 border-gray-800 pb-4">
          <h1 className="text-3xl font-bold text-gray-900 text-center font-headline">DATA TANAH GARAPAN</h1>
          <h2 className="text-xl font-semibold text-gray-700 text-center mt-2">Letak Tanah: {decodedLetakTanah}</h2>
        </header>

        <section>
            <div className="border rounded-lg overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[5%]">No.</TableHead>
                            <TableHead>Pemegang Hak</TableHead>
                            <TableHead>Letter C</TableHead>
                            <TableHead>No. Surat</TableHead>
                            <TableHead className="text-right">Luas (m²)</TableHead>
                            <TableHead>Keterangan</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {entries.map((entry, index) => (
                            <TableRow key={entry.id}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{entry.namaPemegangHak}</TableCell>
                                <TableCell>{entry.letterC}</TableCell>
                                <TableCell>{entry.nomorSuratKeteranganGarapan}</TableCell>
                                <TableCell className="text-right">{entry.luas.toLocaleString('id-ID')}</TableCell>
                                <TableCell>{entry.keterangan || '-'}</TableCell>
                            </TableRow>
                        ))}
                         <TableRow className="font-bold bg-gray-50">
                            <TableCell colSpan={4} className="text-right">Total Luas</TableCell>
                            <TableCell className="text-right">{totalLuas.toLocaleString('id-ID')}</TableCell>
                            <TableCell></TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
            </div>
        </section>
        
        <footer className="mt-16 pt-8 text-center text-sm text-gray-500 hidden print:block">
          Dicetak pada: {format(new Date(), 'dd MMMM yyyy, HH:mm:ss', { locale: localeID })}
        </footer>
      </main>
    </div>
  );
}
