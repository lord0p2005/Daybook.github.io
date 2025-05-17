
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotebookText, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/logs', label: 'Daily Logs', icon: NotebookText },
  { href: '/goals', label: 'Goals', icon: Flag },
];

export function AppHeader() {
  const pathname = usePathname();

  return (
    <header className="p-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
      <div className="container mx-auto flex flex-col sm:flex-row items-center justify-between">
        <div className="flex items-center space-x-2 mb-2 sm:mb-0">
          <NotebookText className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">DaybookAI</h1>
        </div>
        <nav className="flex space-x-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href === '/logs' && pathname === '/'); // Treat / as /logs for active state
            return (
              <Button key={item.label} variant={isActive ? 'secondary' : 'ghost'} size="sm" asChild>
                <Link href={item.href} className="flex items-center">
                  <item.icon className={cn("mr-2 h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                  {item.label}
                </Link>
              </Button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
