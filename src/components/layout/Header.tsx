
"use client";

import * as React from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserCircle, Moon, Sun, LogOutIcon } from "lucide-react"; // Changed LogOut to LogOutIcon to avoid name clash
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

const ThemeToggle = () => {
  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    const root = window.document.documentElement;
    const initialColorValue = root.classList.contains('dark');
    setIsDark(initialColorValue);
  }, []);

  const toggleTheme = () => {
    const root = window.document.documentElement;
    root.classList.toggle('dark');
    setIsDark(!isDark);
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};


export function Header() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const getAvatarFallback = () => {
    if (user?.name) {
      return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2);
    }
    if (user?.email) {
      return user.email[0].toUpperCase();
    }
    return "AU"; // Default fallback
  }

  const handleProfileClick = () => {
    router.push('/settings'); // Navigate to settings page as profile page
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 md:px-6">
      <div className="flex items-center gap-2 md:hidden">
        <SidebarTrigger />
        <span className="font-headline text-lg font-semibold">{APP_NAME}</span>
      </div>
      <div className="hidden md:block">
        <Breadcrumbs />
      </div>
      <div className="ml-auto flex items-center gap-4">
        <ThemeToggle />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  {/* Placeholder for actual user image if available */}
                  {/* <AvatarImage src={user.imageUrl || "https://placehold.co/40x40.png"} alt={user.name || "User avatar"} data-ai-hint="user avatar" /> */}
                  <AvatarImage src="https://placehold.co/40x40.png" alt={user.name || "User avatar"} data-ai-hint="user avatar" />
                  <AvatarFallback>{getAvatarFallback()}</AvatarFallback> 
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleProfileClick}>
                <UserCircle className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOutIcon className="mr-2 h-4 w-4" /> {/* Changed LogOut to LogOutIcon */}
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
