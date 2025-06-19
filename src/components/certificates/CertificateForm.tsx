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
import type { Certificate } from '@/lib/types';
import { cn } from '@/lib/utils';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const certificateSchema = z.object({
  kode: z.string().min(1, "Kode is required"),
  nama_pemegang: z.string().min(1, "Nama Pemegang is required"),
  surat_hak: z.string().min(1, "Surat Hak is required"),
  no_sertifikat: z.string().min(1, "No Sertifikat is required"),
  lokasi_tanah: z.string().min(1, "Lokasi Tanah is required"),
  luas_m2: z.coerce.number().int().positive("Luas M2 must be a positive number"),
  tgl_terbit: z.date({ required_error: "Tanggal Terbit is required" }),
  surat_ukur: z.string().min(1, "Surat Ukur is required"),
  nib: z.string().min(1, "NIB is required"),
  pendaftaran_pertama: z.date({ required_error: "Pendaftaran Pertama is required" }),
});

type CertificateFormData = z.infer<typeof certificateSchema>;

interface CertificateFormProps {
  onSubmit: (data: CertificateFormData) => void;
  initialData?: Partial<Certificate>;
  isSubmitting?: boolean;
}

export function CertificateForm({ onSubmit, initialData, isSubmitting }: CertificateFormProps) {
  const form = useForm<CertificateFormData>({
    resolver: zodResolver(certificateSchema),
    defaultValues: {
      ...initialData,
      luas_m2: initialData?.luas_m2 || 0,
      tgl_terbit: initialData?.tgl_terbit ? new Date(initialData.tgl_terbit) : undefined,
      pendaftaran_pertama: initialData?.pendaftaran_pertama ? new Date(initialData.pendaftaran_pertama) : undefined,
    },
  });

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
                <FormControl>
                  <Input placeholder="e.g., K001" {...field} />
                </FormControl>
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
                <FormControl>
                  <Input placeholder="e.g., SHM" {...field} />
                </FormControl>
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
                  <Input type="number" placeholder="e.g., 150" {...field} />
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
            <Button type="button" variant="outline" onClick={() => form.reset()} className="w-full sm:w-auto">Cancel</Button>
            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
              {isSubmitting ? 'Submitting...' : (initialData?.id ? 'Update Certificate' : 'Add Certificate')}
            </Button>
        </div>
      </form>
    </Form>
  );
}
