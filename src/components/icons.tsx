
import type { LucideProps } from 'lucide-react';
import {
  Briefcase,
  Smile,
  Activity,
  UsersRound,
  Globe,
  BookOpenText,
  ListChecks,
  Sparkle,
  Brain, 
  Flag, // For Goals section
  Target, // Alternative for Goals or specific goal items
  CircleDot, // For active goals
  CheckCircle2, // For completed goals
  Archive, // For archived goals
  ArchiveRestore, // To restore goals
  Icon as LucideIcon, 
} from 'lucide-react';
import { cn } from '@/lib/utils'; // Ensure cn is imported

interface CategoryIconProps extends LucideProps {
  category?: string;
}

const iconMap: Record<string, React.ElementType<LucideProps>> = {
  Work: Briefcase,
  Personal: Smile,
  Health: Activity,
  Social: UsersRound,
  Travel: Globe,
  Learning: BookOpenText,
  Errands: ListChecks,
  Philosophy: Brain, 
  Other: Sparkle,
};

export function CategoryIcon({ category, className, ...props }: CategoryIconProps) {
  const IconComponent = category && iconMap[category] ? iconMap[category] : Sparkle; 
  return <IconComponent className={cn("h-5 w-5", className)} {...props} />;
}

// General purpose GoalIcon
export function GoalStatusIcon({ status, className, ...props }: { status?: Goal['status'] } & LucideProps) {
  let IconComponent;
  switch (status) {
    case 'active':
      IconComponent = CircleDot;
      break;
    case 'completed':
      IconComponent = CheckCircle2;
      break;
    case 'archived':
      IconComponent = Archive;
      break;
    default:
      IconComponent = Flag; 
  }
  return <IconComponent className={cn("h-5 w-5", className)} {...props} />;
}

// Exporting other useful icons for goals if needed directly
export { Flag as GoalSectionIcon, Target as TargetIcon, CircleDot as ActiveGoalIcon, CheckCircle2 as CompletedGoalIcon, Archive as ArchiveIcon, ArchiveRestore as RestoreGoalIcon };
