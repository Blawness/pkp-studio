
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, APP_NAME } from "@/lib/constants";
import {
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"; // Removed Sidebar import, it's used in AppLayout
import { Button } from "@/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext"; // Import useAuth
import Image from "next/image";

export function SidebarNav() {
  const pathname = usePathname();
  const { open, isMobile } = useSidebar();
  const { user, logout } = useAuth(); // Get user and logout from AuthContext

  return (
    <>
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <svg width="32" height="32" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M50 0C22.3858 0 0 22.3858 0 50C0 77.6142 22.3858 100 50 100C77.6142 100 100 77.6142 100 50C100 22.3858 77.6142 0 50 0Z" fill="#1A6A4A"/>
            <path d="M69.1365 24.3182C67.5852 23.3693 65.6591 23.5511 64.2898 24.7727L43.8352 42.0455C43.142 42.6136 42.5398 43.2727 42.0284 44.0227L37.1307 28.5227C36.6193 26.8352 34.9886 25.7955 33.25 25.7955C31.5114 25.7955 29.8807 26.8352 29.3693 28.5227L24.3807 44.3182L24.0909 44.0227C22.7216 42.8011 20.7955 42.6193 19.2443 43.5682C17.6932 44.517 16.9432 46.3409 17.4545 48.0284L28.1648 85.5227C28.6761 87.2045 30.3068 88.25 32.0455 88.25H72.9545C74.6932 88.25 76.3239 87.2045 76.8352 85.5227L87.5455 48.0284C88.0568 46.3409 87.3068 44.517 85.7557 43.5682C84.2045 42.6193 82.2784 42.8011 80.9091 44.0227L69.1365 24.3182Z" fill="#C19A47"/>
            <path d="M50 49.0909L42.0284 44.0227C42.5398 43.2727 43.142 42.6136 43.8352 42.0455L64.2898 24.7727C65.6591 23.5511 67.5852 23.3693 69.1365 24.3182L80.9091 44.0227L50 49.0909Z" fill="#3B9CBE"/>
          </svg>
          {(open || isMobile) && (
            <h1 className="font-headline text-xl font-semibold text-primary">{APP_NAME}</h1>
          )}
        </Link>
        <div className="hidden md:block">
         <SidebarTrigger className="text-foreground hover:text-accent-foreground data-[state=open]:bg-accent data-[state=open]:text-accent-foreground" />
        </div>
      </SidebarHeader>
      <SidebarContent className="p-2">
        <SidebarMenu>
          {NAV_ITEMS.map((item) => {
            if (item.href === '/settings') return null; // Settings is now in footer
            if (item.href === '/users' && user?.role !== 'admin') return null;
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  isActive={pathname.startsWith(item.href)}
                  tooltip={{ children: item.title, side: "right", className: "bg-card text-card-foreground border-border shadow-md" }}
                >
                  <Link href={item.href}>
                    <item.icon />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton 
              asChild
              isActive={pathname.startsWith("/settings")}
              tooltip={{ children: "Settings", side: "right", className: "bg-card text-card-foreground border-border shadow-md" }}
            >
              <Link href="/settings">
                <Settings />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton 
              onClick={logout} // Use logout from context
              tooltip={{ children: "Logout", side: "right", className: "bg-card text-card-foreground border-border shadow-md" }}
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </>
  );
}
