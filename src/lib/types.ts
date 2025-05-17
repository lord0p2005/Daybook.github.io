
export interface LogEntry {
  id: string;
  timestamp: string; // Store as ISO string for easier serialization
  text: string;
  category?: string;
  subcategory?: string; // Added for more specific categorization
  confidence?: number;
}

export interface Goal {
  id: string;
  text: string;
  createdAt: string; // ISO string
  targetDate?: string; // Optional ISO string for target completion date
  status: 'active' | 'completed' | 'archived';
  updatedAt: string; // ISO string, to track last modification
}
