
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  className?: string;
}

export function StatsCard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  className 
}: StatsCardProps) {
  return (
    <Card className={cn(
      "hover-lift glass-effect border-white/20 transition-all duration-300 group",
      className
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xs md:text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors duration-200">
          {title}
        </CardTitle>
        <div className="p-1.5 md:p-2 rounded-lg bg-white/10 group-hover:bg-white/20 transition-all duration-200">
          <Icon className="h-3 w-3 md:h-4 md:w-4 text-primary group-hover:scale-110 transition-transform duration-200" />
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="text-lg md:text-2xl font-bold mb-1 gradient-text">{value}</div>
        {change && (
          <p className={cn(
            "text-xs font-medium flex items-center gap-1",
            changeType === 'positive' && "text-green-600 dark:text-green-400",
            changeType === 'negative' && "text-red-600 dark:text-red-400",
            changeType === 'neutral' && "text-muted-foreground"
          )}>
            {changeType === 'positive' && '↗'}
            {changeType === 'negative' && '↘'}
            {change}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
