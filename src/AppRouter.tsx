import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SplashScreen } from '@/components/SplashScreen';
import { Layout } from '@/components/Layout/Layout';
import { useState } from 'react';

// Lazy load pages for better performance
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import AIFinance from './pages/AIFinance';
import Goals from './pages/Goals';
import Settings from './pages/Settings';
import Categories from './pages/Categories';
import InstallApp from './pages/InstallApp';
import NotFound from './pages/NotFound';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <>
        {showSplash && <SplashScreen onComplete={() => setShowSplash(false)} />}
        {!showSplash && <Login />}
      </>
    );
  }

  return <Layout>{children}</Layout>;
}

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: '/dashboard',
    element: <Navigate to="/" replace />,
  },
  {
    path: '/transactions',
    element: (
      <ProtectedRoute>
        <Transactions />
      </ProtectedRoute>
    ),
  },
  {
    path: '/categories',
    element: (
      <ProtectedRoute>
        <Categories />
      </ProtectedRoute>
    ),
  },
  {
    path: '/reports',
    element: (
      <ProtectedRoute>
        <Reports />
      </ProtectedRoute>
    ),
  },
  {
    path: '/ai',
    element: (
      <ProtectedRoute>
        <AIFinance />
      </ProtectedRoute>
    ),
  },
  {
    path: '/goals',
    element: (
      <ProtectedRoute>
        <Goals />
      </ProtectedRoute>
    ),
  },
  {
    path: '/settings',
    element: (
      <ProtectedRoute>
        <Settings />
      </ProtectedRoute>
    ),
  },
  {
    path: '/install',
    element: <InstallApp />,
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}