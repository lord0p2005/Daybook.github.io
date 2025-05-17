
import { Button } from '@/components/ui/button';
import { RefreshCw, MessageSquareQuote } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface AIPromptDisplayProps {
  prompts: string[];
  onRefreshPrompts: () => void;
  isLoadingPrompts: boolean;
}

export function AIPromptDisplay({ prompts, onRefreshPrompts, isLoadingPrompts }: AIPromptDisplayProps) {
  return (
    <Card className="mb-4 bg-card text-card-foreground shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4">
        <div className="flex items-center space-x-2">
          <MessageSquareQuote className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Daily Reflection Prompts</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={onRefreshPrompts} disabled={isLoadingPrompts} aria-label="Refresh prompts">
          {isLoadingPrompts ? (
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent className="px-4 pb-3">
        {prompts.length > 0 ? (
          <ul className="space-y-1 text-xs text-muted-foreground list-disc list-inside">
            {prompts.map((prompt, index) => (
              <li key={index}>{prompt}</li>
            ))}
          </ul>
        ) : (
          <p className="text-xs text-muted-foreground">No prompts available. Share anything on your mind!</p>
        )}
      </CardContent>
    </Card>
  );
}
