
import type { LogEntry } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CategoryIcon } from '@/components/icons'; 
import { formatDistanceToNow, parseISO } from 'date-fns';

interface LogDisplayProps {
  logs: LogEntry[];
}

export function LogDisplay({ logs }: LogDisplayProps) {
  if (logs.length === 0) {
    return (
      <div className="text-center text-muted-foreground py-8">
        <p className="text-lg">Your daybook is empty.</p>
        <p>Start by writing down what you did today!</p>
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
              <p className="text-xs text-muted-foreground pt-1">
                {formatDistanceToNow(parseISO(log.timestamp), { addSuffix: true })}
              </p>
            </div>
            {log.category && ( // This description shows confidence, could also show subcategory if not in title
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
