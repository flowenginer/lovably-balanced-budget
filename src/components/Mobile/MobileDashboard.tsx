import { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  EyeOff, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  PlusCircle,
  CreditCard,
  PiggyBank,
  Wallet,
  Building2
} from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MobileDashboardProps {
  onAddTransaction: (type?: 'income' | 'expense') => void;
}

export function MobileDashboard({ onAddTransaction }: MobileDashboardProps) {
  const { user } = useAuth();
  const { userProfile } = useFinancial();
  const { 
    accounts, 
    categories, 
    transactions, 
    activeTab
  } = useFinancial();
  
  // Calculate totals
  const filteredTransactions = transactions.filter(t => t.entityType === activeTab);
  const filteredAccounts = accounts.filter(a => a.entityType === activeTab);
  
  const totalBalance = filteredAccounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const [showBalance, setShowBalance] = useState(true);

  const currentMonth = format(new Date(), 'MMMM', { locale: ptBR });
  const capitalizedMonth = currentMonth.charAt(0).toUpperCase() + currentMonth.slice(1);

  const recentTransactions = filteredTransactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  const filteredAccountsForDisplay = filteredAccounts;

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return <CreditCard className="h-5 w-5" />;
      case 'savings': return <PiggyBank className="h-5 w-5" />;
      case 'cash': return <Wallet className="h-5 w-5" />;
      case 'investment': return <Building2 className="h-5 w-5" />;
      default: return <Wallet className="h-5 w-5" />;
    }
  };

  const getCategoryIcon = (name: string) => {
    const icons: Record<string, string> = {
      'Salário': '💰',
      'Freelance': '💻',
      'Investimentos': '📈',
      'Alimentação': '🍕',
      'Transporte': '🚗',
      'Moradia': '🏠',
      'Lazer': '🎮',
      'Saúde': '⚕️',
      'Vendas': '💼',
      'Serviços': '⚙️',
      'Consultoria': '🤝',
      'Folha de Pagamento': '👥',
      'Fornecedores': '📦',
      'Impostos': '📋',
      'Aluguel Comercial': '🏢',
      'Marketing': '📢'
    };
    return icons[name] || '💳';
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header with balance */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary/20 to-primary/10 flex items-center justify-center">
              <span className="text-lg font-bold text-primary">
                {userProfile?.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Olá,</p>
              <p className="font-semibold text-foreground">
                {userProfile?.name?.split(' ')[0] || 'Usuário'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowBalance(!showBalance)}
            className="text-muted-foreground"
          >
            {showBalance ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
          </Button>
        </div>

        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">Saldo atual em contas</p>
          <p className="text-3xl font-bold text-foreground">
            {showBalance ? formatCurrency(totalBalance) : '••••••'}
          </p>
          
          <div className="flex justify-center gap-6 mt-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Receitas</p>
                <p className="text-sm font-semibold text-green-500">
                  {showBalance ? formatCurrency(totalIncome) : '••••'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-red-500" />
              <div className="text-left">
                <p className="text-xs text-muted-foreground">Despesas</p>
                <p className="text-sm font-semibold text-red-500">
                  {showBalance ? formatCurrency(totalExpenses) : '••••'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4 bg-card/50 hover:bg-card border-border/50"
            onClick={() => onAddTransaction('income')}
          >
            <TrendingUp className="h-5 w-5 text-green-500" />
            <span className="text-xs">Receita</span>
          </Button>
          
          <Button
            variant="outline"
            className="flex flex-col items-center gap-2 h-auto py-4 bg-card/50 hover:bg-card border-border/50"
            onClick={() => onAddTransaction('expense')}
          >
            <TrendingDown className="h-5 w-5 text-red-500" />
            <span className="text-xs">Despesa</span>
          </Button>
        </div>
      </div>

      {/* Accounts */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Contas</h3>
          <Button variant="ghost" size="sm" className="text-primary">
            Ver todas
          </Button>
        </div>
        
        <div className="space-y-3">
          {filteredAccountsForDisplay.slice(0, 3).map((account) => (
            <Card key={account.id} className="bg-card/50 border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {getAccountIcon(account.type)}
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{account.name}</p>
                      <p className="text-sm text-muted-foreground capitalize">{account.type}</p>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">
                    {showBalance ? formatCurrency(account.balance || 0) : '••••'}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="px-4 flex-1">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Transações Recentes</h3>
          <Button variant="ghost" size="sm" className="text-primary">
            Ver todas
          </Button>
        </div>
        
        {recentTransactions.length === 0 ? (
          <Card className="bg-card/50 border-border/50">
            <CardContent className="p-6 text-center">
              <p className="text-muted-foreground">Nenhuma transação encontrada</p>
              <Button 
                onClick={() => onAddTransaction()}
                className="mt-3"
                size="sm"
              >
                Adicionar primeira transação
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {recentTransactions.map((transaction) => {
              const category = categories.find(c => c.name === transaction.category);
              const account = filteredAccountsForDisplay.find(a => a.id === transaction.account);
              
              return (
                <Card key={transaction.id} className="bg-card/50 border-border/50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
                          {getCategoryIcon(category?.name || '')}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{transaction.description}</p>
                          <div className="flex items-center gap-2">
                            <p className="text-sm text-muted-foreground">{category?.name}</p>
                            <span className="text-muted-foreground">•</span>
                            <p className="text-sm text-muted-foreground">{account?.name}</p>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          transaction.type === 'income' ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(transaction.date), 'dd/MM', { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}