
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Transaction, Category, Account, FinancialGoal } from '@/types/financial';

interface FinancialContextType {
  transactions: Transaction[];
  categories: Category[];
  accounts: Account[];
  goals: FinancialGoal[];
  activeTab: 'pf' | 'pj';
  addTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  updateTransaction: (id: string, transaction: Partial<Transaction>) => void;
  deleteTransaction: (id: string) => void;
  addCategory: (category: Omit<Category, 'id'>) => void;
  addAccount: (account: Omit<Account, 'id'>) => void;
  setActiveTab: (tab: 'pf' | 'pj') => void;
  getBalance: (entityType?: 'pf' | 'pj') => number;
  getMonthlyData: (entityType?: 'pf' | 'pj') => { income: number; expenses: number };
}

const FinancialContext = createContext<FinancialContextType | undefined>(undefined);

export const useFinancial = () => {
  const context = useContext(FinancialContext);
  if (!context) {
    throw new Error('useFinancial must be used within a FinancialProvider');
  }
  return context;
};

const defaultCategories: Category[] = [
  // PF Categories
  { id: '1', name: 'Salário', type: 'income', entityType: 'pf', color: '#10B981' },
  { id: '2', name: 'Freelance', type: 'income', entityType: 'pf', color: '#059669' },
  { id: '3', name: 'Alimentação', type: 'expense', entityType: 'pf', color: '#EF4444' },
  { id: '4', name: 'Transporte', type: 'expense', entityType: 'pf', color: '#F97316' },
  { id: '5', name: 'Moradia', type: 'expense', entityType: 'pf', color: '#8B5CF6' },
  { id: '6', name: 'Lazer', type: 'expense', entityType: 'pf', color: '#EC4899' },
  
  // PJ Categories
  { id: '7', name: 'Vendas', type: 'income', entityType: 'pj', color: '#10B981' },
  { id: '8', name: 'Serviços', type: 'income', entityType: 'pj', color: '#059669' },
  { id: '9', name: 'Folha de Pagamento', type: 'expense', entityType: 'pj', color: '#EF4444' },
  { id: '10', name: 'Fornecedores', type: 'expense', entityType: 'pj', color: '#F97316' },
  { id: '11', name: 'Impostos', type: 'expense', entityType: 'pj', color: '#8B5CF6' },
  { id: '12', name: 'Aluguel Comercial', type: 'expense', entityType: 'pj', color: '#EC4899' },
];

const defaultAccounts: Account[] = [
  { id: '1', name: 'Conta Corrente PF', type: 'checking', balance: 5000, entityType: 'pf' },
  { id: '2', name: 'Poupança PF', type: 'savings', balance: 12000, entityType: 'pf' },
  { id: '3', name: 'Dinheiro', type: 'cash', balance: 500, entityType: 'pf' },
  { id: '4', name: 'Conta Empresarial', type: 'checking', balance: 25000, entityType: 'pj' },
  { id: '5', name: 'Conta Investimentos PJ', type: 'investment', balance: 50000, entityType: 'pj' },
];

export const FinancialProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>(defaultCategories);
  const [accounts, setAccounts] = useState<Account[]>(defaultAccounts);
  const [goals, setGoals] = useState<FinancialGoal[]>([]);
  const [activeTab, setActiveTab] = useState<'pf' | 'pj'>('pf');

  useEffect(() => {
    // Load data from localStorage
    const savedTransactions = localStorage.getItem('financial-transactions');
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions));
    }
  }, []);

  useEffect(() => {
    // Save transactions to localStorage
    localStorage.setItem('financial-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [...prev, newTransaction]);
  };

  const updateTransaction = (id: string, updatedTransaction: Partial<Transaction>) => {
    setTransactions(prev => 
      prev.map(t => t.id === id ? { ...t, ...updatedTransaction } : t)
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addCategory = (category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };
    setCategories(prev => [...prev, newCategory]);
  };

  const addAccount = (account: Omit<Account, 'id'>) => {
    const newAccount: Account = {
      ...account,
      id: Date.now().toString(),
    };
    setAccounts(prev => [...prev, newAccount]);
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
      addTransaction,
      updateTransaction,
      deleteTransaction,
      addCategory,
      addAccount,
      setActiveTab,
      getBalance,
      getMonthlyData,
    }}>
      {children}
    </FinancialContext.Provider>
  );
};
