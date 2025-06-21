
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
import { UserCircle, Moon, Sun, LogOut } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { APP_NAME } from "@/lib/constants";
import { useAuth } from "@/contexts/AuthContext"; 
import Link from "next/link";
import { useIsMobile } from "@/hooks/use-mobile";

// Mock theme toggler
const ThemeToggle = () => {
  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    const actualmenteEsOscuro = document.documentElement.classList.contains('dark');
    setIsDark(actualmenteEsOscuro);
    if (actualmenteEsOscuro) {
      document.body.classList.add('dark-theme-active'); 
    } else {
      document.body.classList.remove('dark-theme-active');
    }
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    document.body.classList.toggle('dark-theme-active'); 
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
  const isMobile = useIsMobile();

  const getInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.split(' ');
      if (parts.length > 1) {
        return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return "AU"; // Default fallback
  };


  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/60 md:px-6">
      {/* Left Group */}
      <div className="flex items-center gap-2">
        {isMobile ? (
          <>
            <SidebarTrigger />
            <span className="font-headline text-lg font-semibold">{APP_NAME}</span>
          </>
        ) : (
          <Breadcrumbs />
        )}
      </div>

      {/* Right Group */}
      <div className="flex items-center gap-3 md:gap-4">
        <ThemeToggle />
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="https://placehold.co/40x40.png" alt={user.name || user.email} data-ai-hint="user avatar" />
                  <AvatarFallback>{getInitials(user.name, user.email)}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                 <Link href="/settings"> {/* Assuming /settings is the profile page */}
                    <UserCircle className="mr-2 h-4 w-4" />
                    Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={logout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
