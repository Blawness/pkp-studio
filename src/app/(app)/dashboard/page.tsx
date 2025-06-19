
"use client"; 

import React, { useState, useEffect } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { CertificateTable } from '@/components/certificates/CertificateTable';
import type { Certificate, StatCardData } from '@/lib/types';
import { mockCertificates, mockUsers, mockActivityLogs } from '@/lib/mockData';
import { BarChart3, UsersRound, ListChecks } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";


export default function DashboardPage() {
  const { toast } = useToast();
  const [certificates, setCertificates] = useState<Certificate[] | null>(null);
  const [recentCertificates, setRecentCertificates] = useState<Certificate[]>([]);

  // These counts are based on mockData arrays whose lengths should be stable
  const usersCount = mockUsers.length;
  const logsCount = mockActivityLogs.length;

  useEffect(() => {
    // Set certificates on the client after hydration to avoid mismatch
    const loadedCertificates = mockCertificates;
    setCertificates(loadedCertificates);
    setRecentCertificates(
      loadedCertificates.slice(0, 5).map(cert => ({ ...cert, actions: false }))
    );
  }, []); // Empty dependency array ensures this runs once on mount client-side

  // Recalculate statCardsData when certificates state changes
  const statCardsData: StatCardData[] = [
    { title: 'Total Certificates', value: certificates ? certificates.length : 0, icon: BarChart3, description: 'Number of active certificates' },
    { title: 'Total Users', value: usersCount, icon: UsersRound, description: 'Registered users in the system' },
    { title: 'Total Logs', value: logsCount, icon: ListChecks, description: 'Recorded activities' },
  ];

  const handleEditCertificate = (certificate: Certificate) => {
    toast({ title: "Edit Action (Mock)", description: `Editing certificate: ${certificate.kode}` });
  };

  const handleDeleteCertificate = (certificateId: string) => {
     toast({ variant: "destructive", title: "Delete Action (Mock)", description: `Deleting certificate ID: ${certificateId}` });
  };

  if (certificates === null) {
    // Render a loading state or a simplified version until certificates are loaded client-side
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

      <section>
        <h2 className="text-2xl font-headline font-semibold mb-4">Recent Certificates</h2>
        <CertificateTable
          certificates={recentCertificates} // Use the state variable
          onEdit={handleEditCertificate} 
          onDelete={handleDeleteCertificate}
          showPagination={false} 
          caption="Last 5 certificates added"
        />
      </section>
    </div>
  );
}
