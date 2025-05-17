
export interface LogEntry {
  id: string;
  timestamp: string; // Store as ISO string for easier serialization
  text: string;
  category?: string;
  confidence?: number;
}
