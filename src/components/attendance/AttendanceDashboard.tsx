
"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Attendance } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, LogIn, LogOut } from 'lucide-react';
import { checkIn, checkOut } from '@/lib/actions';
import { format, formatDistanceToNow } from 'date-fns';

interface AttendanceDashboardProps {
  todaysAttendance: Attendance | null | undefined;
  attendanceHistory: Attendance[];
  onAttendanceUpdate: () => void;
}

export function AttendanceDashboard({ todaysAttendance, attendanceHistory, onAttendanceUpdate }: AttendanceDashboardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await checkIn(user.id, user.name || user.email);
      toast({ title: "Check-in Successful", description: "Welcome! Your attendance has been recorded." });
      onAttendanceUpdate();
    } catch (error) {
      toast({ variant: "destructive", title: "Check-in Failed", description: error instanceof Error ? error.message : "An unknown error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todaysAttendance || !user) return;
    setIsSubmitting(true);
    try {
      await checkOut(todaysAttendance.id, user.name || user.email);
      toast({ title: "Check-out Successful", description: "Have a great day! Your check-out has been recorded." });
      onAttendanceUpdate();
    } catch (error) {
      toast({ variant: "destructive", title: "Check-out Failed", description: error instanceof Error ? error.message : "An unknown error occurred." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStatusCard = () => {
    const timeString = format(currentTime, 'HH:mm:ss');
    
    if (todaysAttendance === undefined) {
      return <div className="text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></div>;
    }
    
    if (!todaysAttendance) {
      return (
        <>
          <CardDescription>You have not checked in today.</CardDescription>
          <p className="text-4xl font-bold font-headline my-4">{timeString}</p>
          <Button size="lg" className="w-full" onClick={handleCheckIn} disabled={isSubmitting}>
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogIn className="mr-2 h-4 w-4" />}
            Check In
          </Button>
        </>
      );
    }

    if (todaysAttendance && !todaysAttendance.checkOut) {
      return (
        <>
          <CardDescription>Checked in at {format(new Date(todaysAttendance.checkIn), 'HH:mm')}</CardDescription>
          <p className="text-4xl font-bold font-headline my-4">{timeString}</p>
          <Button size="lg" className="w-full" onClick={handleCheckOut} disabled={isSubmitting} variant="outline">
            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOut className="mr-2 h-4 w-4" />}
            Check Out
          </Button>
        </>
      );
    }

    if (todaysAttendance && todaysAttendance.checkOut) {
      const duration = formatDistanceToNow(new Date(todaysAttendance.checkIn), { 
        addSuffix: false,
        unit: 'hour'
      });
      return (
        <>
          <CardDescription>You have completed your attendance for today.</CardDescription>
          <div className="text-center my-4">
            <p>Check In: <span className="font-semibold">{format(new Date(todaysAttendance.checkIn), 'HH:mm')}</span></p>
            <p>Check Out: <span className="font-semibold">{format(new Date(todaysAttendance.checkOut), 'HH:mm')}</span></p>
          </div>
          <p className="text-center text-muted-foreground">Thank you for your work today!</p>
        </>
      );
    }
  };

  return (
    <div className="grid md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Today's Attendance</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {renderStatusCard()}
          </CardContent>
        </Card>
      </div>
      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>My Attendance History</CardTitle>
            <CardDescription>Your last 30 attendance records.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Check In</TableHead>
                  <TableHead>Check Out</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {attendanceHistory.length > 0 ? (
                  attendanceHistory.map(record => (
                    <TableRow key={record.id}>
                      <TableCell>{format(new Date(record.date), 'EEE, dd MMM yyyy')}</TableCell>
                      <TableCell>{format(new Date(record.checkIn), 'HH:mm:ss')}</TableCell>
                      <TableCell>{record.checkOut ? format(new Date(record.checkOut), 'HH:mm:ss') : ' - '}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center">No history found.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
