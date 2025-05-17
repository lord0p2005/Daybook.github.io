
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
    <Card className="mb-6 bg-card text-card-foreground shadow-md">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center space-x-2">
          <MessageSquareQuote className="h-6 w-6 text-primary" />
          <CardTitle className="text-xl">Daily Reflection Prompts</CardTitle>
        </div>
        <Button variant="ghost" size="icon" onClick={onRefreshPrompts} disabled={isLoadingPrompts} aria-label="Refresh prompts">
          {isLoadingPrompts ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {prompts.length > 0 ? (
          <ul className="space-y-2 text-sm text-muted-foreground list-disc list-inside">
            {prompts.map((prompt, index) => (
              <li key={index}>{prompt}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground">No prompts available right now. Feel free to share anything on your mind!</p>
        )}
      </CardContent>
    </Card>
  );
}
