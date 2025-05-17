
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { LogEntry } from '@/lib/types';
import { addLogEntry, getAIPrompts } from '@/lib/actions';
import { AppHeader } from '@/components/AppHeader';
import { AppFooter } from '@/components/AppFooter';
import { AIPromptDisplay } from '@/components/AIPromptDisplay';
import { useToast } from '@/hooks/use-toast';

export default function MainAppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { toast } = useToast();

  const [aiPrompts, setAiPrompts] = useState<string[]>([]);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [sessionLogsForPromptContext, setSessionLogsForPromptContext] = useState<LogEntry[]>([]);


  const handleRefreshPrompts = useCallback(async (contextLogs?: LogEntry[]) => {
    setIsLoadingPrompts(true);
    try {
      const fetchedPrompts = await getAIPrompts(contextLogs);
      setAiPrompts(fetchedPrompts);
    } catch (error) {
      console.error("Error refreshing prompts:", error);
      toast({ title: "Error", description: "Could not refresh prompts.", variant: "destructive" });
    } finally {
      setIsLoadingPrompts(false);
    }
  }, [toast]); // toast is stable, no need to re-create often

  useEffect(() => {
    handleRefreshPrompts(); // Initial fetch without specific log context
  }, [handleRefreshPrompts]);

  const handleNewLogSubmitFromFooter = async (text: string) => {
    setIsSubmittingLog(true);
    try {
      const newLog = await addLogEntry(text);
      // Add to a temporary list of logs made this session for prompt context
      setSessionLogsForPromptContext(prev => [newLog, ...prev].slice(0, 5)); // Keep last 5

      toast({ title: "Log Saved", description: `Entry "${text.substring(0,20)}..." saved.` });
      router.refresh(); // Refreshes current route, re-running RSCs and data fetching
      
      // Refresh prompts with context of newly added log
      await handleRefreshPrompts([newLog, ...sessionLogsForPromptContext].slice(0,5));
    } catch (error) {
      console.error("Error submitting log from footer:", error);
      toast({ title: "Error", description: "Failed to save log entry.", variant: "destructive" });
    } finally {
      setIsSubmittingLog(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col space-y-6 overflow-y-auto">
        <AIPromptDisplay
          prompts={aiPrompts}
          onRefreshPrompts={() => handleRefreshPrompts(sessionLogsForPromptContext)} // Use session logs for manual refresh
          isLoadingPrompts={isLoadingPrompts}
        />
        {children}
      </main>
      <AppFooter 
        onNewLogSubmit={handleNewLogSubmitFromFooter}
        isSubmittingLog={isSubmittingLog}
      />
    </div>
  );
}
