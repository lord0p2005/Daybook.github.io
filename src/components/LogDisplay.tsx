
import type { LogEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CategoryIcon } from '@/components/icons'; 
import { formatDistanceToNow, parseISO } from 'date-fns';
import { Pencil } from 'lucide-react'; // Added Pencil icon

interface LogDisplayProps {
  logs: LogEntry[];
  onStartEdit: (log: LogEntry) => void; // Callback to initiate editing
}

export function LogDisplay({ logs, onStartEdit }: LogDisplayProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        {/* This specific message might be better handled by the parent if a category has no logs */}
        <p className="text-sm">No entries for this category yet.</p> 
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {logs.map((log) => (
        <Card key={log.id} className="shadow-lg bg-card text-card-foreground">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div className="flex items-center space-x-2">
                <CategoryIcon category={log.category} className="text-primary" />
                <CardTitle className="text-lg font-semibold">
                  {log.category || 'Log Entry'}
                  {log.subcategory && <span className="text-base font-normal text-muted-foreground"> ({log.subcategory})</span>}
                </CardTitle>
              </div>
              <div className="flex items-center space-x-2">
                <p className="text-xs text-muted-foreground pt-1">
                  {formatDistanceToNow(parseISO(log.timestamp), { addSuffix: true })}
                </p>
                <Button variant="ghost" size="icon" onClick={() => onStartEdit(log)} aria-label="Edit log entry">
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {log.category && ( 
              <CardDescription className="text-xs">
                Confidence: {log.confidence ? (log.confidence * 100).toFixed(0) + '%' : 'N/A'}
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm">{log.text}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
