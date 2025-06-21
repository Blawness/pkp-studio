"use client";

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { LogTable } from '@/components/logs/LogTable';
import type { ActivityLog } from '@/lib/types';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import prisma from '@/lib/prisma';
import { useToast } from "@/hooks/use-toast";

export default function LogsPage() {
  const { toast } = useToast();
  const [logs, setLogs] = useState<ActivityLog[] | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchLogs = useCallback(async () => {
    try {
      const fetchedLogs = await prisma.activityLog.findMany();
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
    fetchLogs();
  }, [fetchLogs]);

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter(log =>
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

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

      <LogTable logs={filteredLogs} itemsPerPage={20} />
    </div>
  );
}
