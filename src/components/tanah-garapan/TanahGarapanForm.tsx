
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { TanahGarapanEntry } from '@/lib/types';

const tanahGarapanSchema = z.object({
  letakTanah: z.string().min(1, "Letak Tanah is required"),
  namaPemegangHak: z.string().min(1, "Nama Pemegang Hak is required"),
  letterC: z.string().min(1, "Letter C is required"),
  nomorSuratKeteranganGarapan: z.string().min(1, "Nomor Surat Keterangan Garapan is required"),
  luas: z.coerce.number().positive({ message: "Luas must be a positive number" }),
  keterangan: z.string().optional(),
});

export type TanahGarapanFormData = z.infer<typeof tanahGarapanSchema>;

interface TanahGarapanFormProps {
  onSubmit: (data: TanahGarapanFormData) => void;
  initialData?: Partial<TanahGarapanEntry>;
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function TanahGarapanForm({ onSubmit, initialData, isSubmitting, onCancel }: TanahGarapanFormProps) {
  const form = useForm<TanahGarapanFormData>({
    resolver: zodResolver(tanahGarapanSchema),
    defaultValues: {
      letakTanah: initialData?.letakTanah || '',
      namaPemegangHak: initialData?.namaPemegangHak || '',
      letterC: initialData?.letterC || '',
      nomorSuratKeteranganGarapan: initialData?.nomorSuratKeteranganGarapan || '',
      luas: initialData?.luas || 0,
      keterangan: initialData?.keterangan || '',
    },
  });

  const handleCancel = () => {
    form.reset();
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
          <FormField
            control={form.control}
            name="letakTanah"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Letak Tanah</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Blok Sawah Utara" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="namaPemegangHak"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Pemegang Hak</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Budi Cahyono" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="letterC"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Letter C</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., C-123/IV" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nomorSuratKeteranganGarapan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. Surat Keterangan Garapan</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., SKG/001/DESA/2023" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="luas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Luas (m²)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 1500" {...field} onChange={e => field.onChange(parseInt(e.target.value, 10) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="keterangan"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Keterangan (Opsional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Deskripsi tambahan mengenai tanah garapan..." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">
            Batal
          </Button>
          <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
            {isSubmitting ? 'Menyimpan...' : (initialData?.id ? 'Perbarui Data' : 'Tambah Data')}
          </Button>
        </div>
      </form>
    </Form>
  );
}
