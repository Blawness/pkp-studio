
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS, APP_NAME } from "@/lib/constants";
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { LogOutIcon, Settings } from "lucide-react"; // Changed LogOut to LogOutIcon
import { useAuth } from "@/contexts/AuthContext";

export function SidebarNav() {
  const pathname = usePathname();
  const { open, isMobile } = useSidebar();
  const { logout, user } = useAuth();

  // Filter out settings from main nav if it's handled in footer
  // And only show items if user is logged in
  const mainNavItems = user ? NAV_ITEMS.filter(item => item.href !== '/settings') : [];


  return (
    <>
      <SidebarHeader className="flex items-center justify-between p-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-primary">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"></path>
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
          {mainNavItems.map((item) => (
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
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="p-2">
        {user && (
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
                onClick={logout}
                tooltip={{ children: "Logout", side: "right", className: "bg-card text-card-foreground border-border shadow-md" }}
              >
                <LogOutIcon /> {/* Changed LogOut to LogOutIcon */}
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
      </SidebarFooter>
    </>
  );
}
