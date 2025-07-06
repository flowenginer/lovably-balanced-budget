
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  signup: (email: string, password: string, name?: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event, session?.user?.email);
        setSession(session);
        setUser(session?.user ?? null);
        
        // Create default categories and accounts for new users
        if (event === 'SIGNED_IN' && session?.user) {
          setTimeout(async () => {
            try {
              // Call the functions to create default data
              await supabase.rpc('create_default_categories', { user_id: session.user.id });
              await supabase.rpc('create_default_accounts', { user_id: session.user.id });
            } catch (error) {
              console.log('Default data creation (might already exist):', error);
            }
          }, 0);
        }
        
        setIsLoading(false);
      }
    );

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      return { error: error?.message };
    } catch (error) {
      return { error: 'Erro inesperado no login' };
    }
  };

  const signup = async (email: string, password: string, name?: string) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            name: name || email.split('@')[0],
          }
        }
      });
      
      return { error: error?.message };
    } catch (error) {
      return { error: 'Erro inesperado no cadastro' };
    }
  };

  const logout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro no logout:', error);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      login, 
      signup, 
      logout, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
