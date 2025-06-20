
"use client"; 

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { CertificateTable } from '@/components/certificates/CertificateTable';
import type { Certificate, StatCardData, User } from '@/lib/types';
import { mockCertificates, mockUsers, mockActivityLogs } from '@/lib/mockData';
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
import { PieChart, Pie, Cell, Tooltip as RechartsTooltip } from 'recharts';
import { SURAT_HAK_OPTIONS, USER_ROLE_OPTIONS } from '@/lib/constants';

type SortableCertificateKey = 'kode' | 'nama_pemegang' | 'surat_hak' | 'no_sertifikat' | 'luas_m2' | 'tgl_terbit';


// Define chart colors from globals.css (or define new ones if needed)
const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
  "hsl(var(--primary))",
  "hsl(var(--accent))",
];


export default function DashboardPage() {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[] | null>(null);
  const [users, setUsers] = useState<User[]>(mockUsers); // Already loaded
  const [recentCertificates, setRecentCertificates] = useState<Certificate[]>([]);
  const [sortConfig, setSortConfig] = useState<{ key: SortableCertificateKey; direction: 'asc' | 'desc' } | null>(null);


  const logsCount = mockActivityLogs.length;

  useEffect(() => {
    const loadedCertificates = mockCertificates;
    setCertificates(loadedCertificates);
    setRecentCertificates(
      loadedCertificates
        .sort((a,b) => new Date(b.tgl_terbit).getTime() - new Date(a.tgl_terbit).getTime()) // Sort by date to get recent
        .slice(0, 5)
        .map(cert => ({ ...cert, actions: false }))
    );
  }, []); 

  const handleSort = useCallback((key: SortableCertificateKey) => {
    setSortConfig(prevSortConfig => {
      const isAsc = prevSortConfig?.key === key && prevSortConfig.direction === 'asc';
      return { key, direction: isAsc ? 'desc' : 'asc' };
    });
     setRecentCertificates(prev => {
        const sorted = [...prev];
        if (key && sortConfig) { // check if sortConfig is not null
             sorted.sort((a, b) => {
                let valA = a[key];
                let valB = b[key];

                if (key === 'nama_pemegang') {
                    valA = Array.isArray(valA) ? valA[0] || '' : '';
                    valB = Array.isArray(valB) ? valB[0] || '' : '';
                }
                if (key === 'tgl_terbit') { // No need for pendaftaran_pertama here
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
    });
  }, [sortConfig]); // Added sortConfig to dependencies


  const statCardsData: StatCardData[] = [
    { title: 'Total Certificates', value: certificates ? certificates.length : 0, icon: BarChart3, description: 'Number of active certificates' },
    { title: 'Total Users', value: users.length, icon: UsersRound, description: 'Registered users in the system' },
    { title: 'Total Logs', value: logsCount, icon: ListChecks, description: 'Recorded activities' },
  ];

  const certificateTypeData = useMemo(() => {
    if (!certificates) return [];
    const counts = certificates.reduce((acc, cert) => {
      acc[cert.surat_hak] = (acc[cert.surat_hak] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value], index) => ({
      name,
      value,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [certificates]);

  const certificateTypeChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    certificateTypeData.forEach(item => {
      config[item.name] = { label: item.name, color: item.fill };
    });
    return config;
  }, [certificateTypeData]);


  const userRoleData = useMemo(() => {
    const counts = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    return Object.entries(counts).map(([name, value], index) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1), // Capitalize role name
      value,
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [users]);

  const userRoleChartConfig = useMemo(() => {
    const config: ChartConfig = {};
    userRoleData.forEach(item => {
      config[item.name] = { label: item.name, color: item.fill };
    });
    return config;
  }, [userRoleData]);


  const handleEditCertificate = (certificate: Certificate) => {
    toast({ title: "Edit Action (Mock)", description: `Editing certificate: ${certificate.kode}` });
  };

  const handleDeleteCertificate = (certificateId: string) => {
     toast({ variant: "destructive", title: "Delete Action (Mock)", description: `Deleting certificate ID: ${certificateId}` });
  };

  if (certificates === null) {
    return (
      <div className="space-y-8">
        <h1 className="text-3xl font-headline font-semibold">Dashboard</h1>
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCardsData.map((stat) => (
             <StatCard 
                key={stat.title} 
                data={{
                  ...stat, 
                  value: stat.title === 'Total Certificates' && stat.value === 0 ? 'Loading...' : stat.value 
                }} 
            />
          ))}
        </section>
        <section>
          <h2 className="text-2xl font-headline font-semibold mb-4">Recent Certificates</h2>
          <div className="rounded-xl border shadow-xs p-4 text-center">
            <p className="text-muted-foreground">Loading certificates...</p>
          </div>
        </section>
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
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5 text-primary" />
              Certificate Types
            </CardTitle>
            <CardDescription>Distribution of certificates by Surat Hak.</CardDescription>
          </CardHeader>
          <CardContent>
            {certificateTypeData.length > 0 ? (
              <ChartContainer config={certificateTypeChartConfig} className="mx-auto aspect-square max-h-[300px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie data={certificateTypeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}>
                    {certificateTypeData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
                </PieChart>
              </ChartContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No certificate data to display.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5 text-primary" />
                User Roles
            </CardTitle>
            <CardDescription>Distribution of users by role.</CardDescription>
          </CardHeader>
          <CardContent>
            {userRoleData.length > 0 ? (
              <ChartContainer config={userRoleChartConfig} className="mx-auto aspect-square max-h-[300px]">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <Pie data={userRoleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                      const RADIAN = Math.PI / 180;
                      const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                      const x = cx + radius * Math.cos(-midAngle * RADIAN);
                      const y = cy + radius * Math.sin(-midAngle * RADIAN);
                      return (
                        <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="text-xs font-medium">
                          {`${(percent * 100).toFixed(0)}%`}
                        </text>
                      );
                    }}>
                    {userRoleData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend content={<ChartLegendContent nameKey="name" />} className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center" />
                </PieChart>
              </ChartContainer>
            ) : (
              <p className="text-center text-muted-foreground py-8">No user data to display.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4">Recent Certificates</h2>
        <CertificateTable
          certificates={recentCertificates} 
          onEdit={handleEditCertificate} 
          onDelete={handleDeleteCertificate}
          showPagination={false} 
          caption="Last 5 certificates added (sorted by issue date)"
          sortConfig={sortConfig}
          handleSort={handleSort}
        />
      </section>
    </div>
  );
}
