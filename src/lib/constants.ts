
import type { NavItem } from '@/lib/types';
import { LayoutDashboard, ScrollText, Users, History, Settings, Tractor } from 'lucide-react';

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
    title: 'Tanah Garapan',
    href: '/tanah-garapan',
    icon: Tractor,
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

export const KODE_CERTIFICATE_OPTIONS = ["LPN01", "PKP01"] as const;

export const SURAT_HAK_OPTIONS = [
  "SHM",
  "Hak Guna Usaha",
  "Hak Guna Bangunan",
  "Hak Pakai",
  "Hak Pengelolaan",
  "Hak Wakaf"
] as const;

export const USER_ROLE_OPTIONS = ['admin', 'user'] as const;
