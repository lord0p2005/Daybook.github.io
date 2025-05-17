
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { LogEntry, Goal } from '@/lib/types';
import { 
  addLogEntry, getLogs, getAIPrompts, updateLogEntry,
  addGoal, getGoals, updateGoal, deleteGoal
} from '@/lib/actions';

import { LogEntryForm } from '@/components/LogEntryForm';
import { LogDisplay } from '@/components/LogDisplay';
import { AIPromptDisplay } from '@/components/AIPromptDisplay';
import { GoalEntryForm } from '@/components/GoalEntryForm';
import { GoalsPanel } from '@/components/GoalsPanel';

import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { NotebookText, Pencil, CalendarIcon, Flag } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils'; // Added missing import

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
  // Logs state
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [aiPrompts, setAiPrompts] = useState<string[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isLoadingPrompts, setIsLoadingPrompts] = useState(true);
  const [isSubmittingLog, setIsSubmittingLog] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEditingLog, setCurrentEditingLog] = useState<LogEntry | null>(null);
  const [editText, setEditText] = useState('');
  const [isUpdatingLog, setIsUpdatingLog] = useState(false);

  // Goals state
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoadingGoals, setIsLoadingGoals] = useState(true);
  const [isSubmittingGoal, setIsSubmittingGoal] = useState(false);
  const [isEditGoalDialogOpen, setIsEditGoalDialogOpen] = useState(false);
  const [currentEditingGoal, setCurrentEditingGoal] = useState<Goal | null>(null);
  const [editGoalText, setEditGoalText] = useState('');
  const [editGoalTargetDate, setEditGoalTargetDate] = useState<Date | undefined>(undefined);
  const [isUpdatingGoal, setIsUpdatingGoal] = useState(false);
  const [isDeleteGoalDialogOpen, setIsDeleteGoalDialogOpen] = useState(false);
  const [goalToDelete, setGoalToDelete] = useState<Goal | null>(null);


  const { toast } = useToast();

  const fetchInitialData = useCallback(async () => {
    setIsLoadingLogs(true);
    setIsLoadingPrompts(true);
    setIsLoadingGoals(true);
    try {
      const [fetchedLogs, fetchedPrompts, fetchedGoals] = await Promise.all([
        getLogs(),
        getAIPrompts(),
        getGoals()
      ]);
      setLogs(fetchedLogs);
      setAiPrompts(fetchedPrompts);
      setGoals(fetchedGoals);
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
      setIsLoadingGoals(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // --- Log Functions ---
  const handleRefreshPrompts = useCallback(async () => {
    setIsLoadingPrompts(true);
    try {
      const fetchedPrompts = await getAIPrompts(logs);
      setAiPrompts(fetchedPrompts);
    } catch (error) {
      console.error("Error refreshing prompts:", error);
      toast({ title: "Error", description: "Could not refresh prompts.", variant: "destructive" });
    } finally {
      setIsLoadingPrompts(false);
    }
  }, [logs, toast]);

  const handleNewLogSubmit = async (text: string) => {
    setIsSubmittingLog(true);
    try {
      const newLog = await addLogEntry(text);
      setLogs((prevLogs) => [newLog, ...prevLogs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
      toast({ title: "Log Saved", description: `Entry "${text.substring(0,20)}..." saved.` });
      await handleRefreshPrompts();
    } catch (error) {
      console.error("Error submitting log:", error);
      toast({ title: "Error", description: "Failed to save log entry.", variant: "destructive" });
    } finally {
      setIsSubmittingLog(false);
    }
  };

  const handleOpenEditLogDialog = (log: LogEntry) => {
    setCurrentEditingLog(log);
    setEditText(log.text);
    setIsEditDialogOpen(true);
  };

  const handleCloseEditLogDialog = () => {
    setIsEditDialogOpen(false);
    setCurrentEditingLog(null);
    setEditText('');
  };

  const handleSaveLogChanges = async () => {
    if (!currentEditingLog || editText.trim() === '') {
      toast({ title: "Error", description: "Log text cannot be empty.", variant: "destructive" });
      return;
    }
    setIsUpdatingLog(true);
    try {
      const updatedLog = await updateLogEntry(currentEditingLog.id, editText);
      if (updatedLog) {
        setLogs(prevLogs => prevLogs.map(log => log.id === updatedLog.id ? updatedLog : log).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
        toast({ title: "Log Updated", description: "Entry updated." });
        await handleRefreshPrompts();
      } else throw new Error("Update returned null");
      handleCloseEditLogDialog();
    } catch (error) {
      console.error("Error updating log:", error);
      toast({ title: "Error", description: "Failed to update log.", variant: "destructive" });
    } finally {
      setIsUpdatingLog(false);
    }
  };

  // --- Goal Functions ---
  const handleNewGoalSubmit = async (text: string, targetDate?: string) => {
    setIsSubmittingGoal(true);
    try {
      const newGoal = await addGoal(text, targetDate);
      setGoals(prevGoals => [newGoal, ...prevGoals].sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
      toast({ title: "Goal Added", description: `Goal "${text.substring(0,20)}..." added.` });
    } catch (error) {
      console.error("Error submitting goal:", error);
      toast({ title: "Error", description: (error as Error).message || "Failed to save goal.", variant: "destructive" });
    } finally {
      setIsSubmittingGoal(false);
    }
  };
  
  const handleUpdateGoalStatus = async (id: string, status: Goal['status']) => {
    setIsUpdatingGoal(true);
    try {
      const updated = await updateGoal(id, { status });
      if (updated) {
        setGoals(prevGoals => prevGoals.map(g => g.id === id ? updated : g).sort((a,b) => {
             if (a.status === 'active' && b.status !== 'active') return -1;
             if (a.status !== 'active' && b.status === 'active') return 1;
             return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        }));
        toast({ title: "Goal Updated", description: `Goal marked as ${status}.` });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update goal status.", variant: "destructive" });
    } finally {
      setIsUpdatingGoal(false);
    }
  };

  const handleOpenEditGoalDialog = (goal: Goal) => {
    setCurrentEditingGoal(goal);
    setEditGoalText(goal.text);
    setEditGoalTargetDate(goal.targetDate ? parseISO(goal.targetDate) : undefined);
    setIsEditGoalDialogOpen(true);
  };

  const handleCloseEditGoalDialog = () => {
    setIsEditGoalDialogOpen(false);
    setCurrentEditingGoal(null);
    setEditGoalText('');
    setEditGoalTargetDate(undefined);
  };

  const handleSaveGoalChanges = async () => {
    if (!currentEditingGoal || editGoalText.trim() === '') {
      toast({ title: "Error", description: "Goal text cannot be empty.", variant: "destructive" });
      return;
    }
    setIsUpdatingGoal(true);
    try {
      const updated = await updateGoal(currentEditingGoal.id, {
        text: editGoalText,
        targetDate: editGoalTargetDate ? editGoalTargetDate.toISOString() : null, // Pass null to clear
      });
      if (updated) {
        setGoals(prevGoals => prevGoals.map(g => g.id === updated.id ? updated : g));
        toast({ title: "Goal Updated", description: "Goal details saved." });
      }
      handleCloseEditGoalDialog();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update goal.", variant: "destructive" });
    } finally {
      setIsUpdatingGoal(false);
    }
  };
  
  const handleOpenDeleteGoalDialog = (goal: Goal) => {
    setGoalToDelete(goal);
    setIsDeleteGoalDialogOpen(true);
  };

  const handleConfirmDeleteGoal = async () => {
    if (!goalToDelete) return;
    setIsUpdatingGoal(true); // Use same flag for busy state
    try {
      await deleteGoal(goalToDelete.id);
      setGoals(prevGoals => prevGoals.filter(g => g.id !== goalToDelete.id));
      toast({ title: "Goal Deleted", description: `Goal "${goalToDelete.text.substring(0,20)}..." deleted.` });
      setIsDeleteGoalDialogOpen(false);
      setGoalToDelete(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete goal.", variant: "destructive" });
    } finally {
      setIsUpdatingGoal(false);
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

        {/* Goals Section */}
        <GoalEntryForm onSubmitGoal={handleNewGoalSubmit} isSubmittingGoal={isSubmittingGoal} />
        <GoalsPanel
            goals={goals}
            onUpdateGoalStatus={handleUpdateGoalStatus}
            onStartEditGoal={handleOpenEditGoalDialog}
            onDeleteGoal={(id) => {
                const goal = goals.find(g => g.id === id);
                if(goal) handleOpenDeleteGoalDialog(goal);
            }}
            isLoadingGoals={isLoadingGoals}
            isUpdatingGoal={isUpdatingGoal}
        />

        <Separator />

        <h2 className="text-2xl font-semibold tracking-tight flex items-center">
            <NotebookText className="mr-2 h-6 w-6 text-primary"/> Daily Logs
        </h2>
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
                  <LogDisplay logs={groupedLogs[category]} onStartEdit={handleOpenEditLogDialog} />
                </CardContent>
              </Card>
            ))
          ) : (
            !isSubmittingLog && (
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
            <DialogTitle className="flex items-center"><Pencil className="mr-2 h-5 w-5" /> Edit Log Entry</DialogTitle>
            <DialogDescription>Make changes to your log. It will be re-categorized upon saving.</DialogDescription>
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
            <DialogClose asChild><Button type="button" variant="outline" disabled={isUpdatingLog}>Cancel</Button></DialogClose>
            <Button type="button" onClick={handleSaveLogChanges} disabled={isUpdatingLog || editText.trim() === ''}>
              {isUpdatingLog && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Goal Dialog */}
      <Dialog open={isEditGoalDialogOpen} onOpenChange={setIsEditGoalDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center"><Pencil className="mr-2 h-5 w-5" /> Edit Goal</DialogTitle>
            <DialogDescription>Update your goal details below.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <Textarea
              value={editGoalText}
              onChange={(e) => setEditGoalText(e.target.value)}
              placeholder="Edit your goal..."
              className="min-h-[80px] bg-input text-foreground placeholder:text-muted-foreground"
              rows={3}
              disabled={isUpdatingGoal}
            />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal bg-input text-foreground hover:text-accent-foreground",
                    !editGoalTargetDate && "text-muted-foreground"
                  )}
                  disabled={isUpdatingGoal}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {editGoalTargetDate ? format(editGoalTargetDate, "PPP") : <span>Set target date (optional)</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={editGoalTargetDate}
                  onSelect={setEditGoalTargetDate}
                  disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))}
                />
              </PopoverContent>
            </Popover>
             {editGoalTargetDate && (
                <Button variant="ghost" size="sm" onClick={() => setEditGoalTargetDate(undefined)} disabled={isUpdatingGoal}>
                    Clear Target Date
                </Button>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" disabled={isUpdatingGoal}>Cancel</Button></DialogClose>
            <Button type="button" onClick={handleSaveGoalChanges} disabled={isUpdatingGoal || editGoalText.trim() === ''}>
              {isUpdatingGoal && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />}
              Save Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Goal Confirmation Dialog */}
      <Dialog open={isDeleteGoalDialogOpen} onOpenChange={setIsDeleteGoalDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center">Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the goal: "{goalToDelete?.text.substring(0, 50)}..."? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline" disabled={isUpdatingGoal}>Cancel</Button>
            </DialogClose>
            <Button type="button" variant="destructive" onClick={handleConfirmDeleteGoal} disabled={isUpdatingGoal}>
              {isUpdatingGoal && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />}
              Delete Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
}
