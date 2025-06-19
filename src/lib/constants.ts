
import type { NavItem } from '@/lib/types';
import { LayoutDashboard, ScrollText, Users, History, Settings } from 'lucide-react';

export const NAV_ITEMS: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Certificates',
    href: '/certificates',
    icon: ScrollText,
  },
  {
    title: 'Users',
    href: '/users',
    icon: Users,
  },
  {
    title: 'Activity Logs',
    href: '/logs',
    icon: History,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: Settings,
  },
];

export const APP_NAME = "Database PKP";

