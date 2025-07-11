
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { useAuth } from '@/contexts/AuthContext';
import { FinancialProvider } from '@/contexts/FinancialContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();
  const isMobile = useIsMobile();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <FinancialProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full relative overflow-hidden">
          {/* Background gradient */}
          <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900"></div>
          
          {/* Desktop Sidebar */}
          {!isMobile && <AppSidebar />}
          
          <div className="flex-1 flex flex-col relative z-10">
            <Header />
            <main className={cn(
              "flex-1 overflow-auto",
              isMobile ? "px-4 pr-6 py-4 pb-20" : "p-6"
            )}>
              <div className={cn(
                "mx-auto",
                isMobile ? "max-w-full" : "max-w-7xl"
              )}>
                {children}
              </div>
            </main>
          </div>

          {/* Mobile Navigation */}
          {isMobile && <MobileNav />}
        </div>
      </SidebarProvider>
    </FinancialProvider>
  );
}
