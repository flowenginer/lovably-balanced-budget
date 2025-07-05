
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './Sidebar';
import { Header } from './Header';
import { useAuth } from '@/contexts/AuthContext';
import { FinancialProvider } from '@/contexts/FinancialContext';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <FinancialProvider>
      <SidebarProvider>
        <div className="min-h-screen flex w-full relative overflow-hidden">
          {/* Background gradient */}
          <div className="fixed inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-slate-900 dark:via-purple-900/20 dark:to-slate-900"></div>
          
          <AppSidebar />
          
          <div className="flex-1 flex flex-col relative z-10">
            <Header />
            <main className="flex-1 p-6 overflow-auto">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </SidebarProvider>
    </FinancialProvider>
  );
}
