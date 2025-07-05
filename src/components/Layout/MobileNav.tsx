
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Grid2x2, 
  Circle, 
  PieChart, 
  TrendingUp,
  Sparkles,
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Dashboard',
    url: '/',
    icon: Grid2x2,
  },
  {
    title: 'Transações',
    url: '/transactions',
    icon: Circle,
  },
  {
    title: 'Relatórios',
    url: '/reports',
    icon: PieChart,
  },
  {
    title: 'Metas',
    url: '/goals',
    icon: TrendingUp,
  },
  {
    title: 'IA',
    url: '/ai',
    icon: Sparkles,
  },
];

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass-effect border-t border-white/20 bg-white/10 backdrop-blur-xl">
      <div className="flex items-center justify-around py-2 px-4">
        {navigationItems.map((item) => (
          <NavLink
            key={item.title}
            to={item.url}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200",
                "hover:bg-white/20",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground"
              )
            }
          >
            <item.icon className="h-5 w-5" />
            <span className="text-xs font-medium">{item.title}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
