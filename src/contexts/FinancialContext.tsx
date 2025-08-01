import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Transaction, Category, Account, FinancialGoal } from '@/types/financial';

interface FinancialContextType {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  goals: FinancialGoal[];
  userProfile: { name: string; email: string } | null;
  addTransaction: (transaction: Omit<Transaction, 'id'>) => Promise<void>;
  markTransactionAsReceived: (id: string) => Promise<void>;
  markTransactionAsPaid: (id: string) => Promise<void>;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  deleteAllRecurringTransactions: (transactionId: string) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addAccount: (account: Omit<Account, 'id'>) => Promise<void>;
  deleteAccount: (id: string) => Promise<void>;
  getBalance: () => number;
  getMonthlyData: () => { income: number; expenses: number };
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
  const [isLoading, setIsLoading] = useState(false);

  // Load data when user is authenticated
  useEffect(() => {
    if (user) {
      // Clear localStorage cache when user changes
      localStorage.removeItem('lastRecurringGeneration');
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
      // Generate recurring transactions only on explicit user action, not during navigation
      // This prevents duplicate generation when switching between pages

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
        const mappedCategories = categoriesData.map(c => ({
          id: c.id,
          name: c.name,
          type: c.type as 'income' | 'expense',
          color: c.color
        }));
        setCategories(mappedCategories);
      }

      // Load accounts - remove duplicates by using a Map with unique key
      const { data: accountsData } = await supabase
        .from('accounts')
        .select('*')
        .order('name');
      
      if (accountsData) {
        const mappedAccounts = accountsData.map(a => ({
          id: a.id,
          name: a.name,
          type: a.type as 'checking' | 'savings' | 'cash' | 'investment' | 'credit',
          balance: Number(a.initial_balance || 0), // Usar initial_balance, será recalculado depois
          bankName: a.bank_name || undefined,
          bankIcon: a.bank_icon || undefined,
          showInDashboard: a.show_in_dashboard ?? true,
          initialBalance: Number(a.initial_balance || 0),
          isBankAccount: a.is_bank_account ?? false
        }));
        setAccounts(mappedAccounts);
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
          attachment: t.attachment_url || '',
          received: t.received || false,
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
        
        // Recalcular saldos das contas com base nas transações após carregar as contas
        setTimeout(() => {
          setAccounts(prevAccounts => {
            return prevAccounts.map(account => {
              // Para a conta "Empresa Ativa", somar apenas receitas marcadas como recebidas
              if (account.name === 'Empresa Ativa') {
                const receivedIncomeTransactions = formattedTransactions.filter(t => 
                  t.account === account.name && t.type === 'income' && t.received
                );
                const receivedIncomeTotal = receivedIncomeTransactions.reduce((sum, t) => sum + t.amount, 0);
                
                return { ...account, balance: account.initialBalance + receivedIncomeTotal };
              }
              
              // Para outras contas, manter o cálculo normal
              const accountTransactions = formattedTransactions.filter(t => t.account === account.name);
              const calculatedBalance = accountTransactions.reduce((sum, t) => {
                return t.type === 'income' ? sum + t.amount : sum - t.amount;
              }, account.initialBalance);
              
              return { ...account, balance: calculatedBalance };
            });
          });
        }, 100);
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
          deadline: g.deadline
        }));
        setGoals(formattedGoals);
      }

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /* FUNÇÃO TEMPORARIAMENTE DESABILITADA PARA EVITAR DUPLICAÇÕES
  const generateRecurringTransactions = async () => {
    if (!user) return;

    try {
      const today = new Date();
      const firstDayOfCurrentMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const firstDayOfNextMonth = new Date(today.getFullYear(), today.getMonth() + 1, 1);

      // Get all recurring transactions (without date filter to get all recurring ones)
      const { data: allRecurringTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_recurring', true)
        .order('date', { ascending: false });

      if (!allRecurringTransactions || allRecurringTransactions.length === 0) {
        return;
      }

      // Group by unique transaction pattern (description, amount, category, account)
      const uniqueRecurringTransactions = new Map();
      allRecurringTransactions.forEach(transaction => {
        const key = `${transaction.description}-${transaction.amount}-${transaction.category_id}-${transaction.account_id}`;
        if (!uniqueRecurringTransactions.has(key)) {
          uniqueRecurringTransactions.set(key, transaction);
        }
      });

      const newTransactions = [];

      for (const [, transaction] of uniqueRecurringTransactions) {
        // Check if this recurring transaction already has a version for this month
        const { data: existingTransaction } = await supabase
          .from('transactions')
          .select('id')
          .eq('user_id', user.id)
          .eq('category_id', transaction.category_id)
          .eq('account_id', transaction.account_id)
          .eq('description', transaction.description)
          .eq('amount', transaction.amount)
          .eq('is_recurring', true)
          .gte('date', firstDayOfCurrentMonth.toISOString().split('T')[0])
          .lt('date', firstDayOfNextMonth.toISOString().split('T')[0])
          .maybeSingle();

        // If no transaction exists for this month, create one
        if (!existingTransaction) {
          const originalDate = new Date(transaction.date);
          const newDate = new Date(today.getFullYear(), today.getMonth(), originalDate.getDate());
          
          // If the day doesn't exist in current month (e.g., Feb 30), use last day of month
          if (newDate.getMonth() !== today.getMonth()) {
            newDate.setDate(0); // Sets to last day of previous month
          }

          newTransactions.push({
            user_id: transaction.user_id,
            type: transaction.type,
            category_id: transaction.category_id,
            account_id: transaction.account_id,
            description: transaction.description,
            amount: transaction.amount,
            date: newDate.toISOString().split('T')[0],
            payment_method: transaction.payment_method,
            is_recurring: true,
            observations: transaction.observations,
            
            attachment_url: transaction.attachment_url,
            pix_key: transaction.pix_key,
            pix_key_type: transaction.pix_key_type,
            bank_name: transaction.bank_name,
            bank_agency: transaction.bank_agency,
            bank_account: transaction.bank_account,
            bank_cpf_cnpj: transaction.bank_cpf_cnpj
          });
        }
      }

      if (newTransactions.length > 0) {
        const { error: insertError } = await supabase
          .from('transactions')
          .insert(newTransactions);

        if (insertError) {
          console.error('Error creating recurring transactions:', insertError);
        } else {
          console.log(`Generated ${newTransactions.length} recurring transactions for current month`);
        }
      }
    } catch (error) {
      console.error('Error generating recurring transactions:', error);
    }
  };
  */

  const addCategory = async (category: Omit<Category, 'id'>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name: category.name,
          type: category.type,
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
          initial_balance: account.initialBalance || account.balance,
          bank_name: account.bankName,
          bank_icon: account.bankIcon,
          is_bank_account: account.isBankAccount || false,
          show_in_dashboard: account.showInDashboard ?? true
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
      // Check if category exists, if not create it
      let category = categories.find(c => c.name === transaction.category && c.type === transaction.type);
      
      if (!category) {
        // Create new category
        const { data: newCategory, error: categoryError } = await supabase
          .from('categories')
          .insert({
            user_id: user.id,
            name: transaction.category,
            type: transaction.type,
            color: transaction.type === 'income' ? '#10B981' : '#EF4444'
          })
          .select()
          .single();
          
        if (categoryError) throw categoryError;
        
        category = {
          id: newCategory.id,
          name: newCategory.name,
          type: newCategory.type as 'income' | 'expense',
          color: newCategory.color
        };
        
        // Update categories state
        setCategories(prev => [...prev, category!]);
      }
      
      const account = accounts.find(a => a.name === transaction.account);

      if (!account) {
        throw new Error('Conta não encontrada');
      }

      const transactionData = {
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
        attachment_url: transaction.attachment,
        pix_key: transaction.pixData?.key,
        pix_key_type: transaction.pixData?.keyType,
        bank_name: transaction.bankData?.bank,
        bank_agency: transaction.bankData?.agency,
        bank_account: transaction.bankData?.account,
        bank_cpf_cnpj: transaction.bankData?.cpfCnpj
      };

      // If it's a recurring transaction, create it for the next 12 months
      if (transaction.isRecurring) {
        const transactionsToInsert = [];
        const originalDate = new Date(transaction.date);
        
        // Create for current month + next 11 months (total 12 months)
        for (let i = 0; i < 12; i++) {
          const newDate = new Date(originalDate.getFullYear(), originalDate.getMonth() + i, originalDate.getDate());
          
          // If the day doesn't exist in the target month, use the last day of that month
          if (newDate.getMonth() !== (originalDate.getMonth() + i) % 12) {
            newDate.setDate(0); // Sets to last day of previous month
          }
          
          transactionsToInsert.push({
            ...transactionData,
            date: newDate.toISOString().split('T')[0]
          });
        }

        const { error } = await supabase
          .from('transactions')
          .insert(transactionsToInsert);

        if (error) throw error;
      } else {
        // Single transaction
        const { error } = await supabase
          .from('transactions')
          .insert(transactionData);

        if (error) throw error;
      }
      
      // Refresh data to get the new transaction(s)
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
      // Simply delete the specific transaction
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;
      
      await refreshData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  };

  const deleteAllRecurringTransactions = async (transactionId: string) => {
    if (!user) return;

    try {
      // First, get the transaction details to identify similar recurring transactions
      const { data: transaction, error: fetchError } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('user_id', user.id)
        .single();

      if (fetchError) throw fetchError;

      if (!transaction.is_recurring) {
        throw new Error('Esta transação não é recorrente');
      }

      // Delete all recurring transactions with the same description, amount, category, and account
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('user_id', user.id)
        .eq('category_id', transaction.category_id)
        .eq('account_id', transaction.account_id)
        .eq('description', transaction.description)
        .eq('amount', transaction.amount)
        .eq('is_recurring', true);

      if (error) throw error;
      
      await refreshData();
    } catch (error) {
      console.error('Error deleting all recurring transactions:', error);
      throw error;
    }
  };

  const markTransactionAsReceived = async (id: string) => {
    if (!user) return;

    try {
      // Buscar a transação para saber se é receita e da conta "Empresa Ativa"
      const transaction = transactions.find(t => t.id === id);
      if (!transaction || transaction.type !== 'income') {
        throw new Error('Apenas receitas podem ser marcadas como recebidas');
      }

      // Marcar a transação como recebida
      const { error } = await supabase
        .from('transactions')
        .update({ received: true })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      // Se a transação foi recebida e é da conta "Empresa Ativa", o saldo será recalculado no refreshData()
      await refreshData();
    } catch (error) {
      console.error('Error marking transaction as received:', error);
      throw error;
    }
  };

  const markTransactionAsPaid = async (id: string) => {
    if (!user) return;

    try {
      // Buscar a transação para saber se é despesa
      const transaction = transactions.find(t => t.id === id);
      if (!transaction || transaction.type !== 'expense') {
        throw new Error('Apenas despesas podem ser marcadas como pagas');
      }

      // Marcar a transação como paga
      const { error } = await supabase
        .from('transactions')
        .update({ received: true }) // Usando o mesmo campo 'received' para indicar se foi pago/recebido
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      await refreshData();
    } catch (error) {
      console.error('Error marking transaction as paid:', error);
      throw error;
    }
  };

  const getBalance = () => {
    return transactions.reduce((acc, t) => {
      return t.type === 'income' ? acc + t.amount : acc - t.amount;
    }, 0);
  };

  const getMonthlyData = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      return transactionDate.getMonth() === currentMonth && 
             transactionDate.getFullYear() === currentYear;
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
      userProfile,
      addTransaction,
      markTransactionAsReceived,
      markTransactionAsPaid,
      updateTransaction,
      deleteTransaction,
      deleteAllRecurringTransactions,
      addCategory,
      deleteCategory,
      addAccount,
      deleteAccount,
      getBalance,
      getMonthlyData,
      isLoading,
      refreshData,
    }}>
      {children}
    </FinancialContext.Provider>
  );
};
