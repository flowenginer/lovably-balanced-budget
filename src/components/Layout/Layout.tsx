
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from '@/components/Mobile/MobileBottomNav';
import { MobileTransactionForm } from '@/components/Mobile/MobileTransactionForm';
import { useAuth } from '@/contexts/AuthContext';
import { FinancialProvider, useFinancial } from '@/contexts/FinancialContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: LayoutProps) {
  const { user } = useAuth();
  const { categories, accounts, activeTab, addTransaction } = useFinancial();
  const isMobile = useIsMobile();
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [initialTransactionType, setInitialTransactionType] = useState<'income' | 'expense'>('expense');

  if (!user) {
    return <>{children}</>;
  }

  const handleAddTransaction = (type?: 'income' | 'expense') => {
    if (type) setInitialTransactionType(type);
    setShowMobileForm(true);
  };

  return (
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
        {isMobile && <MobileBottomNav onAddTransaction={handleAddTransaction} />}
        
        {/* Mobile Transaction Form */}
        {isMobile && showMobileForm && (
          <MobileTransactionForm
            isOpen={showMobileForm}
            onClose={() => setShowMobileForm(false)}
            onSubmit={addTransaction}
            categories={categories}
            accounts={accounts}
            activeTab={activeTab}
            initialType={initialTransactionType}
          />
        )}
      </div>
    </SidebarProvider>
  );
}

export function Layout({ children }: LayoutProps) {
  return (
    <FinancialProvider>
      <LayoutContent>{children}</LayoutContent>
    </FinancialProvider>
  );
}
