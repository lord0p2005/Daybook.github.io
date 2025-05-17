
'use client';

import { useState } from 'react';
import type { SubmitHandler } from 'react-hook-form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon, PlusCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const goalFormSchema = z.object({
  text: z.string().min(1, { message: 'Goal description cannot be empty.' }).max(280, { message: 'Goal description is too long (max 280 chars).' }),
  targetDate: z.date().optional(),
});

type GoalFormData = z.infer<typeof goalFormSchema>;

interface GoalEntryFormProps {
  onSubmitGoal: (text: string, targetDate?: string) => Promise<void>;
  isSubmittingGoal: boolean;
}

export function GoalEntryForm({ onSubmitGoal, isSubmittingGoal }: GoalEntryFormProps) {
  const { toast } = useToast();
  const form = useForm<GoalFormData>({
    resolver: zodResolver(goalFormSchema),
    defaultValues: {
      text: '',
      targetDate: undefined,
    },
  });

  const handleFormSubmit: SubmitHandler<GoalFormData> = async (data) => {
    try {
      await onSubmitGoal(data.text, data.targetDate?.toISOString());
      form.reset();
    } catch (error) {
      console.error("Error submitting goal:", error);
      toast({
        title: "Error",
        description: "Failed to save your goal. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4 mb-6 p-4 border rounded-lg shadow bg-card">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Goal</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What do you want to achieve? (e.g., Study Chapter 5 of Anatomy)"
                  className="resize-none bg-input text-foreground placeholder:text-muted-foreground"
                  rows={2}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex flex-col sm:flex-row sm:items-end sm:space-x-2 space-y-2 sm:space-y-0">
          <FormField
            control={form.control}
            name="targetDate"
            render={({ field }) => (
              <FormItem className="flex flex-col flex-grow">
                <FormLabel>Optional Target Date</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full justify-start text-left font-normal bg-input text-foreground hover:text-accent-foreground",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) => date < new Date(new Date().setHours(0,0,0,0))} // Disable past dates
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmittingGoal} className="w-full sm:w-auto whitespace-nowrap">
            {isSubmittingGoal ? (
              <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
            ) : (
              <PlusCircle className="mr-2 h-5 w-5" />
            )}
            Add Goal
          </Button>
        </div>
      </form>
    </Form>
  );
}
