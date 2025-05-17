
'use client';

import { useEffect, useState, useCallback } from 'react';
import type { LogEntry } from '@/lib/types';
import { getLogs, updateLogEntry, getCustomCategoryNamesMap, setCustomCategoryName } from '@/lib/actions';

import { LogDisplay } from '@/components/LogDisplay';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, DialogClose,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { NotebookText, Pencil } from 'lucide-react';

// Helper function to group logs by category (can be moved to utils if used elsewhere)
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

export default function LogsPage() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentEditingLog, setCurrentEditingLog] = useState<LogEntry | null>(null);
  const [editText, setEditText] = useState('');
  const [isUpdatingLog, setIsUpdatingLog] = useState(false);
  
  const [customCategoryNames, setCustomCategoryNames] = useState<Map<string, string>>(new Map());
  const [isRenameCategoryDialogOpen, setIsRenameCategoryDialogOpen] = useState(false);
  const [categoryToRename, setCategoryToRename] = useState<string | null>(null);
  const [newCategoryNameInput, setNewCategoryNameInput] = useState('');
  const [isUpdatingCategoryName, setIsUpdatingCategoryName] = useState(false);


  const { toast } = useToast();

  const fetchPageData = useCallback(async () => {
    setIsLoadingLogs(true);
    try {
      const [fetchedLogs, fetchedCustomNames] = await Promise.all([
        getLogs(),
        getCustomCategoryNamesMap()
      ]);
      setLogs(fetchedLogs);
      setCustomCategoryNames(fetchedCustomNames);
    } catch (error) {
      console.error("Error fetching page data:", error);
      toast({
        title: "Error",
        description: "Could not load your data. Please try refreshing.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingLogs(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchPageData();
  }, [fetchPageData]);


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
        await fetchPageData(); 
        toast({ title: "Log Updated", description: "Entry updated." });
      } else throw new Error("Update returned null");
      handleCloseEditLogDialog();
    } catch (error) {
      console.error("Error updating log:", error);
      toast({ title: "Error", description: "Failed to update log.", variant: "destructive" });
    } finally {
      setIsUpdatingLog(false);
    }
  };

  const handleOpenRenameCategoryDialog = (categoryKey: string) => {
    setCategoryToRename(categoryKey);
    setNewCategoryNameInput(customCategoryNames.get(categoryKey) || '');
    setIsRenameCategoryDialogOpen(true);
  };

  const handleCloseRenameCategoryDialog = () => {
    setIsRenameCategoryDialogOpen(false);
    setCategoryToRename(null);
    setNewCategoryNameInput('');
  };

  const handleSaveCategoryName = async () => {
    if (!categoryToRename) return;
    if (newCategoryNameInput.trim() === (customCategoryNames.get(categoryToRename) || categoryToRename)) {
       handleCloseRenameCategoryDialog();
       return;
    }
    setIsUpdatingCategoryName(true);
    try {
      await setCustomCategoryName(categoryToRename, newCategoryNameInput);
      await fetchPageData(); // Refetch custom names and potentially logs if display changes
      toast({ title: "Category Renamed", description: `Category "${categoryToRename}" display name updated.` });
      handleCloseRenameCategoryDialog();
    } catch (error) {
      console.error("Error renaming category:", error);
      toast({ title: "Error", description: "Failed to rename category.", variant: "destructive" });
    } finally {
      setIsUpdatingCategoryName(false);
    }
  };
  
  const groupedLogs = groupLogsByCategory(logs);
  const displayCategories = CATEGORY_ORDER.filter(cat => groupedLogs[cat] && groupedLogs[cat].length > 0);

  return (
    <>
      <Separator />
      <h2 className="text-2xl font-semibold tracking-tight flex items-center">
          <NotebookText className="mr-2 h-6 w-6 text-primary"/> Your Daily Logs
      </h2>
      <div className="flex-grow space-y-4">
        {isLoadingLogs ? (
          <>
            <Skeleton className="h-32 w-full rounded-lg mb-6" />
            <Skeleton className="h-32 w-full rounded-lg mb-6" />
            <Skeleton className="h-32 w-full rounded-lg" />
          </>
        ) : displayCategories.length > 0 ? (
          displayCategories.map((categoryKey) => {
            const displayName = customCategoryNames.get(categoryKey) || (categoryKey.charAt(0).toUpperCase() + categoryKey.slice(1));
            return (
            <Card key={categoryKey} className="shadow-lg bg-card text-card-foreground">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">{displayName}</CardTitle>
                  <Button variant="ghost" size="icon" onClick={() => handleOpenRenameCategoryDialog(categoryKey)} aria-label={`Rename ${displayName} category`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <LogDisplay logs={groupedLogs[categoryKey]} onStartEdit={handleOpenEditLogDialog} />
              </CardContent>
            </Card>
          )})
        ) : (
           <Card className="shadow-lg bg-card text-card-foreground">
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground py-8">
                <p className="text-lg">Your daybook is empty for logs.</p>
                <p>Start by writing down what you did today using the form below!</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

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

      {/* Rename Category Dialog */}
      <Dialog open={isRenameCategoryDialogOpen} onOpenChange={setIsRenameCategoryDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center"><Pencil className="mr-2 h-5 w-5" /> Rename Category</DialogTitle>
            <DialogDescription>Set a new display name for the "{categoryToRename}" category. Leave blank to reset to default.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={newCategoryNameInput}
              onChange={(e) => setNewCategoryNameInput(e.target.value)}
              placeholder={`New name for ${categoryToRename}`}
              className="bg-input text-foreground placeholder:text-muted-foreground"
              disabled={isUpdatingCategoryName}
            />
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" disabled={isUpdatingCategoryName}>Cancel</Button></DialogClose>
            <Button type="button" onClick={handleSaveCategoryName} disabled={isUpdatingCategoryName}>
              {isUpdatingCategoryName && <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />}
              Save Name
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
