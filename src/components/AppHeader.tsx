
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { NotebookText, Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
          <TooltipProvider delayDuration={100}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (item.href === '/logs' && pathname === '/'); // Treat / as /logs for active state
              return (
                <Tooltip key={item.label}>
                  <TooltipTrigger asChild>
                    <Button variant={isActive ? 'secondary' : 'ghost'} size="icon" asChild>
                      <Link href={item.href} aria-label={item.label}>
                        <item.icon className={cn("h-5 w-5", isActive ? "text-primary" : "text-muted-foreground")} />
                      </Link>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="bottom">
                    <p>{item.label}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </nav>
      </div>
    </header>
  );
}
