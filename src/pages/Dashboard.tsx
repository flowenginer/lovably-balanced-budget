
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
  Calendar,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

export default function Dashboard() {
  const { activeTab, getBalance, transactions, categories } = useFinancial();
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(new Date());

  const entityTitle = activeTab === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica';
  
  // Get monthly data for selected month/year
  const getMonthlyDataForDate = (date: Date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    
    const monthlyTransactions = transactions.filter(t => {
      const transactionDate = new Date(t.date);
      const isSelectedMonth = transactionDate.getMonth() === month && 
                            transactionDate.getFullYear() === year;
      const isCorrectEntity = t.entityType === activeTab;
      return isSelectedMonth && isCorrectEntity;
    });

    const income = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + t.amount, 0);

    const expenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((acc, t) => acc + t.amount, 0);

    return { income, expenses };
  };

  const balance = getBalance(activeTab);
  const monthlyData = getMonthlyDataForDate(selectedDate);
  const savings = monthlyData.income - monthlyData.expenses;
  const savingsRate = monthlyData.income > 0 ? (savings / monthlyData.income) * 100 : 0;

  // Get recent transactions for selected month
  const recentTransactions = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      return t.entityType === activeTab && 
             transactionDate.getMonth() === selectedDate.getMonth() &&
             transactionDate.getFullYear() === selectedDate.getFullYear();
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Get expense categories for selected month
  const expensesByCategory = transactions
    .filter(t => {
      const transactionDate = new Date(t.date);
      const isSelectedMonth = transactionDate.getMonth() === selectedDate.getMonth() &&
                            transactionDate.getFullYear() === selectedDate.getFullYear();
      return t.entityType === activeTab && t.type === 'expense' && isSelectedMonth;
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

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate);
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setSelectedDate(newDate);
  };

  const formatMonthYear = (date: Date) => {
    return date.toLocaleDateString('pt-BR', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground text-sm md:text-base">Visão geral - {entityTitle}</p>
        </div>
        <Button 
          onClick={() => navigate('/transactions')} 
          className="gap-2 w-full sm:w-auto"
          size="sm"
        >
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      {/* Month Filter - Mobile Optimized */}
      <Card className="glass-effect border-white/20">
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 md:h-5 md:w-5 text-primary" />
              <span className="font-medium text-sm md:text-base">Período:</span>
            </div>
            <div className="flex items-center justify-center gap-2 md:gap-3">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="hover:bg-white/20 h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-base md:text-lg font-semibold min-w-[160px] md:min-w-[180px] text-center capitalize">
                {formatMonthYear(selectedDate)}
              </span>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigateMonth('next')}
                className="hover:bg-white/20 h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards - Mobile Grid */}
      <div className="grid gap-3 md:gap-4 grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Saldo Total"
          value={formatCurrency(balance)}
          changeType={balance >= 0 ? 'positive' : 'negative'}
          icon={CircleDollarSign}
          className="col-span-2 lg:col-span-1"
        />
        <StatsCard
          title="Receitas"
          value={formatCurrency(monthlyData.income)}
          changeType="positive"
          icon={TrendingUp}
        />
        <StatsCard
          title="Despesas"
          value={formatCurrency(monthlyData.expenses)}
          changeType="negative"
          icon={TrendingDown}
        />
        <StatsCard
          title="Economia"
          value={formatCurrency(savings)}
          change={`${savingsRate.toFixed(1)}% das receitas`}
          changeType={savings >= 0 ? 'positive' : 'negative'}
          icon={PieChart}
          className="col-span-2 lg:col-span-1"
        />
      </div>

      <div className="space-y-4 md:space-y-6 lg:grid lg:grid-cols-2 lg:gap-6 lg:space-y-0">
        {/* Recent Transactions - Mobile Optimized */}
        <Card className="glass-effect border-white/20">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0 pb-3">
            <CardTitle className="text-lg md:text-xl">Transações do Mês</CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate('/transactions')}
              className="w-full sm:w-auto text-xs"
            >
              Ver todas
            </Button>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <div className="space-y-3 md:space-y-4">
              {recentTransactions.length > 0 ? (
                recentTransactions.map((transaction) => {
                  const category = categories.find(c => c.name === transaction.category);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-2 md:p-3 rounded-lg border bg-white/5">
                      <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                        <div 
                          className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: category?.color || '#6B7280' }}
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm md:text-base truncate">{transaction.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {transaction.category} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                      <span className={`font-semibold text-sm md:text-base flex-shrink-0 ml-2 ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
                    </div>
                  );
                })
              ) : (
                <p className="text-center text-muted-foreground py-6 md:py-8 text-sm">
                  Nenhuma transação encontrada para este mês
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expenses by Category - Mobile Optimized */}
        <Card className="glass-effect border-white/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg md:text-xl">Gastos por Categoria</CardTitle>
            <p className="text-sm text-muted-foreground capitalize">{formatMonthYear(selectedDate)}</p>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <div className="space-y-3 md:space-y-4">
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
                          <div className="flex items-center gap-2 flex-1 min-w-0">
                            <div 
                              className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full flex-shrink-0"
                              style={{ backgroundColor: category?.color || '#6B7280' }}
                            />
                            <span className="text-sm font-medium truncate">{categoryName}</span>
                          </div>
                          <span className="text-sm text-muted-foreground flex-shrink-0 ml-2">
                            {formatCurrency(amount)}
                          </span>
                        </div>
                        <Progress value={percentage} className="h-1.5 md:h-2" />
                      </div>
                    );
                  })
              ) : (
                <p className="text-center text-muted-foreground py-6 md:py-8 text-sm">
                  Nenhuma despesa encontrada para este mês
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Mobile Optimized */}
      <Card className="glass-effect border-white/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg md:text-xl">Ações Rápidas</CardTitle>
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3">
            <Button 
              variant="outline" 
              className="h-16 md:h-20 flex flex-col gap-2 glass-effect border-white/20 hover:bg-white/20"
              onClick={() => navigate('/transactions')}
            >
              <Plus className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-sm">Nova Transação</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 md:h-20 flex flex-col gap-2 glass-effect border-white/20 hover:bg-white/20"
              onClick={() => navigate('/reports')}
            >
              <PieChart className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-sm">Ver Relatórios</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-16 md:h-20 flex flex-col gap-2 glass-effect border-white/20 hover:bg-white/20"
              onClick={() => navigate('/goals')}
            >
              <TrendingUp className="h-5 w-5 md:h-6 md:w-6" />
              <span className="text-sm">Definir Metas</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
