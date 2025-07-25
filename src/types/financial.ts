
export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: string;
  isRecurring: boolean;
  observations?: string;
  account: string;
  attachment?: string;
  pixData?: PixData;
  bankData?: BankData;
}

export interface PixData {
  key: string;
  keyType: 'cpf' | 'cnpj' | 'email' | 'phone' | 'random';
}

export interface BankData {
  bank: string;
  agency: string;
  account: string;
  cpfCnpj: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'income' | 'expense';
  color: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'investment' | 'credit';
  balance: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  theme: 'light' | 'dark';
  createdAt: string;
}

export interface FinancialGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string;
  amount: number;
  month: number;
  year: number;
  createdAt: string;
  updatedAt: string;
}
