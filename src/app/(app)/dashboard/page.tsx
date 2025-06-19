"use client"; // Required for useState, useEffect, and client components like CertificateTable

import React from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { CertificateTable } from '@/components/certificates/CertificateTable';
import type { Certificate, StatCardData } from '@/lib/types';
import { mockCertificates, mockUsers, mockActivityLogs } from '@/lib/mockData';
import { BarChart3, UsersRound, ListChecks, FilePenLine, Trash2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";


export default function DashboardPage() {
  const { toast } = useToast();
  // Mock data - in a real app, this would come from an API
  const certificates: Certificate[] = mockCertificates;
  const usersCount = mockUsers.length;
  const logsCount = mockActivityLogs.length;

  const recentCertificates = certificates.slice(0, 5).map(cert => ({ ...cert, actions: false })); // Disable actions for preview

  const statCardsData: StatCardData[] = [
    { title: 'Total Certificates', value: certificates.length, icon: BarChart3, description: 'Number of active certificates' },
    { title: 'Total Users', value: usersCount, icon: UsersRound, description: 'Registered users in the system' },
    { title: 'Total Logs', value: logsCount, icon: ListChecks, description: 'Recorded activities' },
  ];

  const handleEditCertificate = (certificate: Certificate) => {
    // This would typically open a modal or navigate to an edit page
    toast({ title: "Edit Action (Mock)", description: `Editing certificate: ${certificate.kode}` });
  };

  const handleDeleteCertificate = (certificateId: string) => {
    // This would typically show a confirmation and then delete
     toast({ variant: "destructive", title: "Delete Action (Mock)", description: `Deleting certificate ID: ${certificateId}` });
  };


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
          certificates={recentCertificates}
          onEdit={handleEditCertificate} // Mock handlers
          onDelete={handleDeleteCertificate} // Mock handlers
          showPagination={false} // No pagination for preview
          caption="Last 5 certificates added"
        />
      </section>
    </div>
  );
}
