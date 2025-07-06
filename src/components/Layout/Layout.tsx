
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

export function Layout() {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!user) {
    return <Outlet />;
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full relative overflow-hidden">
        {/* Background gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900"></div>
        
        {/* Desktop Sidebar */}
        {!isMobile && <Sidebar />}
        
        <div className="flex-1 flex flex-col relative z-10">
          <Header />
          <main className={cn(
            "flex-1 overflow-auto",
            isMobile ? "p-4 pb-20" : "p-6"
          )}>
            <div className={cn(
              "mx-auto",
              isMobile ? "max-w-full" : "max-w-7xl"
            )}>
              <Outlet />
            </div>
          </main>
        </div>

        {/* Mobile Navigation */}
        {isMobile && <MobileNav />}
      </div>
    </SidebarProvider>
  );
}
