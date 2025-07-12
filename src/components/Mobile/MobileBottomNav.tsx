import { Button } from '@/components/ui/button';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, 
  PieChart, 
  Plus, 
  Target,
  List
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MobileBottomNavProps {
  onAddTransaction: (type?: 'income' | 'expense') => void;
}

export function MobileBottomNav({ onAddTransaction }: MobileBottomNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const navItems = [
    { icon: Home, label: 'Dashboard', path: '/' },
    { icon: Target, label: 'Metas', path: '/goals' },
    { icon: PieChart, label: 'Relatórios', path: '/reports' },
    { icon: List, label: 'Transações', path: '/transactions' },
  ];

  return (
    <div className="fixed bottom-6 left-0 right-0 bg-background/95 backdrop-blur-sm border-t border-border z-50 pb-2">
      <div className="flex items-center justify-center px-2 py-3 relative max-w-full">
        {/* First two nav items */}
        <div className="flex flex-1 justify-around min-w-0">
          {navItems.slice(0, 2).map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-2 min-w-0",
                isActive(item.path) 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-xs font-medium truncate max-w-[60px]">{item.label}</span>
            </Button>
          ))}
        </div>

        {/* Central FAB with dropdown */}
        <div className="mx-4 flex-shrink-0">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                className="h-14 w-14 rounded-full bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 relative -top-4"
              >
                <Plus className="h-6 w-6 text-white" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="mb-2" align="center">
              <DropdownMenuItem onClick={() => onAddTransaction('income')}>
                <TrendingUp className="h-4 w-4 mr-2 text-green-500" />
                Adicionar Receita
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onAddTransaction('expense')}>
                <TrendingDown className="h-4 w-4 mr-2 text-red-500" />
                Adicionar Despesa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Last two nav items */}
        <div className="flex flex-1 justify-around min-w-0">
          {navItems.slice(2, 4).map((item) => (
            <Button
              key={item.path}
              variant="ghost"
              size="sm"
              onClick={() => navigate(item.path)}
              className={cn(
                "flex flex-col items-center gap-1 h-auto py-2 px-2 min-w-0",
                isActive(item.path) 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              <span className="text-xs font-medium truncate max-w-[60px]">{item.label}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}