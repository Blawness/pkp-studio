
"use client"; 

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { CertificateTable } from '@/components/certificates/CertificateTable';
import type { Certificate, StatCardData, User, ActivityLog } from '@/lib/types';
import { BarChart3, UsersRound, ListChecks, PieChart as PieChartIcon } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { PieChart, Pie, Cell } from 'recharts';
import { getDashboardData } from '@/lib/actions';

type SortableCertificateKey = 'kode' | 'nama_pemegang' | 'surat_hak' | 'no_sertifikat' | 'luas_m2' | 'tgl_terbit';

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

interface DashboardData {
  certificatesCount: number;
  usersCount: number;
  logsCount: number;
  recentCertificates: Certificate[];
  certificateTypeCounts: { surat_hak: string; _count: { surat_hak: number } }[];
  userRoleCounts: { role: string; _count: { role: number } }[];
}

export default function DashboardPage() {
  const { toast } = useToast();
  const [data, setData] = useState<DashboardData | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: SortableCertificateKey; direction: 'asc' | 'desc' } | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const dashboardData = await getDashboardData();
        const formattedCerts = dashboardData.recentCertificates.map(cert => ({
          ...cert,
          nama_pemegang: Array.isArray(cert.nama_pemegang) ? cert.nama_pemegang as string[] : [],
        }));
        setData({ ...dashboardData, recentCertificates: formattedCerts });
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data.",
          variant: "destructive",
        });
      }
    }
    fetchData();
  }, [toast]); 

  const handleSort = useCallback((key: SortableCertificateKey) => {
    setSortConfig(prevSortConfig => {
      const isAsc = prevSortConfig?.key === key && prevSortConfig.direction === 'asc';
      return { key, direction: isAsc ? 'desc' : 'asc' };
    });
  }, []); 

  const sortedRecentCertificates = useMemo(() => {
    if (!data?.recentCertificates) return [];
    let sorted = [...data.recentCertificates];
    if (sortConfig) {
      sorted.sort((a, b) => {
        let valA: any = a[sortConfig.key];
        let valB: any = b[sortConfig.key];
        if (sortConfig.key === 'nama_pemegang') {
          valA = Array.isArray(valA) ? valA[0] || '' : '';
          valB = Array.isArray(valB) ? valB[0] || '' : '';
        }
        if (sortConfig.key === 'tgl_terbit') { 
          valA = new Date(valA as Date).getTime();
          valB = new Date(valB as Date).getTime();
        }
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortConfig.direction === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortConfig.direction === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });
    }
    return sorted;
  }, [data?.recentCertificates, sortConfig]);

  const statCardsData: StatCardData[] = [
    { title: 'Total Certificates', value: data?.certificatesCount ?? 0, icon: BarChart3, description: 'Number of active certificates' },
    { title: 'Total Users', value: data?.usersCount ?? 0, icon: UsersRound, description: 'Registered users in the system' },
    { title: 'Total Logs', value: data?.logsCount ?? 0, icon: ListChecks, description: 'Recorded activities' },
  ];

  const certificateTypeData = useMemo(() => {
    if (!data?.certificateTypeCounts) return [];
    return data.certificateTypeCounts.map((item, index) => ({
      name: item.surat_hak,
      value: item._count.surat_hak,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [data?.certificateTypeCounts]);

  const certificateTypeChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    certificateTypeData.forEach(item => {
      config[item.name] = { label: item.name, color: item.fill };
    });
    return config;
  }, [certificateTypeData]);

  const userRoleData = useMemo(() => {
    if (!data?.userRoleCounts) return [];
    return data.userRoleCounts.map((item, index) => ({
      name: item.role.charAt(0).toUpperCase() + item.role.slice(1),
      value: item._count.role,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [data?.userRoleCounts]);

  const userRoleChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    userRoleData.forEach(item => {
      config[item.name] = { label: item.name, color: item.fill };
    });
    return config;
  }, [userRoleData]);

  if (!data) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-headline font-semibold">Dashboard</h1>
        <div className="rounded-xl border shadow-xs p-4 text-center">
          <p className="text-muted-foreground">Loading dashboard data...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-semibold">Dashboard</h1>
      
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {statCardsData.map((stat) => (
          <StatCard key={stat.title} data={stat} />
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-primary" />Certificate Types</CardTitle>
            <CardDescription>Distribution of certificates by Surat Hak.</CardDescription>
          </CardHeader>
          <CardContent>
            {certificateTypeData.length > 0 ? (
              <ChartContainer config={certificateTypeChartConfig} className="mx-auto aspect-square max-h-[300px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie data={certificateTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-medium">{`${(percent * 100).toFixed(0)}%`}</text>;
                    }}>
                    {certificateTypeData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.fill} />)}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            ) : <p className="text-center text-muted-foreground py-8">No certificate data.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><PieChartIcon className="h-5 w-5 text-primary" />User Roles</CardTitle>
            <CardDescription>Distribution of users by role.</CardDescription>
          </CardHeader>
          <CardContent>
            {userRoleData.length > 0 ? (
              <ChartContainer config={userRoleChartConfig} className="mx-auto aspect-square max-h-[300px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie data={userRoleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" className="text-xs font-medium">{`${(percent * 100).toFixed(0)}%`}</text>;
                    }}>
                    {userRoleData.map((entry) => <Cell key={`cell-${entry.name}`} fill={entry.fill} />)}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} />
                </PieChart>
              </ChartContainer>
            ) : <p className="text-center text-muted-foreground py-8">No user data.</p>}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4">Recent Certificates</h2>
        <CertificateTable
          certificates={sortedRecentCertificates} 
          onEdit={() => toast({ title: "Info", description: "Edit functionality is on the Certificates page." })} 
          onDelete={() => toast({ title: "Info", description: "Delete functionality is on the Certificates page." })}
          showPagination={false} 
          caption="Last 5 certificates added (sorted by issue date)"
          sortConfig={sortConfig}
          handleSort={handleSort}
        />
      </section>
    </div>
  );
}
