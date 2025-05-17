
'use client';

import { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ArrowUpCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  logText: z.string().min(1, { message: 'Log entry cannot be empty.' }).max(1000, { message: 'Log entry is too long.'}),
});

type FormData = z.infer<typeof formSchema>;

interface LogEntryFormProps {
  onSubmit: (text: string) => Promise<void>;
  isSubmitting: boolean;
}

export function LogEntryForm({ onSubmit, isSubmitting }: LogEntryFormProps) {
  const { toast } = useToast();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      logText: '',
    },
  });

  const handleFormSubmit: SubmitHandler<FormData> = async (data) => {
    try {
      await onSubmit(data.logText);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save log entry. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="flex items-start space-x-2">
        <FormField
          control={form.control}
          name="logText"
          render={({ field }) => (
            <FormItem className="flex-grow">
              <FormControl>
                <Textarea
                  placeholder="What happened today?"
                  className="resize-none bg-input text-foreground placeholder:text-muted-foreground"
                  rows={2}
                  {...field}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (form.formState.isValid && !isSubmitting) {
                        form.handleSubmit(handleFormSubmit)();
                      }
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" size="icon" variant="primary" disabled={isSubmitting} aria-label="Submit log entry">
          {isSubmitting ? (
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
          ) : (
            <ArrowUpCircle className="h-6 w-6" />
          )}
        </Button>
      </form>
    </Form>
  );
}
