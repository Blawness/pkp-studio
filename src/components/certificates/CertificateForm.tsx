
"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Certificate } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import type { Timestamp } from 'firebase-admin/firestore';

const kodeOptions = ["LPN01", "PKP01"] as const;
const suratHakOptions = [
  "SHM",
  "Hak Guna Usaha",
  "Hak Guna Bangunana",
  "Hak Pakai",
  "Hak Pengelolaan",
  "Hak Wakaf"
] as const;


const certificateSchema = z.object({
  kode: z.enum(kodeOptions, { required_error: "Kode is required" }),
  nama_pemegang: z.string().min(1, "Nama Pemegang is required"),
  surat_hak: z.enum(suratHakOptions, { required_error: "Surat Hak is required" }),
  no_sertifikat: z.string().min(1, "No Sertifikat is required"),
  lokasi_tanah: z.string().min(1, "Lokasi Tanah is required"),
  luas_m2: z.coerce.number().int().positive("Luas M2 must be a positive number"),
  tgl_terbit: z.date({ required_error: "Tanggal Terbit is required" }),
  surat_ukur: z.string().min(1, "Surat Ukur is required"),
  nib: z.string().min(1, "NIB is required"),
  pendaftaran_pertama: z.date({ required_error: "Pendaftaran Pertama is required" }),
});

export type CertificateFormData = z.infer<typeof certificateSchema>;

// This interface is for the data structure when communicating with the Data Connect backend.
// Note: Date fields are expected as Timestamps or ISO strings by Data Connect.
export interface CertificateMutationInput {
  kode: typeof kodeOptions[number];
  nama_pemegang: string;
  surat_hak: typeof suratHakOptions[number];
  no_sertifikat: string;
  lokasi_tanah: string;
  luas_m2: number;
  tgl_terbit: Date | Timestamp | string; // Allow Date for form, Timestamp/string for backend
  surat_ukur: string;
  nib: string;
  pendaftaran_pertama: Date | Timestamp | string; // Allow Date for form, Timestamp/string for backend
  id?: string; // Optional for updates
}


interface CertificateFormProps {
  onSubmit: (data: CertificateFormData) => void; // Keep this as CertificateFormData for form handling
  initialData?: Partial<Certificate>; // This can be the richer Certificate type from DataConnect
  isSubmitting?: boolean;
  onCancel?: () => void;
}

export function CertificateForm({ onSubmit, initialData, isSubmitting, onCancel }: CertificateFormProps) {
  const form = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      kode: initialData?.kode ? (kodeOptions.includes(initialData.kode as any) ? initialData.kode as typeof kodeOptions[number] : undefined) : undefined,
      nama_pemegang: initialData?.nama_pemegang || '',
      surat_hak: initialData?.surat_hak ? (suratHakOptions.includes(initialData.surat_hak as any) ? initialData.surat_hak as typeof suratHakOptions[number] : undefined) : undefined,
      no_sertifikat: initialData?.no_sertifikat || '',
      lokasi_tanah: initialData?.lokasi_tanah || '',
      luas_m2: initialData?.luas_m2 || 0,
      // Convert Firestore Timestamp or string to Date for the form
      tgl_terbit: initialData?.tgl_terbit ? (initialData.tgl_terbit instanceof Date ? initialData.tgl_terbit : new Date( (initialData.tgl_terbit as Timestamp)?.toDate?.() || initialData.tgl_terbit as string )) : undefined,
      surat_ukur: initialData?.surat_ukur || '',
      nib: initialData?.nib || '',
      pendaftaran_pertama: initialData?.pendaftaran_pertama ? (initialData.pendaftaran_pertama instanceof Date ? initialData.pendaftaran_pertama : new Date( (initialData.pendaftaran_pertama as Timestamp)?.toDate?.() || initialData.pendaftaran_pertama as string )) : undefined,
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
            name="kode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Kode</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Kode" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {kodeOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nama_pemegang"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nama Pemegang</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="surat_hak"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surat Hak</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Surat Hak" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {suratHakOptions.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="no_sertifikat"
            render={({ field }) => (
              <FormItem>
                <FormLabel>No. Sertifikat</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., SERT-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="luas_m2"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Luas (M2)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="e.g., 150" {...field} onChange={e => field.onChange(parseInt(e.target.value,10) || 0)} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tgl_terbit"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Tanggal Terbit</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="surat_ukur"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Surat Ukur</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., SU001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="nib"
            render={({ field }) => (
              <FormItem>
                <FormLabel>NIB</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., NIB001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pendaftaran_pertama"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Pendaftaran Pertama</FormLabel>
                 <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date("1900-01-01")
                      }
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="lokasi_tanah"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Lokasi Tanah</FormLabel>
                <FormControl>
                  <Textarea placeholder="e.g., Jl. Merdeka No. 10, Jakarta" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? 'Submitting...' : (initialData?.id ? 'Update Certificate' : 'Add Certificate')}
            </Button>
        </div>
      </form>
    </Form>
  );
}


    