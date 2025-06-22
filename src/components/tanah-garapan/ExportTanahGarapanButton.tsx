
'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Loader2, Download } from 'lucide-react';
import { exportTanahGarapanToCSV } from '@/lib/actions';

export function ExportTanahGarapanButton() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  if (user?.role !== 'admin') {
    return null;
  }

  const handleExport = async () => {
    setIsExporting(true);
    toast({ title: 'Memulai Ekspor...', description: 'Sedang mempersiapkan file CSV Anda.' });

    try {
      const result = await exportTanahGarapanToCSV();
      if (result.error) {
        throw new Error(result.error);
      }

      if (result.data) {
        const blob = new Blob([result.data], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.setAttribute('download', `tanah-garapan-export-${timestamp}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        
        toast({ title: 'Ekspor Berhasil', description: 'File Anda telah diunduh.' });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.';
      toast({
        variant: 'destructive',
        title: 'Ekspor Gagal',
        description: errorMessage,
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button onClick={handleExport} disabled={isExporting} className="w-full sm:w-auto">
      {isExporting ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        <Download className="mr-2 h-4 w-4" />
      )}
      Ekspor ke CSV
    </Button>
  );
}
