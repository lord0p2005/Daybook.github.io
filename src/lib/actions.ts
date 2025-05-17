
'use server';

import type { LogEntry } from '@/lib/types';
import { categorizeLogEntry } from '@/ai/flows/categorize-log-entry';
import { aiPromptDailyLog } from '@/ai/flows/ai-prompt-daily-log';

// In-memory store for demonstration purposes.
// A real application would use a database.
let logs: LogEntry[] = [];

export async function addLogEntry(text: string): Promise<LogEntry> {
  try {
    const { category, subcategory, confidence } = await categorizeLogEntry({ logEntry: text });
    
    const newLogEntry: LogEntry = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      text,
      category,
      subcategory, // Include subcategory
      confidence,
    };

    logs.unshift(newLogEntry); // Add to the beginning for reverse chronological order
    return newLogEntry;
  } catch (error) {
    console.error("Error adding log entry:", error);
    // For simplicity, rethrow or return a specific error structure
    // In a real app, you might want to return a more user-friendly error
    throw new Error("Failed to add and categorize log entry.");
  }
}

export async function getLogs(): Promise<LogEntry[]> {
  // Logs are already stored in reverse chronological order
  return Promise.resolve([...logs]);
}

export async function getAIPrompts(existingLogs?: LogEntry[]): Promise<string[]> {
  try {
    let previousLogsText = '';
    if (existingLogs && existingLogs.length > 0) {
      // Use the last 3-5 logs as context, or a summary.
      // For simplicity, concatenating text of last 3 logs.
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
