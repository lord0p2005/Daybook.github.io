
export interface LogEntry {
  id: string;
  timestamp: string; // Store as ISO string for easier serialization
  text: string;
  category?: string;
  subcategory?: string; // Added for more specific categorization
  confidence?: number;
}
