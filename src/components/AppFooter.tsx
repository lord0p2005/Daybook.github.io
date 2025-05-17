
'use client';

import { LogEntryForm } from '@/components/LogEntryForm';

interface AppFooterProps {
  onNewLogSubmit: (text: string) => Promise<void>;
  isSubmittingLog: boolean;
}

export function AppFooter({ onNewLogSubmit, isSubmittingLog }: AppFooterProps) {
  return (
    <footer className="p-4 border-t border-border sticky bottom-0 bg-background/80 backdrop-blur-sm">
      <div className="container mx-auto">
        <LogEntryForm onSubmit={onNewLogSubmit} isSubmitting={isSubmittingLog} />
      </div>
    </footer>
  );
}
