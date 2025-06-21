
"use client";

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { SidebarProvider, Sidebar, SidebarInset } from "@/components/ui/sidebar";
import { Header } from "@/components/layout/Header";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // If not loading and no user is logged in, redirect to the login page.
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // If there's a user, show the main app layout.
  if (user) {
    return (
      <SidebarProvider defaultOpen={true}>
        <Sidebar variant="sidebar" collapsible="icon" className="border-r">
          <SidebarNav />
        </Sidebar>
        <SidebarInset>
          <Header />
          <main className="flex flex-col flex-1 p-4 md:p-6 lg:p-8 pt-16">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    );
  }

  // Fallback for when no user is found after loading, typically will be redirected by useEffect.
  // This helps prevent a brief flash of content if the redirect is slow.
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="ml-2">Redirecting to login...</p>
    </div>
  );
}
