"use client";

import React, { useState, useMemo } from 'react';
import { LogTable } from '@/components/logs/LogTable';
import type { ActivityLog } from '@/lib/types';
import { mockActivityLogs } from '@/lib/mockData';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

export default function LogsPage() {
  const [logs] = useState<ActivityLog[]>(mockActivityLogs); // Using mock data directly
  const [searchTerm, setSearchTerm] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter(log =>
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

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
