import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFinancial } from '@/contexts/FinancialContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet"
import { 
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
  navigationMenuTriggerStyle
} from "@/components/ui/navigation-menu"
import { Home, LayoutDashboard, Users, Settings, File, PieChart, Banknote } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

export function Sidebar() {
  const { user } = useAuth();
  const { activeTab, accounts } = useFinancial();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);

  const menuItems = [
    {
      title: 'Dashboard',
      url: '/',
      icon: LayoutDashboard
    },
    {
      title: 'Transações',
      url: '/transactions',
      icon: File
    },
    {
      title: 'Categorias',
      url: '/categories',
      icon: PieChart
    },
    {
      title: 'Contas',
      url: '/accounts',
      icon: Users
    },
    {
      title: 'Contas Bancárias',
      url: '/bank-accounts',
      icon: Banknote,
      badge: accounts.filter(a => a.entityType === activeTab).length
    },
    {
      title: 'Configurações',
      url: '/settings',
      icon: Settings
    },
  ];

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <aside className={cn(
          "flex flex-col w-72 border-r border-white/10 bg-white/5 backdrop-blur-sm h-screen fixed top-0 left-0 z-50",
          isMobile ? "hidden" : "block"
        )}>
          <div className="flex items-center justify-center h-20 border-b border-white/10">
            <h1 className="text-2xl font-bold gradient-text">FinanceAI</h1>
          </div>

          <nav className="flex-1 py-4">
            <ul>
              {menuItems.map((item) => (
                <li key={item.title}>
                  <Link to={item.url} className="flex items-center h-12 px-6 space-x-2 hover:bg-white/20 transition-colors duration-200">
                    <item.icon className="w-5 h-5" />
                    <span>{item.title}</span>
                    {item.badge && (
                      <Badge className="ml-auto">{item.badge}</Badge>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </SheetTrigger>
      <SheetContent side="left" className="w-64">
        <div className="flex items-center justify-center h-20 border-b border-white/10">
          <h1 className="text-2xl font-bold gradient-text">FinanceAI</h1>
        </div>

        <nav className="flex-1 py-4">
          <ul>
            {menuItems.map((item) => (
              <li key={item.title}>
                <Link to={item.url} className="flex items-center h-12 px-6 space-x-2 hover:bg-white/20 transition-colors duration-200">
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                  {item.badge && (
                    <Badge className="ml-auto">{item.badge}</Badge>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
