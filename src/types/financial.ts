
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
  received?: boolean;
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
  bankName?: string;
  bankIcon?: string;
  showInDashboard?: boolean;
  initialBalance?: number;
  isBankAccount?: boolean;
}

export interface Bank {
  id: string;
  name: string;
  iconUrl?: string;
  color: string;
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

export interface ShoppingItem {
  id: string;
  userId: string;
  title: string;
  description?: string;
  price: number;
  priority: 1 | 2 | 3 | 4 | 5;
  purchaseLink?: string;
  targetDate?: string;
  isPurchased: boolean;
  purchasedAt?: string;
  createdAt: string;
  updatedAt: string;
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
