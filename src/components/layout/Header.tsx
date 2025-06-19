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
import { LogOut, UserCircle, Moon, Sun } from "lucide-react";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { APP_NAME } from "@/lib/constants";

// Mock theme toggler for now
const ThemeToggle = () => {
  const [isDark, setIsDark] = React.useState(false);
  React.useEffect(() => {
    const actualmenteEsOscuro = document.documentElement.classList.contains('dark');
    setIsDark(actualmenteEsOscuro);
    // Ensure body class matches initial theme
    if (actualmenteEsOscuro) {
      document.body.classList.add('dark-theme-active'); // Example class, adjust as needed
    } else {
      document.body.classList.remove('dark-theme-active');
    }
  }, []);

  const toggleTheme = () => {
    document.documentElement.classList.toggle('dark');
    document.body.classList.toggle('dark-theme-active'); // Toggle body class
    setIsDark(!isDark);
  };

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  );
};


export function Header() {
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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-8 w-8">
                <AvatarImage src="https://placehold.co/40x40.png" alt="User avatar" data-ai-hint="user avatar" />
                <AvatarFallback>AU</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
