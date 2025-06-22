
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
          <Image src="/image/logo.png" alt="Logo" width={32} height={32} />
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
            if (item.href === '/logs' && user?.role === 'user') return null; // Hide logs for users
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
