import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Receipt, 
  PieChart, 
  Plus, 
  MoreHorizontal,
  Target,
  Settings,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileBottomNavProps {
  onAddTransaction: () => void;
}

export function MobileBottomNav({ onAddTransaction }: MobileBottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: 'Principal', path: '/' },
    { icon: List, label: 'Transações', path: '/transactions' },
    { icon: Target, label: 'Planejamento', path: '/goals' },
    { icon: MoreHorizontal, label: 'Mais', path: '/settings' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50">
      <div className="flex items-center justify-center px-4 py-3 relative">
        {/* First two nav items */}
        <div className="flex flex-1 justify-around">
          {navItems.slice(0, 2).map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-3",
                isActive(item.path) 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          ))}
        </div>

        {/* Central FAB */}
        <div className="mx-6">
          <Button
            onClick={onAddTransaction}
            size="icon"
            className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 relative -top-4"
          >
            <Plus className="h-6 w-6 text-white" />
          </Button>
        </div>

        {/* Last two nav items */}
        <div className="flex flex-1 justify-around">
          {navItems.slice(2, 4).map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-3",
                isActive(item.path) 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}