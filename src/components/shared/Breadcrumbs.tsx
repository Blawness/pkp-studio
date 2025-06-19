
"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { NAV_ITEMS, APP_NAME } from '@/lib/constants';

export function Breadcrumbs() {
  const pathname = usePathname();
  
  const generateBreadcrumbs = () => {
    const pathSegments = pathname.split('/').filter(segment => segment);
    const breadcrumbs = [{ label: APP_NAME, href: '/dashboard' }];

    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      const navItem = NAV_ITEMS.find(item => item.href === currentPath);
      if (navItem) {
        // Avoid adding duplicate dashboard link if it's already the root
        if (navItem.href === '/dashboard' && breadcrumbs.length === 1 && breadcrumbs[0].href === '/dashboard') {
          // Update the label of the first breadcrumb if it's the active dashboard page
          // breadcrumbs[0].label = navItem.title; // This line could be added if we want APP_NAME to change to Dashboard when on dashboard
        } else if (breadcrumbs.every(b => b.href !== navItem.href)) { // Add only if not already present
             breadcrumbs.push({ label: navItem.title, href: navItem.href });
        }
      } else {
        // Fallback for dynamic routes or unlisted paths not already covered
        const title = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
        if (breadcrumbs.every(b => b.href !== currentPath)) {
            breadcrumbs.push({ label: title, href: currentPath });
        }
      }
    });
    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  return (
    <nav aria-label="Breadcrumb" className="hidden md:flex">
      <ol className="flex items-center space-x-1.5 text-sm text-muted-foreground">
        {breadcrumbItems.map((crumb, index) => (
          <li key={`${crumb.href}-${index}`} className="flex items-center">
            {index > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {index === breadcrumbItems.length - 1 ? (
              <span className="font-medium text-foreground">{crumb.label}</span>
            ) : (
              <Link href={crumb.href} className="hover:text-foreground transition-colors">
                {crumb.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

