
'use client';

import type { Goal } from '@/lib/types';
import { GoalItem } from '@/components/GoalItem';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Flag, CheckCircle2, Archive, CircleDot } from 'lucide-react'; // Added CircleDot
import { Skeleton } from '@/components/ui/skeleton';

interface GoalsPanelProps {
  goals: Goal[];
  onUpdateGoalStatus: (id: string, status: Goal['status']) => void;
  onStartEditGoal: (goal: Goal) => void;
  onDeleteGoal: (id: string) => void;
  isLoadingGoals: boolean;
  isUpdatingGoal: boolean;
}

export function GoalsPanel({
  goals,
  onUpdateGoalStatus,
  onStartEditGoal,
  onDeleteGoal,
  isLoadingGoals,
  isUpdatingGoal,
}: GoalsPanelProps) {
  
  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const archivedGoals = goals.filter(g => g.status === 'archived');

  const renderGoalList = (goalList: Goal[], title: string, emptyMessage: string) => (
    <>
      {isLoadingGoals ? (
        <>
          <Skeleton className="h-20 w-full rounded-lg mb-3" />
          <Skeleton className="h-20 w-full rounded-lg" />
        </>
      ) : goalList.length > 0 ? (
        goalList.map(goal => (
          <GoalItem
            key={goal.id}
            goal={goal}
            onUpdateStatus={onUpdateGoalStatus}
            onStartEdit={onStartEditGoal}
            onDelete={onDeleteGoal}
            isUpdating={isUpdatingGoal}
          />
        ))
      ) : (
        <p className="text-sm text-muted-foreground py-4 text-center">{emptyMessage}</p>
      )}
    </>
  );

  return (
    <Card className="shadow-lg bg-card text-card-foreground">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Flag className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">Your Goals</CardTitle>
        </div>
        <CardDescription>Set, track, and accomplish your objectives.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="active">
              <CircleDot className="mr-2 h-4 w-4" /> Active ({activeGoals.length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              <CheckCircle2 className="mr-2 h-4 w-4" /> Completed ({completedGoals.length})
            </TabsTrigger>
            <TabsTrigger value="archived">
              <Archive className="mr-2 h-4 w-4" /> Archived ({archivedGoals.length})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="active">
            {renderGoalList(activeGoals, "Active Goals", "No active goals yet. Add one above!")}
          </TabsContent>
          <TabsContent value="completed">
            {renderGoalList(completedGoals, "Completed Goals", "No goals completed yet.")}
          </TabsContent>
          <TabsContent value="archived">
             {renderGoalList(archivedGoals, "Archived Goals", "No goals archived yet.")}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

