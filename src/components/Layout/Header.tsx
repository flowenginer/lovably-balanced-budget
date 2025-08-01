
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useFinancial } from '@/contexts/FinancialContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, Settings, LogOut, Sun, Moon, Sparkles, Cog } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/components/providers/ThemeProvider';
import logoDark from '@/assets/logo-dark.png';
import logoLight from '@/assets/logo-light.png';

export function Header() {
  const { user, logout } = useAuth();
  const { userProfile } = useFinancial();
  const { theme, setTheme } = useTheme();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  return (
    <header className={cn(
      "border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-40",
      isMobile ? "h-16" : "h-20"
    )}>
      <div className={cn(
        "flex items-center justify-between h-full",
        isMobile ? "px-4 pr-6" : "px-6"
      )}>
        <div className="flex items-center gap-4">
          {!isMobile && <SidebarTrigger className="hover-lift hover:bg-white/20" />}
          
          {/* Mobile Logo */}
          {isMobile && (
            <div className="flex items-center gap-2">
              <img 
                src={theme === 'dark' ? logoDark : logoLight} 
                alt="Dindin Logo" 
                className="h-16 w-auto"
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Theme Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
            className="glass-effect hover-lift"
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Alternar tema</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn(
                "relative rounded-full hover-lift glass-effect",
                isMobile ? "h-9 w-9" : "h-10 w-10"
              )}>
                <Avatar className={isMobile ? "h-9 w-9" : "h-10 w-10"}>
                  <AvatarFallback className="gradient-bg-primary text-white font-semibold">
                    {userProfile?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 bg-popover border-border z-50" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none text-popover-foreground">{userProfile?.name || 'Usuário'}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {userProfile?.email || user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isMobile && (
                <>
                  <DropdownMenuItem 
                    onClick={() => navigate('/ai')}
                    className="hover:bg-accent transition-colors duration-200 cursor-pointer"
                  >
                    <Sparkles className="h-4 w-4 mr-2" />
                    IA
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => navigate('/settings')}
                    className="hover:bg-accent transition-colors duration-200 cursor-pointer"
                  >
                    <Cog className="h-4 w-4 mr-2" />
                    Configurações
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              <DropdownMenuItem 
                onClick={logout}
                className="hover:bg-accent transition-colors duration-200 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
