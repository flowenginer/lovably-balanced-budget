
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { 
  Circle, 
  Grid2x2, 
  PieChart, 
  Settings, 
  User, 
  Plus, 
  TrendingUp,
  FileText,
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
    title: 'IA Financeira',
    url: '/ai',
    icon: FileText,
  },
  {
    title: 'Configurações',
    url: '/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const { collapsed } = useSidebar();

  return (
    <Sidebar className={cn(collapsed ? "w-14" : "w-64", "transition-all duration-300")}>
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">F</span>
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-lg">FinanceAI</h2>
              <p className="text-xs text-muted-foreground">Gestão Inteligente</p>
            </div>
          )}
        </div>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-2 p-2 rounded-lg transition-colors",
                          isActive 
                            ? "bg-primary/10 text-primary font-medium" 
                            : "hover:bg-muted/50"
                        )
                      }
                    >
                      <item.icon className="h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
