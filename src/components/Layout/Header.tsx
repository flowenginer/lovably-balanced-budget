
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
import { User, Settings, LogOut } from 'lucide-react';

export function Header() {
  const { user, logout } = useAuth();
  const { activeTab, setActiveTab } = useFinancial();
  const isMobile = useIsMobile();

  return (
    <header className={cn(
      "border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-40",
      isMobile ? "h-16" : "h-20"
    )}>
      <div className={cn(
        "flex items-center justify-between h-full",
        isMobile ? "px-4" : "px-6"
      )}>
        <div className="flex items-center gap-4">
          {!isMobile && <SidebarTrigger className="hover-lift hover:bg-white/20" />}
          
          {/* Mobile Logo */}
          {isMobile && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 gradient-bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">F</span>
              </div>
              <h2 className="font-bold text-lg gradient-text">FinanceAI</h2>
            </div>
          )}
          
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'pf' | 'pj')}
            className={isMobile ? "block" : "hidden sm:block"}
          >
            <TabsList className={cn(
              "glass-effect p-1",
              isMobile ? "h-10" : "h-12"
            )}>
              <TabsTrigger 
                value="pf" 
                className={cn(
                  "flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-primary transition-all duration-200",
                  isMobile ? "px-3 py-1.5 text-sm" : "px-4 py-2"
                )}
              >
                <User className="h-4 w-4" />
                {!isMobile ? "Pessoa Física" : "PF"}
              </TabsTrigger>
              <TabsTrigger 
                value="pj" 
                className={cn(
                  "flex items-center gap-2 data-[state=active]:bg-white/20 data-[state=active]:text-primary transition-all duration-200",
                  isMobile ? "px-3 py-1.5 text-sm" : "px-4 py-2"
                )}
              >
                <Settings className="h-4 w-4" />
                {!isMobile ? "Pessoa Jurídica" : "PJ"}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className={cn(
                "relative rounded-full hover-lift glass-effect",
                isMobile ? "h-9 w-9" : "h-10 w-10"
              )}>
                <Avatar className={isMobile ? "h-9 w-9" : "h-10 w-10"}>
                  <AvatarFallback className="gradient-bg-primary text-white font-semibold">
                    {user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 glass-effect border-white/20" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-white/20" />
              <DropdownMenuItem 
                onClick={logout}
                className="hover:bg-white/10 transition-colors duration-200 cursor-pointer"
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
