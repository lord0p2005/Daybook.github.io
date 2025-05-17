
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { Goal } from '@/lib/types';
import { 
  addGoal, getGoals, updateGoal, deleteGoal
} from '@/lib/actions';

import { GoalEntryForm } from '@/components/GoalEntryForm';
import { GoalsPanel } from '@/components/GoalsPanel';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Pencil, CalendarIcon, Flag } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';

export default function GoalsPage() {
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

  const fetchPageData = useCallback(async () => {
    setIsLoadingGoals(true);
    try {
      const fetchedGoals = await getGoals();
      setGoals(fetchedGoals);
    } catch (error) {
      console.error("Error fetching goals:", error);
      toast({
        title: "Error",
        description: "Could not load your goals. Please try refreshing.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingGoals(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);

  const handleNewGoalSubmit = async (text: string, targetDate?: string) => {
    setIsSubmittingGoal(true);
    try {
      const newGoal = await addGoal(text, targetDate);
      // Instead of directly manipulating state, refetch to get sorted list from server action
      await fetchPageData(); 
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
        await fetchPageData(); // Refetch to get sorted list
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
        targetDate: editGoalTargetDate ? editGoalTargetDate.toISOString() : null,
      });
      if (updated) {
        await fetchPageData(); // Refetch
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
    setIsUpdatingGoal(true);
    try {
      await deleteGoal(goalToDelete.id);
      await fetchPageData(); // Refetch
      toast({ title: "Goal Deleted", description: `Goal "${goalToDelete.text.substring(0,20)}..." deleted.` });
      setIsDeleteGoalDialogOpen(false);
      setGoalToDelete(null);
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete goal.", variant: "destructive" });
    } finally {
      setIsUpdatingGoal(false);
    }
  };

  return (
    <>
      <Separator />
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
    </>
  );
}
