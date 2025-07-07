import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Transaction, Category, Account, FinancialGoal } from '@/types/financial';

interface FinancialContextType {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  goals: FinancialGoal[];
  activeTab: 'pf' | 'pj';
  userProfile: { name: string; email: string } | null;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  setActiveTab: (tab: 'pf' | 'pj') => void;
  getBalance: (entityType?: 'pf' | 'pj') => number;
  getMonthlyData: (entityType?: 'pf' | 'pj') => { income: number; expenses: number };
  isLoading: boolean;
  refreshData: () => Promise<void>;
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [userProfile, setUserProfile] = useState<{ name: string; email: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'pf' | 'pj'>('pf');
  const [isLoading, setIsLoading] = useState(false);

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      refreshData();
    } else {
      // Clear data when user logs out
      setTransactions([]);
      setCategories([]);
      setAccounts([]);
      setGoals([]);
      setUserProfile(null);
    }
  }, [user]);

  const refreshData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load user profile
      const { data: profileData } = await supabase
        .from('profiles')
        .select('name, email')
        .eq('id', user.id)
        .single();
      
      if (profileData) {
        setUserProfile({ name: profileData.name, email: profileData.email });
      }

      // Load categories - remove duplicates by using a Map with unique key
      const { data: categoriesData } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (categoriesData) {
        const uniqueCategories = new Map();
        categoriesData.forEach(c => {
          const key = `${c.name}-${c.type}-${c.entity_type}`;
          if (!uniqueCategories.has(key)) {
            uniqueCategories.set(key, {
              id: c.id,
              name: c.name,
              type: c.type as 'income' | 'expense',
              entityType: c.entity_type as 'pf' | 'pj',
              color: c.color
            });
          }
        });
        setCategories(Array.from(uniqueCategories.values()));
      }

      // Load accounts
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('*')
        .order('name');
      
      if (accountsData) {
        const formattedAccounts = accountsData.map(a => ({
          id: a.id,
          name: a.name,
          type: a.type as 'checking' | 'savings' | 'cash' | 'investment' | 'credit',
          balance: Number(a.balance || 0),
          entityType: a.entity_type as 'pf' | 'pj'
        }));
        setAccounts(formattedAccounts);
      }

      // Load transactions
      const { data: transactionsData } = await supabase
        .from('transactions')
        .select(`
          *,
          categories(name, color),
          accounts(name)
        `)
        .order('date', { ascending: false });
      
      if (transactionsData) {
        const formattedTransactions = transactionsData.map(t => ({
          id: t.id,
          type: t.type as 'income' | 'expense',
          category: t.categories?.name || '',
          description: t.description,
          amount: Number(t.amount),
          date: t.date,
          paymentMethod: t.payment_method,
          isRecurring: t.is_recurring || false,
          observations: t.observations || '',
          account: t.accounts?.name || '',
          entityType: t.entity_type as 'pf' | 'pj',
          attachment: t.attachment_url || '',
          pixData: t.pix_key ? {
            key: t.pix_key,
            keyType: t.pix_key_type as any
          } : undefined,
          bankData: t.bank_name ? {
            bank: t.bank_name,
            agency: t.bank_agency || '',
            account: t.bank_account || '',
            cpfCnpj: t.bank_cpf_cnpj || ''
          } : undefined
        }));
        setTransactions(formattedTransactions);
      }

      // Load goals
      const { data: goalsData } = await supabase
        .from('financial_goals')
        .select('*')
        .order('deadline');
      
      if (goalsData) {
        const formattedGoals = goalsData.map(g => ({
          id: g.id,
          title: g.title,
          targetAmount: Number(g.target_amount),
          currentAmount: Number(g.current_amount),
          deadline: g.deadline,
          entityType: g.entity_type as 'pf' | 'pj'
        }));
        setGoals(formattedGoals);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: category.name,
          type: category.type,
          entity_type: category.entityType,
          color: category.color
        });

      if (error) throw error;
      
      await refreshData();
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  };

  const deleteCategory = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await refreshData();
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  };

  const addAccount = async (account: Omit<Account, 'id'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name: account.name,
          type: account.type,
          balance: account.balance,
          entity_type: account.entityType
        });

      if (error) throw error;
      
      await refreshData();
    } catch (error) {
      console.error('Error adding account:', error);
      throw error;
    }
  };

  const deleteAccount = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await refreshData();
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;

    try {
      // Find category and account IDs
      const category = categories.find(c => c.name === transaction.category);
      const account = accounts.find(a => a.name === transaction.account);

      if (!category || !account) {
        throw new Error('Categoria ou conta não encontrada');
      }

      const { error } = await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          type: transaction.type,
          category_id: category.id,
          account_id: account.id,
          description: transaction.description,
          amount: transaction.amount,
          date: transaction.date,
          payment_method: transaction.paymentMethod,
          is_recurring: transaction.isRecurring,
          observations: transaction.observations,
          entity_type: transaction.entityType,
          attachment_url: transaction.attachment,
          pix_key: transaction.pixData?.key,
          pix_key_type: transaction.pixData?.keyType,
          bank_name: transaction.bankData?.bank,
          bank_agency: transaction.bankData?.agency,
          bank_account: transaction.bankData?.account,
          bank_cpf_cnpj: transaction.bankData?.cpfCnpj
        });

      if (error) throw error;

      // If it's a recurring transaction, create next month's transaction
      if (transaction.isRecurring) {
        const nextMonth = new Date(transaction.date);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        
        const { error: recurringError } = await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: transaction.type,
            category_id: category.id,
            account_id: account.id,
            description: `${transaction.description} (Recorrente)`,
            amount: transaction.amount,
            date: nextMonth.toISOString().split('T')[0],
            payment_method: transaction.paymentMethod,
            is_recurring: true,
            observations: transaction.observations,
            entity_type: transaction.entityType,
            attachment_url: transaction.attachment,
            pix_key: transaction.pixData?.key,
            pix_key_type: transaction.pixData?.keyType,
            bank_name: transaction.bankData?.bank,
            bank_agency: transaction.bankData?.agency,
            bank_account: transaction.bankData?.account,
            bank_cpf_cnpj: transaction.bankData?.cpfCnpj
          });

        if (recurringError) {
          console.error('Error creating recurring transaction:', recurringError);
        }
      }
      
      // Refresh data to get the new transaction
      await refreshData();
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  };

  const updateTransaction = async (id: string, updatedTransaction: Partial<Transaction>) => {
    if (!user) return;

    try {
      const updates: any = {};
      
      if (updatedTransaction.description !== undefined) updates.description = updatedTransaction.description;
      if (updatedTransaction.amount !== undefined) updates.amount = updatedTransaction.amount;
      if (updatedTransaction.date !== undefined) updates.date = updatedTransaction.date;
      if (updatedTransaction.paymentMethod !== undefined) updates.payment_method = updatedTransaction.paymentMethod;
      if (updatedTransaction.isRecurring !== undefined) updates.is_recurring = updatedTransaction.isRecurring;
      if (updatedTransaction.observations !== undefined) updates.observations = updatedTransaction.observations;

      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      
      await refreshData();
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await refreshData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const getBalance = (entityType?: 'pf' | 'pj') => {
    return transactions
      .filter(t => !entityType || t.entityType === entityType)
      .reduce((acc, t) => {
        return t.type === 'income' ? acc + t.amount : acc - t.amount;
      }, 0);
  };

  const getMonthlyData = (entityType?: 'pf' | 'pj') => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const isCurrentMonth = transactionDate.getMonth() === currentMonth && 
                            transactionDate.getFullYear() === currentYear;
      const isCorrectEntity = !entityType || t.entityType === entityType;
      return isCurrentMonth && isCorrectEntity;
    });

    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    return { income, expenses };
  };

  return (
    <FinancialContext.Provider value={{
      transactions,
      categories,
      accounts,
      goals,
      activeTab,
      userProfile,
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      deleteCategory,
      addAccount,
      deleteAccount,
      setActiveTab,
      getBalance,
      getMonthlyData,
      isLoading,
      refreshData,
    }}>
      {children}
    </FinancialContext.Provider>
  );
};
