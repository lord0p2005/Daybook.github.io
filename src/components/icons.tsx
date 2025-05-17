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
  Icon as LucideIcon, // Default icon
} from 'lucide-react';

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
  Other: Sparkle,
};

export function CategoryIcon({ category, className, ...props }: CategoryIconProps) {
  const IconComponent = category && iconMap[category] ? iconMap[category] : Sparkle; // Default to Sparkle if no category or not found
  return <IconComponent className={cn("h-5 w-5", className)} {...props} />;
}

// Helper function for cn if not already available globally in this component context
// (usually it is via "@/lib/utils")
// If you have cn in utils, you can remove this.
const cn = (...inputs: any[]) => inputs.filter(Boolean).join(' ');
