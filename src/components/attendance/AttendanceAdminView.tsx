
"use client";

import React, { useState, useMemo, useCallback } from 'react';
import type { Attendance, User } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/contexts/AuthContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Filter } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { AttendanceTable } from './AttendanceTable';
import { AttendanceForm } from './AttendanceForm';
import { deleteAttendance, updateAttendance } from '@/lib/actions';
import { ExportAttendanceButton } from './ExportAttendanceButton';

interface AttendanceAdminViewProps {
  initialRecords: Attendance[];
  users: User[];
  onDataRefresh: () => void;
}

export function AttendanceAdminView({ initialRecords, users, onDataRefresh }: AttendanceAdminViewProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [records, setRecords] = useState(initialRecords);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Attendance | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filtering state
  const [userFilter, setUserFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<DateRange | undefined>();

  const filteredRecords = useMemo(() => {
    return records
      .filter(record => userFilter === 'all' || record.userId === userFilter)
      .filter(record => {
        if (!dateFilter || (!dateFilter.from && !dateFilter.to)) return true;
        const recordDate = new Date(record.date);
        const from = dateFilter.from ? new Date(dateFilter.from).setHours(0,0,0,0) : null;
        const to = dateFilter.to ? new Date(dateFilter.to).setHours(23,59,59,999) : from;
        if (from && to) return recordDate >= from && recordDate <= to;
        if (from) return recordDate >= from;
        if (to) return recordDate <= to;
        return true;
      });
  }, [records, userFilter, dateFilter]);
  
  const handleEdit = useCallback((record: Attendance) => {
    setEditingRecord(record);
    setIsModalOpen(true);
  }, []);

  const handleDelete = useCallback(async (id: string) => {
    if (!user) return;
    try {
      await deleteAttendance(id, user.name || user.email);
      toast({ variant: 'destructive', title: "Record Deleted", description: "Attendance record has been removed." });
      onDataRefresh(); // Refresh data from parent
    } catch (error) {
      toast({ variant: 'destructive', title: "Error", description: error instanceof Error ? error.message : "Failed to delete record." });
    }
  }, [user, toast, onDataRefresh]);

  const handleFormSubmit = useCallback(async (data: { checkIn: Date; checkOut: Date | null }) => {
    if (!editingRecord || !user) return;
    setIsSubmitting(true);
    try {
      await updateAttendance(editingRecord.id, data, user.name || user.email);
      toast({ title: "Record Updated", description: "Attendance record has been updated." });
      onDataRefresh();
      setIsModalOpen(false);
      setEditingRecord(undefined);
    } catch (error) {
      toast({ variant: "destructive", title: "Save Failed", description: error instanceof Error ? error.message : "Failed to save record." });
    } finally {
      setIsSubmitting(false);
    }
  }, [editingRecord, user, toast, onDataRefresh]);
  
  // Update local state when initialRecords change
  useEffect(() => {
    setRecords(initialRecords);
  }, [initialRecords]);


  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label htmlFor="userFilter" className="sr-only">Filter by User</Label>
            <Select value={userFilter} onValueChange={setUserFilter}>
              <SelectTrigger id="userFilter" className="w-[180px]">
                <SelectValue placeholder="Filter by User" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {users.map(u => <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="dateFilter" className="sr-only">Filter by Date</Label>
             <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="date"
                  variant={"outline"}
                  className={cn("w-[260px] justify-start text-left font-normal", !dateFilter && "text-muted-foreground")}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dateFilter?.from ? (
                    dateFilter.to ? (
                      <>
                        {format(dateFilter.from, "LLL dd, y")} - {format(dateFilter.to, "LLL dd, y")}
                      </>
                    ) : (
                      format(dateFilter.from, "LLL dd, y")
                    )
                  ) : (
                    <span>Pick a date range</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  initialFocus
                  mode="range"
                  defaultMonth={dateFilter?.from}
                  selected={dateFilter}
                  onSelect={setDateFilter}
                  numberOfMonths={2}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        <ExportAttendanceButton />
      </div>

      <AttendanceTable 
        records={filteredRecords}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <Dialog open={isModalOpen} onOpenChange={(open) => { setIsModalOpen(open); if (!open) setEditingRecord(undefined); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Attendance</DialogTitle>
            <DialogDescription>
              Modify the check-in or check-out time for {editingRecord?.user.name} on {editingRecord ? format(new Date(editingRecord.date), 'PPP') : ''}.
            </DialogDescription>
          </DialogHeader>
          <AttendanceForm
            onSubmit={handleFormSubmit}
            initialData={editingRecord}
            isSubmitting={isSubmitting}
            onCancel={() => setIsModalOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
