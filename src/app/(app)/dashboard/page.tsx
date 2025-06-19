
"use client"; 

import React, { useState, useEffect, useMemo } from 'react';
import { StatCard } from '@/components/dashboard/StatCard';
import { CertificateTable } from '@/components/certificates/CertificateTable';
import type { Certificate as DisplayCertificate, StatCardData } from '@/lib/types'; // Using local Certificate for display
import { mockUsers, mockActivityLogs } from '@/lib/mockData'; // mockCertificates removed
import { BarChart3, UsersRound, ListChecks, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useListCertificatesQuery } from '@firebasegen/default-connector/react'; // Import Data Connect hook
import type { Certificate as GeneratedCertificate } from '@firebasegen/default-connector';

export default function DashboardPage() {
  const { toast } = useToast();
  
  const { data: certificatesData, isLoading: isLoadingCertificates, error: certificatesError, refetch } = useListCertificatesQuery({});

  const [recentCertificates, setRecentCertificates] = useState<DisplayCertificate[]>([]);

  // These counts are based on mockData arrays whose lengths should be stable for now
  const usersCount = mockUsers.length;
  const logsCount = mockActivityLogs.length;

  const certificatesCount = useMemo(() => {
    return certificatesData?.listCertificates?.length ?? 0;
  }, [certificatesData]);

  useEffect(() => {
    if (certificatesData?.listCertificates) {
      const loadedCerts = certificatesData.listCertificates.map((cert: GeneratedCertificate) => ({
        ...cert,
        id: cert.kode, // Assuming 'kode' is the unique identifier matching 'id'
        tgl_terbit: new Date(cert.tgl_terbit),
        pendaftaran_pertama: new Date(cert.pendaftaran_pertama),
        createdAt: cert.createdAt ? new Date(cert.createdAt) : undefined,
        updatedAt: cert.updatedAt ? new Date(cert.updatedAt) : undefined,
        actions: false, // Disable actions for dashboard view
      }));
      setRecentCertificates(loadedCerts.slice(0, 5));
    }
  }, [certificatesData]);

  const statCardsData: StatCardData[] = [
    { title: 'Total Certificates', value: isLoadingCertificates ? 'Loading...' : certificatesCount, icon: BarChart3, description: 'Number of active certificates' },
    { title: 'Total Users', value: usersCount, icon: UsersRound, description: 'Registered users in the system' },
    { title: 'Total Logs', value: logsCount, icon: ListChecks, description: 'Recorded activities' },
  ];

  const handleEditCertificate = (certificate: DisplayCertificate) => {
    // This is a mock action for the dashboard. Actual editing happens on CertificatesPage.
    toast({ title: "Edit Action (Mock)", description: `Editing certificate: ${certificate.kode}` });
  };

  const handleDeleteCertificate = (certificateId: string) => {
    // This is a mock action for the dashboard.
     toast({ variant: "destructive", title: "Delete Action (Mock)", description: `Deleting certificate ID: ${certificateId}` });
  };

  const renderContent = () => {
    if (isLoadingCertificates) {
      return (
        <div className="flex flex-col flex-1 space-y-8 items-center justify-center">
          <RefreshCw className="mr-2 h-8 w-8 animate-spin text-primary" />
          <p>Loading dashboard data...</p>
        </div>
      );
    }
    
    if (certificatesError) {
      return (
        <div className="flex flex-col flex-1 space-y-8 items-center justify-center text-destructive">
          <p>Error loading certificates: {certificatesError.message}</p>
          <Button onClick={() => refetch()}>Try Again</Button>
        </div>
      );
    }

    return (
      <>
        <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {statCardsData.map((stat) => (
            <StatCard key={stat.title} data={stat} />
          ))}
        </section>

        <section>
          <h2 className="text-2xl font-headline font-semibold mb-4">Recent Certificates</h2>
          <CertificateTable
            certificates={recentCertificates}
            onEdit={handleEditCertificate} 
            onDelete={handleDeleteCertificate}
            showPagination={false} 
            caption="Last 5 certificates added"
          />
        </section>
      </>
    );
  };


  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-headline font-semibold">Dashboard</h1>
      {renderContent()}
    </div>
  );
}
