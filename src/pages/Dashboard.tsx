
import { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileDashboard } from '@/components/Mobile/MobileDashboard';
import { MobileTransactionForm } from '@/components/Mobile/MobileTransactionForm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Target, AlertCircle, Plus } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const isMobile = useIsMobile();
  const [showMobileForm, setShowMobileForm] = useState(false);
  
  const { 
    transactions, 
    accounts, 
    categories,
    goals,
    activeTab,
    addTransaction
  } = useFinancial();

  // Filter data by activeTab
  const filteredTransactions = transactions.filter(t => t.entityType === activeTab);
  const filteredAccounts = accounts.filter(a => a.entityType === activeTab);
  
  // Calculate totals
  const totalBalance = filteredAccounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Monthly data for current month
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyTransactions = filteredTransactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && 
           transactionDate.getFullYear() === currentYear;
  });

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
    
  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  // Chart data
  const dailyData = eachDayOfInterval({
    start: startOfMonth(new Date()),
    end: endOfMonth(new Date())
  }).map(date => {
    const dayTransactions = monthlyTransactions.filter(t => 
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
    .filter(c => c.entityType === activeTab && c.type === 'expense')
    .map(category => {
      const amount = monthlyTransactions
        .filter(t => t.category === category.name && t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        name: category.name,
        value: amount,
        color: category.color
      };
    })
    .filter(item => item.value > 0);

  if (isMobile) {
    return (
      <>
        <MobileDashboard onAddTransaction={() => setShowMobileForm(true)} />
        {showMobileForm && (
          <MobileTransactionForm 
            isOpen={showMobileForm}
            onClose={() => setShowMobileForm(false)}
            onSubmit={addTransaction}
            categories={categories}
            accounts={accounts}
            activeTab={activeTab}
          />
        )}
      </>
    );
  }

  // Desktop Dashboard
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold gradient-text">Dashboard</h1>
          <p className="text-muted-foreground">
            Visão geral - {activeTab === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
          </p>
        </div>
        <Button onClick={() => setShowMobileForm(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Nova Transação
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-effect border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalBalance)}</div>
            <p className="text-xs text-muted-foreground">
              {totalBalance >= 0 ? 'Patrimônio positivo' : 'Patrimônio negativo'}
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
              Total de receitas em {format(new Date(), 'MMMM', { locale: ptBR })}
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
              Total de despesas em {format(new Date(), 'MMMM', { locale: ptBR })}
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
              Receitas e despesas por dia em {format(new Date(), 'MMMM yyyy', { locale: ptBR })}
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
              Distribuição das despesas em {format(new Date(), 'MMMM', { locale: ptBR })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
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

      {/* Recent Transactions and Goals */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 glass-effect border-white/20">
          <CardHeader>
            <CardTitle>Transações Recentes</CardTitle>
            <CardDescription>Últimas 5 transações registradas</CardDescription>
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
                  Nenhuma transação encontrada
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3 glass-effect border-white/20">
          <CardHeader>
            <CardTitle>Metas Financeiras</CardTitle>
            <CardDescription>Progresso das suas metas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {goals.filter(g => g.entityType === activeTab).slice(0, 3).map((goal) => {
                const progress = ((goal.currentAmount || 0) / goal.targetAmount) * 100;
                return (
                  <div key={goal.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{goal.title}</span>
                      <Badge variant={progress >= 100 ? "default" : "secondary"}>
                        {progress.toFixed(0)}%
                      </Badge>
                    </div>
                    <div className="bg-white/10 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{formatCurrency(goal.currentAmount || 0)}</span>
                      <span>{formatCurrency(goal.targetAmount)}</span>
                    </div>
                  </div>
                );
              })}
              {goals.filter(g => g.entityType === activeTab).length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  Nenhuma meta definida
                </p>
              )}
            </div>
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
          activeTab={activeTab}
        />
      )}
    </div>
  );
}
