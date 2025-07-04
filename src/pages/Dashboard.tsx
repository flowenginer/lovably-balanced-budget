
import { useFinancial } from '@/contexts/FinancialContext';
import { StatsCard } from '@/components/ui/stats-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  CircleDollarSign, 
  TrendingUp, 
  TrendingDown, 
  PieChart,
  Plus,
  Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { activeTab, getBalance, getMonthlyData, transactions, categories } = useFinancial();
  const navigate = useNavigate();

  const balance = getBalance(activeTab);
  const monthlyData = getMonthlyData(activeTab);
  const savings = monthlyData.income - monthlyData.expenses;
  const savingsRate = monthlyData.income > 0 ? (savings / monthlyData.income) * 100 : 0;

  const entityTitle = activeTab === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica';
  
  // Get recent transactions
  const recentTransactions = transactions
    .filter(t => t.entityType === activeTab)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Get expense categories for current month
  const expensesByCategory = transactions
    .filter(t => {
      const isCurrentMonth = new Date(t.date).getMonth() === new Date().getMonth();
      return t.entityType === activeTab && t.type === 'expense' && isCurrentMonth;
    })
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Visão geral - {entityTitle}</p>
        </div>
        <Button onClick={() => navigate('/transactions')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Saldo Total"
          value={formatCurrency(balance)}
          changeType={balance >= 0 ? 'positive' : 'negative'}
          icon={CircleDollarSign}
        />
        <StatsCard
          title="Receitas do Mês"
          value={formatCurrency(monthlyData.income)}
          changeType="positive"
          icon={TrendingUp}
        />
        <StatsCard
          title="Despesas do Mês"
          value={formatCurrency(monthlyData.expenses)}
          changeType="negative"
          icon={TrendingDown}
        />
        <StatsCard
          title="Economia do Mês"
          value={formatCurrency(savings)}
          change={`${savingsRate.toFixed(1)}% das receitas`}
          changeType={savings >= 0 ? 'positive' : 'negative'}
          icon={PieChart}
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent Transactions */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Transações Recentes</CardTitle>
            <Button variant="outline" size="sm" onClick={() => navigate('/transactions')}>
              Ver todas
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => {
                  const category = categories.find(c => c.name === transaction.category);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category?.color || '#6B7280' }}
                        />
                        <div>
                          <p className="font-medium">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma transação encontrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Gastos por Categoria (Este Mês)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(expensesByCategory).length > 0 ? (
                Object.entries(expensesByCategory)
                  .sort(([,a], [,b]) => b - a)
                  .slice(0, 5)
                  .map(([categoryName, amount]) => {
                    const category = categories.find(c => c.name === categoryName);
                    const percentage = (amount / monthlyData.expenses) * 100;
                    return (
                      <div key={categoryName} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full"
                              style={{ backgroundColor: category?.color || '#6B7280' }}
                            />
                            <span className="text-sm font-medium">{categoryName}</span>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma despesa encontrada este mês
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/transactions')}
            >
              <Plus className="h-6 w-6" />
              <span>Nova Transação</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/reports')}
            >
              <PieChart className="h-6 w-6" />
              <span>Ver Relatórios</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex flex-col gap-2"
              onClick={() => navigate('/goals')}
            >
              <TrendingUp className="h-6 w-6" />
              <span>Definir Metas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
