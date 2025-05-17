
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { LogEntry } from '@/lib/types';
import { addLogEntry, getLogs, getAIPrompts, updateLogEntry } from '@/lib/actions';
import { LogEntryForm } from '@/components/LogEntryForm';
import { LogDisplay } from '@/components/LogDisplay';
import { AIPromptDisplay } from '@/components/AIPromptDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { NotebookText, Pencil } from 'lucide-react';

// Helper function to group logs by category
const groupLogsByCategory = (logs: LogEntry[]): Record<string, LogEntry[]> => {
  return logs.reduce((acc, log) => {
    const category = log.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(log);
    return acc;
  }, {} as Record<string, LogEntry[]>);
};

const CATEGORY_ORDER: string[] = ['Learning', 'Work', 'Personal', 'Health', 'Social', 'Travel', 'Errands', 'Philosophy', 'Other', 'Uncategorized'];

export default function DaybookPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [aiPrompts, setAiPrompts] = useState<string[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  
  // State for editing logs
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEditingLog, setCurrentEditingLog] = useState<LogEntry | null>(null);
  const [editText, setEditText] = useState('');
  const [isUpdatingLog, setIsUpdatingLog] = useState(false);

  const { toast } = useToast();

  const fetchInitialData = useCallback(async () => {
    setIsLoadingLogs(true);
    setIsLoadingPrompts(true);
    try {
      const [fetchedLogs, fetchedPrompts] = await Promise.all([
        getLogs(),
        getAIPrompts()
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
      await handleRefreshPrompts(); // Refresh prompts after adding a new log
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

  const handleOpenEditDialog = (log: LogEntry) => {
    setCurrentEditingLog(log);
    setEditText(log.text);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setIsEditDialogOpen(false);
    setCurrentEditingLog(null);
    setEditText('');
  };

  const handleSaveChanges = async () => {
    if (!currentEditingLog || editText.trim() === '') {
      toast({
        title: "Error",
        description: "Log entry text cannot be empty.",
        variant: "destructive",
      });
      return;
    }
    setIsUpdatingLog(true);
    try {
      const updatedLog = await updateLogEntry(currentEditingLog.id, editText);
      if (updatedLog) {
        setLogs(prevLogs => prevLogs.map(log => log.id === updatedLog.id ? updatedLog : log));
        toast({
          title: "Log Updated",
          description: "Your entry has been successfully updated.",
        });
        await handleRefreshPrompts(); // Refresh prompts after editing a log
      } else {
        throw new Error("Update returned null");
      }
      handleCloseEditDialog();
    } catch (error) {
      console.error("Error updating log:", error);
      toast({
        title: "Error",
        description: "Failed to update your log entry. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingLog(false);
    }
  };

  const groupedLogs = groupLogsByCategory(logs);
  const displayCategories = CATEGORY_ORDER.filter(cat => groupedLogs[cat] && groupedLogs[cat].length > 0);

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
              <Skeleton className="h-32 w-full rounded-lg mb-6" />
              <Skeleton className="h-32 w-full rounded-lg mb-6" />
              <Skeleton className="h-32 w-full rounded-lg" />
            </>
          ) : displayCategories.length > 0 ? (
            displayCategories.map((category) => (
              <Card key={category} className="shadow-lg bg-card text-card-foreground">
                <CardHeader>
                  <CardTitle className="text-xl">{category.charAt(0).toUpperCase() + category.slice(1)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <LogDisplay logs={groupedLogs[category]} onStartEdit={handleOpenEditDialog} />
                </CardContent>
              </Card>
            ))
          ) : (
            !isSubmittingLog && ( // Only show if not in the process of submitting the very first log
              <Card className="shadow-lg bg-card text-card-foreground">
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground py-8">
                    <p className="text-lg">Your daybook is empty.</p>
                    <p>Start by writing down what you did today!</p>
                  </div>
                </CardContent>
              </Card>
            )
          )}
        </div>
      </main>

      <footer className="p-4 border-t border-border sticky bottom-0 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto">
          <LogEntryForm onSubmit={handleNewLogSubmit} isSubmitting={isSubmittingLog} />
        </div>
      </footer>

      {/* Edit Log Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">
              <Pencil className="mr-2 h-5 w-5" /> Edit Log Entry
            </DialogTitle>
            <DialogDescription>
              Make changes to your log entry below. The entry will be re-categorized upon saving.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Edit your log entry..."
              className="min-h-[100px] bg-input text-foreground placeholder:text-muted-foreground"
              rows={5}
              disabled={isUpdatingLog}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isUpdatingLog}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveChanges} disabled={isUpdatingLog || editText.trim() === ''}>
              {isUpdatingLog ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
              ) : null}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
