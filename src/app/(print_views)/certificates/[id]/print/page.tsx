'use client';

import React, { useState, useEffect } from 'react';
import { getCertificateById } from '@/lib/server-actions/certificate';
import type { Certificate } from '@/lib/types';
import { Loader2, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { id as localeID } from 'date-fns/locale';
import { useToast } from '@/hooks/use-toast';

export default function CertificatePrintPage({ params }: { params: { id: string } }) {
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const [printDate, setPrintDate] = useState<Date | null>(null);

  useEffect(() => {
    const fetchCertificate = async () => {
      try {
        const certData = await getCertificateById(params.id);
        setCertificate(certData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to load certificate data.';
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
    fetchCertificate();
  }, [params.id, toast]);

  useEffect(() => {
    setPrintDate(new Date());
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-200">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Memuat data sertifikat...</p>
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

  if (!certificate) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-200">
        <p>Sertifikat tidak ditemukan.</p>
      </div>
    );
  }

  const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
    <tr className="border-b">
      <th scope="row" className="w-1/3 px-4 py-3 text-left font-semibold text-gray-600 align-top">{label}</th>
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
          <h1 className="text-3xl font-bold text-gray-900 text-center font-headline">DETAIL SERTIFIKAT</h1>
        </header>

        <section>
          <table className="w-full border-collapse">
            <tbody>
              <DetailRow label="Kode" value={certificate.kode} />
              <DetailRow label="Nomor Sertifikat" value={certificate.no_sertifikat} />
              <DetailRow label="NIB" value={certificate.nib} />
              <DetailRow label="Surat Hak" value={certificate.surat_hak} />
              <DetailRow label="Tanggal Terbit" value={format(new Date(certificate.tgl_terbit), 'dd MMMM yyyy', { locale: localeID })} />
              <DetailRow label="Pendaftaran Pertama" value={format(new Date(certificate.pendaftaran_pertama), 'dd MMMM yyyy', { locale: localeID })} />
              <DetailRow label="Luas (m²)" value={certificate.luas_m2.toLocaleString('id-ID')} />
              <DetailRow label="Surat Ukur" value={certificate.surat_ukur} />
              <DetailRow label="Lokasi Tanah" value={<p className="whitespace-pre-wrap">{certificate.lokasi_tanah}</p>} />
              <DetailRow 
                label="Nama Pemegang Hak" 
                value={
                  Array.isArray(certificate.nama_pemegang) && certificate.nama_pemegang.length > 0 ? (
                    <ul className="list-disc list-inside">
                      {certificate.nama_pemegang.map((name, index) => (
                        <li key={index}>{name}</li>
                      ))}
                    </ul>
                  ) : (
                    'Tidak ada data'
                  )
                } 
              />
            </tbody>
          </table>
        </section>
        
        <footer className="mt-16 pt-8 text-center text-sm text-gray-500 hidden print:block">
          {printDate && `Dicetak pada: ${format(printDate, 'dd MMMM yyyy, HH:mm:ss', { locale: localeID })}`}
        </footer>
      </main>
    </div>
  );
}
