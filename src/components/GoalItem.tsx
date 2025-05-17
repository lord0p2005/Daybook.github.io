
'use client';

import type { Goal } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { Pencil, Trash2, CalendarDays, CheckCircle2, CircleDot, Archive, ArchiveRestore } from 'lucide-react';

interface GoalItemProps {
  goal: Goal;
  onUpdateStatus: (id: string, status: Goal['status']) => void;
  onStartEdit: (goal: Goal) => void;
  onDelete: (id: string) => void;
  isUpdating: boolean;
}

export function GoalItem({ goal, onUpdateStatus, onStartEdit, onDelete, isUpdating }: GoalItemProps) {
  const handleToggleStatus = () => {
    if (goal.status === 'active') {
      onUpdateStatus(goal.id, 'completed');
    } else if (goal.status === 'completed') {
      onUpdateStatus(goal.id, 'active');
    } else if (goal.status === 'archived') {
      onUpdateStatus(goal.id, 'active'); // Or open a dialog to choose where to restore
    }
  };

  const handleArchive = () => {
    if (goal.status !== 'archived') {
      onUpdateStatus(goal.id, 'archived');
    }
  }

  return (
    <Card className={`mb-3 shadow-sm ${goal.status === 'completed' ? 'bg-muted/50' : 'bg-card'}`}>
      <CardContent className="p-4">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0 pt-1">
            {goal.status !== 'archived' && (
                <Checkbox
                id={`goal-${goal.id}`}
                checked={goal.status === 'completed'}
                onCheckedChange={handleToggleStatus}
                aria-label={goal.status === 'completed' ? 'Mark as active' : 'Mark as completed'}
                disabled={isUpdating}
                className="border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                />
            )}
            {goal.status === 'archived' && (
                 <Button variant="ghost" size="icon" onClick={handleToggleStatus} disabled={isUpdating} aria-label="Restore goal">
                    <ArchiveRestore className="h-5 w-5 text-primary" />
                </Button>
            )}
          </div>

          <div className="flex-grow">
            <label
              htmlFor={`goal-${goal.id}`}
              className={`block text-sm font-medium ${
                goal.status === 'completed' ? 'line-through text-muted-foreground' : 'text-card-foreground'
              }`}
            >
              {goal.text}
            </label>
            <div className="mt-1 flex items-center space-x-2 text-xs text-muted-foreground">
              {goal.targetDate && (
                <div className="flex items-center">
                  <CalendarDays className="mr-1 h-3 w-3" />
                  <span>Target: {format(parseISO(goal.targetDate), 'MMM d, yyyy')}</span>
                </div>
              )}
              {goal.targetDate && <span>&bull;</span>}
              <span>
                {goal.status === 'completed' ? 'Completed' : 'Added'}: {formatDistanceToNow(parseISO(goal.status === 'completed' ? goal.updatedAt : goal.createdAt), { addSuffix: true })}
              </span>
            </div>
             {goal.status === 'archived' && (
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-1">Archived: {formatDistanceToNow(parseISO(goal.updatedAt), { addSuffix: true })}</p>
            )}
          </div>

          <div className="flex-shrink-0 flex space-x-1">
            <Button variant="ghost" size="icon" onClick={() => onStartEdit(goal)} disabled={isUpdating} aria-label="Edit goal">
              <Pencil className="h-4 w-4" />
            </Button>
            {goal.status !== 'archived' && goal.status !== 'completed' && (
                 <Button variant="ghost" size="icon" onClick={handleArchive} disabled={isUpdating} aria-label="Archive goal">
                    <Archive className="h-4 w-4" />
                </Button>
            )}
            <Button variant="ghost" size="icon" onClick={() => onDelete(goal.id)} disabled={isUpdating} aria-label="Delete goal">
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
