
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Attendance, User } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { AttendanceDashboard } from '@/components/attendance/AttendanceDashboard';
import { AttendanceAdminView } from '@/components/attendance/AttendanceAdminView';
import { getTodaysAttendanceForUser, getUserAttendanceHistory, getAttendanceRecords, getUsers as getAllUsers } from '@/lib/actions';

export default function AttendancePage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  
  const [todaysAttendance, setTodaysAttendance] = useState<Attendance | null | undefined>(undefined);
  const [attendanceHistory, setAttendanceHistory] = useState<Attendance[]>([]);
  const [allAttendance, setAllAttendance] = useState<Attendance[] | null>(null);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [pageLoading, setPageLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setPageLoading(true);

    try {
      if (user.role === 'admin') {
        const [records, users] = await Promise.all([
          getAttendanceRecords(),
          getAllUsers(),
        ]);
        setAllAttendance(records);
        setAllUsers(users);
      } else {
        const [today, history] = await Promise.all([
          getTodaysAttendanceForUser(user.id),
          getUserAttendanceHistory(user.id),
        ]);
        setTodaysAttendance(today);
        setAttendanceHistory(history);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load attendance data.",
      });
    } finally {
      setPageLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    if (!authLoading) {
      fetchData();
    }
  }, [authLoading, fetchData]);

  if (authLoading || pageLoading) {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return null; // Should be redirected by layout
  }
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-semibold">Attendance</h1>
      {user.role === 'admin' ? (
        <AttendanceAdminView 
          initialRecords={allAttendance ?? []} 
          users={allUsers}
          onDataRefresh={fetchData} 
        />
      ) : (
        <AttendanceDashboard
          todaysAttendance={todaysAttendance}
          attendanceHistory={attendanceHistory}
          onAttendanceUpdate={fetchData}
        />
      )}
    </div>
  );
}
