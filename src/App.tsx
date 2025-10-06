import { useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { Layout } from "@/components/Layout/Layout";
import { PWAInstallPrompt } from "@/components/PWAInstallPrompt";
import { SplashScreen } from "@/components/SplashScreen";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Calendar from "./pages/Calendar";
import Reports from "./pages/Reports";
import AIFinance from "./pages/AIFinance";
import Goals from "./pages/Goals";
import Settings from "./pages/Settings";
import Categories from "./pages/Categories";
import Budgets from "./pages/Budgets";
import Accounts from "./pages/Accounts";
import ShoppingList from "./pages/ShoppingList";
import InstallApp from "./pages/InstallApp";
import NotFound from "./pages/NotFound";

// Register service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js')
      .then((registration) => {
        console.log('SW registered: ', registration);
      })
      .catch((registrationError) => {
        console.log('SW registration failed: ', registrationError);
      });
  });
}

const queryClient = new QueryClient();

function AppRoutes() {
  const [showSplash, setShowSplash] = useState(true);
  
  let authState;
  try {
    authState = useAuth();
  } catch (error) {
    console.error('Auth context error:', error);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center p-4">
          <h1>Erro ao carregar a aplicação</h1>
          <p>Verifique a conexão e tente novamente.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Recarregar
          </button>
        </div>
      </div>
    );
  }
  
  const { user, isLoading } = authState;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    // Para rotas públicas como /install, não mostra splash screen
    if (window.location.pathname === '/install') {
      return <PublicRoutes />;
    }
    
    return (
      <>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        {!showSplash && <PublicRoutes />}
      </>
    );
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/dashboard" element={<Navigate to="/" replace />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/categories" element={<Categories />} />
        <Route path="/budgets" element={<Budgets />} />
        <Route path="/shopping-list" element={<ShoppingList />} />
        <Route path="/accounts" element={<Accounts />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/ai" element={<AIFinance />} />
        <Route path="/goals" element={<Goals />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Layout>
  );
}

// Componente separado para rotas públicas
function PublicRoutes() {
  return (
    <Routes>
      <Route path="/install" element={<InstallApp />} />
      <Route path="*" element={<Login />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="dark" storageKey="dindin-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
            <PWAInstallPrompt />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;