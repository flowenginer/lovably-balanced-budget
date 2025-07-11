
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
} from '@/components/ui/sidebar';
import { 
  Circle, 
  Grid2x2, 
  PieChart, 
  Settings, 
  TrendingUp,
  FileText,
  Sparkles,
} from 'lucide-react';
import { useTheme } from '@/components/providers/ThemeProvider';
import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';

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
    icon: Sparkles,
  },
  {
    title: 'Configurações',
    url: '/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const { theme } = useTheme();

  return (
    <Sidebar className={cn(isCollapsed ? "w-16" : "w-72", "transition-all duration-300 border-r-0")}>
      <div className="h-full glass-effect rounded-r-2xl">
        {/* Logo Section */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <img 
              src={theme === 'dark' ? logoDark : logoLight} 
              alt="Dindin Logo" 
              className={isCollapsed ? "h-12 w-auto" : "h-14 w-auto"}
            />
          </div>
        </div>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-muted-foreground font-medium px-3 text-xs uppercase tracking-wider">
              Menu Principal
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="space-y-1 px-3">
                {navigationItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink 
                        to={item.url} 
                        className={({ isActive }) =>
                          cn(
                            "flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group relative",
                            "hover:bg-white/20 hover:shadow-lg hover:scale-[1.02]",
                            isActive 
                              ? "bg-white/20 text-primary font-medium shadow-lg backdrop-blur-sm" 
                              : "text-sidebar-foreground hover:text-primary"
                          )
                        }
                      >
                        <item.icon className="h-5 w-5 transition-all duration-200 group-hover:scale-110" />
                        {!isCollapsed && (
                          <span className="font-medium transition-all duration-200">
                            {item.title}
                          </span>
                        )}
                        {!isCollapsed && (
                          <div className="absolute right-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <div className="w-1 h-1 bg-primary rounded-full"></div>
                          </div>
                        )}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* Bottom decoration */}
        {!isCollapsed && (
          <div className="absolute bottom-6 left-6 right-6">
            <div className="h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
          </div>
        )}
      </div>
    </Sidebar>
  );
}
