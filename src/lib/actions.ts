
'use server';

import type { LogEntry } from '@/lib/types';
import { categorizeLogEntry } from '@/ai/flows/categorize-log-entry';
import { aiPromptDailyLog } from '@/ai/flows/ai-prompt-daily-log';

// In-memory store for demonstration purposes.
// A real application would use a database.
let logs: LogEntry[] = [];
let nextLogId = 1;

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
    throw new Error("Failed to add and categorize log entry.");
  }
}

export async function updateLogEntry(id: string, newText: string): Promise<LogEntry | null> {
  const logIndex = logs.findIndex(log => log.id === id);
  if (logIndex === -1) {
    console.error("Log not found for ID:", id);
    return null; // Or throw an error
  }

  try {
    const { category, subcategory, confidence } = await categorizeLogEntry({ logEntry: newText });
    
    const updatedLogEntry: LogEntry = {
      ...logs[logIndex],
      text: newText,
      category,
      subcategory,
      confidence,
      // Optionally update timestamp to reflect edit time, or add a new 'lastEdited' field
      // For now, keeping original timestamp for simplicity of the LogEntry type
    };

    logs[logIndex] = updatedLogEntry;
    return updatedLogEntry;
  } catch (error) {
    console.error("Error updating log entry:", error);
    throw new Error("Failed to update and categorize log entry.");
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
