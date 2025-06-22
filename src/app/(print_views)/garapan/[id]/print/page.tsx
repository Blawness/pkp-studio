'use client';

import React, { useState, useEffect } from 'react';
import { getTanahGarapanEntryById } from '@/lib/server-actions/tanahGarapan';
import type { TanahGarapanEntry } from '@/lib/types';
import { Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function TanahGarapanPrintPage({ params }: { params: { id: string } }) {
  const [entry, setEntry] = useState<TanahGarapanEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const fetchEntry = async () => {
      try {
        const entryData = await getTanahGarapanEntryById(params.id);
        setEntry(entryData);
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
    fetchEntry();
  }, [params.id, toast]);

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

  if (!entry) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-200">
        <p>Data tanah garapan tidak ditemukan.</p>
      </div>
    );
  }

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <tr className="border-b last:border-b-0">
      <th scope="row" className="w-1/3 px-4 py-3 text-left font-medium text-gray-700 align-top">{label}</th>
      <td className="w-2/3 px-4 py-3 text-gray-800">{value}</td>
    </tr>
  );

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
          <h1 className="text-3xl font-bold text-gray-900 text-center font-headline">DETAIL DATA TANAH GARAPAN</h1>
        </header>

        <section>
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full border-collapse">
              <tbody>
                <DetailRow label="Letak Tanah" value={entry.letakTanah} />
                <DetailRow label="Nama Pemegang Hak" value={entry.namaPemegangHak} />
                <DetailRow label="Letter C" value={entry.letterC} />
                <DetailRow label="Nomor Surat Keterangan Garapan" value={entry.nomorSuratKeteranganGarapan} />
                <DetailRow label="Luas (m²)" value={entry.luas.toLocaleString('id-ID')} />
                <DetailRow label="Keterangan" value={<p className="whitespace-pre-wrap">{entry.keterangan || '-'}</p>} />
                <DetailRow label="Tanggal Dibuat" value={format(new Date(entry.createdAt), 'dd MMMM yyyy, HH:mm:ss', { locale: localeID })} />
                <DetailRow label="Tanggal Diperbarui" value={format(new Date(entry.updatedAt), 'dd MMMM yyyy, HH:mm:ss', { locale: localeID })} />
              </tbody>
            </table>
          </div>
        </section>
        
        <footer className="mt-16 pt-8 text-center text-sm text-gray-500 hidden print:block">
          Dicetak pada: {format(new Date(), 'dd MMMM yyyy, HH:mm:ss', { locale: localeID })}
        </footer>
      </main>
    </div>
  );
}
