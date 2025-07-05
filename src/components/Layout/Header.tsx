
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';
import { useFinancial } from '@/contexts/FinancialContext';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

  return (
    <header className="h-20 border-b border-white/10 backdrop-blur-md bg-white/5 sticky top-0 z-50">
      <div className="flex items-center justify-between px-6 h-full">
        <div className="flex items-center gap-6">
          <SidebarTrigger className="hover-lift hover:bg-white/20" />
          
          <Tabs 
            value={activeTab} 
            onValueChange={(value) => setActiveTab(value as 'pf' | 'pj')}
            className="hidden sm:block"
          >
            <TabsList className="glass-effect p-1 h-12">
              <TabsTrigger 
                value="pf" 
                className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white/20 data-[state=active]:text-primary transition-all duration-200"
              >
                <User className="h-4 w-4" />
                Pessoa Física
              </TabsTrigger>
              <TabsTrigger 
                value="pj" 
                className="flex items-center gap-2 px-4 py-2 data-[state=active]:bg-white/20 data-[state=active]:text-primary transition-all duration-200"
              >
                <Settings className="h-4 w-4" />
                Pessoa Jurídica
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="flex items-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full hover-lift glass-effect">
                <Avatar className="h-10 w-10">
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
