import { useState, useEffect } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { supabase } from '@/integrations/supabase/client';
import { Budget } from '@/types/financial';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileDashboard } from '@/components/Mobile/MobileDashboard';
import { MobileTransactionForm } from '@/components/Mobile/MobileTransactionForm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Target, AlertCircle, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const isMobile = useIsMobile();
  const [showMobileForm, setShowMobileForm] = useState(false);
  const [initialTransactionType, setInitialTransactionType] = useState<'income' | 'expense'>('expense');
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const { 
    transactions, 
    accounts, 
    categories,
    goals,
    addTransaction
  } = useFinancial();

  const selectedMonth = selectedDate.getMonth() + 1;
  const selectedYear = selectedDate.getFullYear();
  
  // Filter data by selected month/year
  const filteredTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() + 1 === selectedMonth && 
           transactionDate.getFullYear() === selectedYear;
  });
  
  // Calculate monthly totals first
  const monthlyIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const monthlyExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  // Calculate monthly balance (accounts initial balance + this month's income - expenses)
  const accountsInitialBalance = accounts
    .filter(account => account.showInDashboard !== false)
    .reduce((sum, account) => sum + (account.initialBalance || 0), 0);
  
  const monthlyBalance = accountsInitialBalance + monthlyIncome - monthlyExpenses;

  // Carregar orçamentos para o mês selecionado
  const loadBudgets = async () => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('month', selectedMonth)
        .eq('year', selectedYear);

      if (error) throw error;
      
      const mappedBudgets: Budget[] = (data || []).map(item => ({
        id: item.id,
        userId: item.user_id,
        categoryId: item.category_id,
        amount: item.amount,
        month: item.month,
        year: item.year,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      }));
      
      setBudgets(mappedBudgets);
    } catch (error) {
      console.error('Erro ao carregar orçamentos:', error);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, [selectedMonth, selectedYear]);

  // Calcular status dos orçamentos
  const budgetStatus = budgets.map(budget => {
    const categoryName = categories.find(c => c.id === budget.categoryId)?.name || '';
    const spent = filteredTransactions
      .filter(t => t.type === 'expense' && t.category === categoryName)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    
    return {
      ...budget,
      categoryName,
      spent,
      percentage,
      status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'normal'
    };
  });

  const budgetsInLimit = budgetStatus.filter(b => b.percentage < 100).length;
  const budgetsExceeded = budgetStatus.filter(b => b.percentage >= 100).length;

  // Chart data for selected month
  const dailyData = eachDayOfInterval({
    start: startOfMonth(selectedDate),
    end: endOfMonth(selectedDate)
  }).map(date => {
    const dayTransactions = filteredTransactions.filter(t => 
      format(new Date(t.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
    
    return {
      date: format(date, 'dd'),
      income: dayTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
      expense: dayTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0)
    };
  });

  // Category data for pie chart
  const categoryData = categories
    .filter(c => c.type === 'expense')
    .map(category => {
      const amount = filteredTransactions
        .filter(t => t.category === category.name && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        name: category.name,
        value: amount,
        color: category.color
      };
    })
    .filter(item => item.value > 0);

  const handlePreviousMonth = () => {
    setSelectedDate(prev => subMonths(prev, 1));
  };

  const handleNextMonth = () => {
    setSelectedDate(prev => addMonths(prev, 1));
  };

  const handleCurrentMonth = () => {
    setSelectedDate(new Date());
  };

  if (isMobile) {
    return (
      <>
        <MobileDashboard onAddTransaction={(type) => {
          if (type) setInitialTransactionType(type);
          setShowMobileForm(true);
        }} />
        {showMobileForm && (
          <MobileTransactionForm 
            isOpen={showMobileForm}
            onClose={() => setShowMobileForm(false)}
            onSubmit={addTransaction}
            categories={categories}
            accounts={accounts}
            initialType={initialTransactionType}
          />
        )}
      </>
    );
  }

  // Desktop Dashboard
  return (
    <div className="space-y-8 pl-6">{/* Adicionado pl-6 para espaçamento à esquerda */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral financeira
          </p>
        </div>
        <Button onClick={() => {
          setInitialTransactionType('expense');
          setShowMobileForm(true);
        }} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      {/* Month Selector */}
      <Card className="glass-effect border-white/20">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handlePreviousMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-center">
                <h2 className="text-xl font-semibold">
                  {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
                </h2>
              </div>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleNextMonth}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCurrentMonth}
            >
              Mês Atual
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-effect border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyBalance)}</div>
            <p className="text-xs text-muted-foreground">
              {monthlyBalance >= 0 ? 'Saldo positivo do mês' : 'Saldo negativo do mês'}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Receitas do Mês</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(monthlyIncome)}</div>
            <p className="text-xs text-muted-foreground">
              Total de receitas em {format(selectedDate, 'MMMM', { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Despesas do Mês</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(monthlyExpenses)}</div>
            <p className="text-xs text-muted-foreground">
              Total de despesas em {format(selectedDate, 'MMMM', { locale: ptBR })}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-effect border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo do Mês</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              monthlyIncome - monthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {formatCurrency(monthlyIncome - monthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground">
              {monthlyIncome - monthlyExpenses >= 0 ? 'Economia positiva' : 'Déficit'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 glass-effect border-white/20">
          <CardHeader>
            <CardTitle>Fluxo de Caixa Diário</CardTitle>
            <CardDescription>
              Receitas e despesas por dia em {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  labelFormatter={(label) => `Dia ${label}`}
                />
                <Bar dataKey="income" stackId="a" fill="#10B981" name="Receitas" />
                <Bar dataKey="expense" stackId="a" fill="#EF4444" name="Despesas" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 glass-effect border-white/20">
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
            <CardDescription>
              Distribuição das despesas em {format(selectedDate, 'MMMM', { locale: ptBR })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={120}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => 
                      percent > 0.05 ? `${name}: ${(percent * 100).toFixed(0)}%` : ''
                    }
                    labelLine={false}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="#ffffff"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [formatCurrency(value), 'Valor']}
                    labelFormatter={(label) => `Categoria: ${label}`}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                Nenhuma despesa registrada este mês
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Transactions and Budgets */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 glass-effect border-white/20">
          <CardHeader>
            <CardTitle>Transações do Mês</CardTitle>
            <CardDescription>Transações registradas em {format(selectedDate, 'MMMM yyyy', { locale: ptBR })}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredTransactions.slice(0, 5).map((transaction) => {
                const category = categories.find(c => c.name === transaction.category);
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: category?.color || '#6B7280' }}
                      />
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {transaction.category} • {format(new Date(transaction.date), 'dd/MM/yyyy')}
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
              })}
              {filteredTransactions.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma transação encontrada para este mês
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 glass-effect border-white/20">
          <CardHeader>
            <CardTitle>Resumo de Orçamentos</CardTitle>
            <CardDescription>
              {budgets.length > 0 ? 
                `${budgetsInLimit} de ${budgets.length} orçamentos dentro do limite` :
                'Nenhum orçamento criado'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {budgets.length > 0 ? (
              <div className="space-y-4">
                {/* Resumo geral */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-sm font-medium">Status Geral</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {budgetsExceeded > 0 && (
                      <Badge variant="destructive" className="text-xs">
                        {budgetsExceeded} excedido{budgetsExceeded > 1 ? 's' : ''}
                      </Badge>
                    )}
                    <Badge variant="default" className="text-xs">
                      {budgetsInLimit} ok
                    </Badge>
                  </div>
                </div>

                {/* Orçamentos com maior uso */}
                {budgetStatus
                  .sort((a, b) => b.percentage - a.percentage)
                  .slice(0, 3)
                  .map((budget) => (
                    <div key={budget.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{budget.categoryName}</span>
                        <Badge variant={
                          budget.status === 'exceeded' ? 'destructive' :
                          budget.status === 'warning' ? 'secondary' : 'default'
                        }>
                          {budget.percentage.toFixed(0)}%
                        </Badge>
                      </div>
                      <div className="bg-white/10 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            budget.status === 'exceeded' ? 'bg-red-500' :
                            budget.status === 'warning' ? 'bg-yellow-500' : 'bg-primary'
                          }`}
                          style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{formatCurrency(budget.spent)}</span>
                        <span>{formatCurrency(budget.amount)}</span>
                      </div>
                      {budget.status === 'exceeded' && (
                        <div className="flex items-center gap-1 text-xs text-red-400">
                          <AlertCircle className="h-3 w-3" />
                          Orçamento excedido!
                        </div>
                      )}
                      {budget.status === 'warning' && (
                        <div className="flex items-center gap-1 text-xs text-yellow-400">
                          <AlertCircle className="h-3 w-3" />
                          Próximo do limite
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground mb-3">
                  Nenhum orçamento definido
                </p>
                <Button size="sm" onClick={() => window.location.href = '/budgets'}>
                  Criar Orçamento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {showMobileForm && (
        <MobileTransactionForm 
          isOpen={showMobileForm}
          onClose={() => setShowMobileForm(false)}
          onSubmit={addTransaction}
          categories={categories}
          accounts={accounts}
          initialType={initialTransactionType}
        />
      )}
    </div>
  );
}