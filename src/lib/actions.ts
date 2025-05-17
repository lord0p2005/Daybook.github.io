
'use server';

import type { LogEntry, Goal } from '@/lib/types';
import { categorizeLogEntry } from '@/ai/flows/categorize-log-entry';
import { aiPromptDailyLog } from '@/ai/flows/ai-prompt-daily-log';

// In-memory store for demonstration purposes.
// A real application would use a database.
let logs: LogEntry[] = [];
let goals: Goal[] = [];


// --- Log Entry Functions ---

export async function addLogEntry(text: string): Promise<LogEntry> {
  try {
    const { category, subcategory, confidence } = await categorizeLogEntry({ logEntry: text });
    
    const newLogEntry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      text,
      category,
      subcategory, 
      confidence,
    };

    logs.unshift(newLogEntry); 
    return newLogEntry;
  } catch (error) {
    console.error("Error adding log entry:", error);
    throw new Error("Failed to add and categorize log entry.");
  }
}

export async function updateLogEntry(id: string, newText: string): Promise<LogEntry | null> {
  const logIndex = logs.findIndex(log => log.id === id);
  if (logIndex === -1) {
    console.error("Log not found for ID:", id);
    return null; 
  }

  try {
    const { category, subcategory, confidence } = await categorizeLogEntry({ logEntry: newText });
    
    const updatedLogEntry: LogEntry = {
      ...logs[logIndex],
      text: newText,
      category,
      subcategory,
      confidence,
    };

    logs[logIndex] = updatedLogEntry;
    return updatedLogEntry;
  } catch (error) {
    console.error("Error updating log entry:", error);
    throw new Error("Failed to update and categorize log entry.");
  }
}

export async function getLogs(): Promise<LogEntry[]> {
  return Promise.resolve([...logs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
}

export async function getAIPrompts(existingLogs?: LogEntry[]): Promise<string[]> {
  try {
    let previousLogsText = '';
    if (existingLogs && existingLogs.length > 0) {
      previousLogsText = existingLogs.slice(0, 3).map(log => {
        let logContext = log.text;
        if (log.category) logContext = `[${log.category}${log.subcategory ? ` - ${log.subcategory}` : ''}] ${logContext}`;
        return logContext;
      }).join('\n---\n');
    }
    
    const { promptQuestions } = await aiPromptDailyLog({ previousLogs: previousLogsText });
    return promptQuestions;
  } catch (error) {
    console.error("Error fetching AI prompts:", error);
    return ["Could not fetch AI prompts at this time. How was your day?"];
  }
}


// --- Goal Functions ---

export async function addGoal(text: string, targetDate?: string): Promise<Goal> {
  if (!text.trim()) {
    throw new Error("Goal text cannot be empty.");
  }
  const now = new Date().toISOString();
  const newGoal: Goal = {
    id: crypto.randomUUID(),
    text,
    createdAt: now,
    updatedAt: now,
    status: 'active',
    targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
  };
  goals.unshift(newGoal);
  return newGoal;
}

export async function getGoals(): Promise<Goal[]> {
  // Return sorted by status (active first), then by most recently updated
  return Promise.resolve(
    [...goals].sort((a, b) => {
      if (a.status === 'active' && b.status !== 'active') return -1;
      if (a.status !== 'active' && b.status === 'active') return 1;
      if (a.status === 'completed' && b.status === 'archived') return -1;
      if (a.status === 'archived' && b.status === 'completed') return 1;
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    })
  );
}

export async function updateGoal(id: string, updates: Partial<Pick<Goal, 'text' | 'status' | 'targetDate'>>): Promise<Goal | null> {
  const goalIndex = goals.findIndex(g => g.id === id);
  if (goalIndex === -1) {
    console.error("Goal not found for ID:", id);
    return null;
  }

  const updatedGoal = {
    ...goals[goalIndex],
    ...updates,
    targetDate: updates.targetDate === null ? undefined : (updates.targetDate ? new Date(updates.targetDate).toISOString() : goals[goalIndex].targetDate), // Handle null for clearing date
    updatedAt: new Date().toISOString(),
  };
  goals[goalIndex] = updatedGoal;
  return updatedGoal;
}


export async function deleteGoal(id: string): Promise<void> {
  goals = goals.filter(g => g.id !== id);
  return Promise.resolve();
}
