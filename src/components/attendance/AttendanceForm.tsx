
"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Attendance } from '@/lib/types';
import { format, parse } from 'date-fns';

const attendanceFormSchema = z.object({
  checkIn: z.date({ required_error: "Check-in time is required" }),
  checkOut: z.date().nullable(),
}).refine(data => !data.checkOut || data.checkOut > data.checkIn, {
  message: "Check-out time must be after check-in time.",
  path: ['checkOut'],
});

type AttendanceFormData = z.infer<typeof attendanceFormSchema>;

interface AttendanceFormProps {
  onSubmit: (data: AttendanceFormData) => void;
  initialData?: Attendance;
  isSubmitting?: boolean;
  onCancel: () => void;
}

// Helper to combine date and time string into a Date object
const combineDateAndTime = (datePart: Date, timePart: string): Date => {
  const [hours, minutes, seconds] = timePart.split(':').map(Number);
  const newDate = new Date(datePart);
  newDate.setHours(hours, minutes, seconds || 0);
  return newDate;
};

export function AttendanceForm({ onSubmit, initialData, isSubmitting, onCancel }: AttendanceFormProps) {
  const form = useForm<AttendanceFormData>({
    resolver: zodResolver(attendanceFormSchema),
    defaultValues: {
      checkIn: initialData?.checkIn ? new Date(initialData.checkIn) : new Date(),
      checkOut: initialData?.checkOut ? new Date(initialData.checkOut) : null,
    },
  });

  if (!initialData) return null;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="checkIn"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Check-in Time</FormLabel>
              <FormControl>
                 <Input 
                    type="time" 
                    step="1"
                    value={format(field.value, 'HH:mm:ss')}
                    onChange={(e) => field.onChange(combineDateAndTime(new Date(initialData.date), e.target.value))}
                  />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="checkOut"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Check-out Time (optional)</FormLabel>
              <FormControl>
                <div className="flex items-center gap-2">
                  <Input 
                    type="time" 
                    step="1"
                    value={field.value ? format(field.value, 'HH:mm:ss') : ''}
                    onChange={(e) => field.onChange(e.target.value ? combineDateAndTime(new Date(initialData.date), e.target.value) : null)}
                  />
                  <Button type="button" variant="ghost" onClick={() => field.onChange(null)}>Clear</Button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
