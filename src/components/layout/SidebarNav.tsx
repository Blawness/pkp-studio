
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

export function SidebarNav() {
  const pathname = usePathname();
  const { open, isMobile } = useSidebar();
  const { logout } = useAuth(); // Get logout from AuthContext

  return (
    <>
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180" className="h-8 w-8">
            <path fill="#b08b41" d="M2.5 143.5c29.8 21.2 65.2 24.8 97.5 24.8s67.7-3.6 97.5-24.8C167.7 154.7 136.3 156 100 156s-67.7-1.3-97.5-12.5z" />
            <path fill="#2c8a9e" d="M3.7 131.2c28.2-22.3 64.8-29.3 96.3-29.3s68.1 7 96.3 29.3c-28.2-19.3-62.5-28.5-96.3-28.5S31.9 111.9 3.7 131.2z" />
            <path fill="#2c8a9e" d="M12.3 120.3c27.1-22.7 61.4-27.1 87.7-27.1s60.6 4.4 87.7 27.1c-27.1-18.7-58.8-26.6-87.7-26.6s-60.6 7.9-87.7 26.6z" />
            <path fill="#1a5e4f" d="M32 6.8c12.3 0 21.3 7.8 31.4 17.2 9.3-11.8 18.4-23.2 31.8-23.2 12.8 0 22.3 8.1 32.2 17.8C142.3 1.1 125.2 0 108.3 0 91.8 0 75.3 13.9 64.9 33.6 54.3 14 38.3 0 21.7 0 8.5 0-4.3 13.9 11.2 38.8 1.9 24.1-10.4 6.8 32 6.8zm99.6 126.9c-7.3-1.4-15.9-2.5-19.2-11.3-3.4-9 1-21.4 1.3-22.4.9-2.8.1-6.7-1.6-8.5-2.5-2.9-20-21-23.2-24.3s-6.1-4.7-9.9-4.7-6.8 1.5-9.9 4.7c-3.2 3.3-20.7 21.4-23.2 24.3-1.7 1.8-2.5 5.7-1.6 8.5.3 1 8.6 21.4 1.3 22.4-3.3 8.8-11.9 9.9-19.2 11.3-10.2 1.9-30.9 7.1-30.9 15 0 1.4 1.1 2.5 2.5 2.5h147.2c1.4 0 2.5-1.1 2.5-2.5.1-7.9-20.6-13.1-30.8-15z" />
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
