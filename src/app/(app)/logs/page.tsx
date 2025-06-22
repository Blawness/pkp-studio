
"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { LogTable } from '@/components/logs/LogTable';
import type { ActivityLog } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { getLogs, restoreData } from '@/lib/actions';
import { useAuth } from '@/contexts/AuthContext';

export default function LogsPage() {
  const { toast } = useToast();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [logs, setLogs] = useState<ActivityLog[] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [restoringLogId, setRestoringLogId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && user && user.role === 'user') {
      router.push('/dashboard');
    }
  }, [user, authLoading, router]);

  const fetchLogs = useCallback(async () => {
    try {
      const fetchedLogs = await getLogs();
      setLogs(fetchedLogs);
    } catch (error) {
      console.error("Failed to fetch activity logs:", error);
      toast({
        title: "Error",
        description: "Failed to load activity logs.",
        variant: "destructive",
      });
      setLogs([]);
    }
  }, [toast]);

  useEffect(() => {
    if (user && user.role !== 'user') {
      fetchLogs();
    }
  }, [fetchLogs, user]);

  const handleRestore = useCallback(async (logId: string) => {
    if (!user) return;
    setRestoringLogId(logId);
    try {
      const result = await restoreData(logId, user.name || user.email);
      if (result.success) {
        toast({ title: "Success", description: result.message });
        fetchLogs(); // Refresh logs to show the restore action log
      } else {
        toast({ variant: "destructive", title: "Restore Failed", description: result.message });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    } finally {
      setRestoringLogId(null);
    }
  }, [user, toast, fetchLogs]);

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter(log =>
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  if (authLoading || !user || user.role === 'user') {
    return (
      <div className="flex h-full flex-1 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (logs === null) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-headline font-semibold">Activity Logs</h1>
        <div className="rounded-xl border shadow-xs p-4 text-center">
          <p className="text-muted-foreground">Loading activity logs...</p>
        </div>
      </div>
    );
  }

  const canManage = user?.role === 'admin' || user?.role === 'manager';

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-semibold">Activity Logs</h1>
      
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search logs by user, action, or details..."
          className="pl-10 w-full md:w-1/3"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <LogTable 
        logs={filteredLogs} 
        itemsPerPage={20}
        onRestore={canManage ? handleRestore : undefined}
        restoringLogId={restoringLogId}
      />
    </div>
  );
}
