
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { LogEntry } from '@/lib/types';
import { addLogEntry, getLogs, getAIPrompts } from '@/lib/actions';
import { LogEntryForm } from '@/components/LogEntryForm';
import { LogDisplay } from '@/components/LogDisplay';
import { AIPromptDisplay } from '@/components/AIPromptDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { NotebookText } from 'lucide-react';

export default function DaybookPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [aiPrompts, setAiPrompts] = useState<string[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const { toast } = useToast();

  const fetchInitialData = useCallback(async () => {
    setIsLoadingLogs(true);
    setIsLoadingPrompts(true);
    try {
      const [fetchedLogs, fetchedPrompts] = await Promise.all([
        getLogs(),
        getAIPrompts() // Initial prompts without context or with minimal context
      ]);
      setLogs(fetchedLogs);
      setAiPrompts(fetchedPrompts);
    } catch (error) {
      console.error("Error fetching initial data:", error);
      toast({
        title: "Error",
        description: "Could not load your Daybook data. Please try refreshing.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLogs(false);
      setIsLoadingPrompts(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  const handleRefreshPrompts = useCallback(async () => {
    setIsLoadingPrompts(true);
    try {
      const fetchedPrompts = await getAIPrompts(logs); // Pass current logs for context
      setAiPrompts(fetchedPrompts);
    } catch (error) {
      console.error("Error refreshing prompts:", error);
      toast({
        title: "Error",
        description: "Could not refresh prompts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingPrompts(false);
    }
  }, [logs, toast]);

  const handleNewLogSubmit = async (text: string) => {
    setIsSubmittingLog(true);
    try {
      const newLog = await addLogEntry(text);
      setLogs((prevLogs) => [newLog, ...prevLogs]);
      toast({
        title: "Log Saved",
        description: `Your entry "${text.substring(0,20)}..." has been saved.`,
      });
      // Refresh prompts after a new log is added
      handleRefreshPrompts();
    } catch (error) {
      console.error("Error submitting log:", error);
      toast({
        title: "Error",
        description: "Failed to save your log entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingLog(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="p-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-sm z-10">
        <div className="container mx-auto flex items-center space-x-2">
          <NotebookText className="h-8 w-8 text-primary" />
          <h1 className="text-2xl font-semibold tracking-tight">DaybookAI</h1>
        </div>
      </header>

      <main className="flex-grow container mx-auto p-4 md:p-6 lg:p-8 flex flex-col space-y-6 overflow-y-auto">
        <AIPromptDisplay
          prompts={aiPrompts}
          onRefreshPrompts={handleRefreshPrompts}
          isLoadingPrompts={isLoadingPrompts}
        />
        
        <Separator />

        <div className="flex-grow space-y-4">
          {isLoadingLogs ? (
            <>
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
              <Skeleton className="h-24 w-full rounded-lg" />
            </>
          ) : (
            <LogDisplay logs={logs} />
          )}
        </div>
      </main>

      <footer className="p-4 border-t border-border sticky bottom-0 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto">
          <LogEntryForm onSubmit={handleNewLogSubmit} isSubmitting={isSubmittingLog} />
        </div>
      </footer>
    </div>
  );
}
