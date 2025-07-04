
import { useFinancial } from '@/contexts/FinancialContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

export default function Reports() {
  const { transactions, categories, activeTab } = useFinancial();
  const [selectedPeriod, setSelectedPeriod] = useState('currentMonth');

  const entityTransactions = transactions.filter(t => t.entityType === activeTab);

  // Filter transactions by period
  const getFilteredTransactions = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    switch (selectedPeriod) {
      case 'currentMonth':
        return entityTransactions.filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        });
      case 'lastMonth':
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        return entityTransactions.filter(t => {
          const date = new Date(t.date);
          return date.getMonth() === lastMonth && date.getFullYear() === lastMonthYear;
        });
      case 'currentYear':
        return entityTransactions.filter(t => {
          const date = new Date(t.date);
          return date.getFullYear() === currentYear;
        });
      case 'all':
      default:
        return entityTransactions;
    }
  };

  const filteredTransactions = getFilteredTransactions();

  // Expenses by category for pie chart
  const expensesByCategory = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => {
      const category = categories.find(c => c.name === t.category);
      const existingCategory = acc.find(item => item.name === t.category);
      
      if (existingCategory) {
        existingCategory.value += t.amount;
      } else {
        acc.push({
          name: t.category,
          value: t.amount,
          color: category?.color || '#6B7280'
        });
      }
      return acc;
    }, [] as Array<{ name: string; value: number; color: string }>)
    .sort((a, b) => b.value - a.value);

  // Income vs Expenses by month for bar chart
  const monthlyData = filteredTransactions.reduce((acc, t) => {
    const date = new Date(t.date);
    const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    
    if (!acc[monthYear]) {
      acc[monthYear] = { month: monthYear, income: 0, expenses: 0 };
    }
    
    if (t.type === 'income') {
      acc[monthYear].income += t.amount;
    } else {
      acc[monthYear].expenses += t.amount;
    }
    
    return acc;
  }, {} as Record<string, { month: string; income: number; expenses: number }>);

  const monthlyChartData = Object.values(monthlyData)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(item => ({
      ...item,
      month: new Date(item.month + '-01').toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })
    }));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalIncome = filteredTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Relatórios</h1>
          <p className="text-muted-foreground">
            Análise detalhada das suas {activeTab === 'pf' ? 'finanças pessoais' : 'finanças empresariais'}
          </p>
        </div>
        
        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
          <SelectTrigger className="w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="currentMonth">Mês Atual</SelectItem>
            <SelectItem value="lastMonth">Mês Anterior</SelectItem>
            <SelectItem value="currentYear">Ano Atual</SelectItem>
            <SelectItem value="all">Todo o Período</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Receitas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(totalIncome)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Despesas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{formatCurrency(totalExpenses)}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Saldo Líquido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(balance)}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expenses by Category */}
        <Card>
          <CardHeader>
            <CardTitle>Despesas por Categoria</CardTitle>
          </CardHeader>
          <CardContent>
            {expensesByCategory.length > 0 ? (
              <div className="space-y-4">
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expensesByCategory}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {expensesByCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="space-y-2">
                  {expensesByCategory.slice(0, 5).map((category) => (
                    <div key={category.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm">{category.name}</span>
                      </div>
                      <span className="text-sm font-medium">{formatCurrency(category.value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nenhuma despesa encontrada no período selecionado
              </div>
            )}
          </CardContent>
        </Card>

        {/* Monthly Income vs Expenses */}
        <Card>
          <CardHeader>
            <CardTitle>Receitas vs Despesas por Mês</CardTitle>
          </CardHeader>
          <CardContent>
            {monthlyChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis tickFormatter={(value) => `R$ ${(value / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value) => formatCurrency(value as number)} />
                  <Legend />
                  <Bar dataKey="income" fill="#10B981" name="Receitas" />
                  <Bar dataKey="expenses" fill="#EF4444" name="Despesas" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                Nenhum dado encontrado no período selecionado
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Transaction Details */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Detalhado</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-medium mb-2">Principais Categorias de Despesa</h4>
              <div className="space-y-2">
                {expensesByCategory.slice(0, 3).map((category) => {
                  const percentage = totalExpenses > 0 ? (category.value / totalExpenses) * 100 : 0;
                  return (
                    <div key={category.name} className="flex justify-between items-center">
                      <span className="text-sm">{category.name}</span>
                      <div className="text-right">
                        <div className="text-sm font-medium">{formatCurrency(category.value)}</div>
                        <div className="text-xs text-muted-foreground">{percentage.toFixed(1)}%</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Estatísticas do Período</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Total de transações:</span>
                  <span className="font-medium">{filteredTransactions.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Média de receitas:</span>
                  <span className="font-medium">
                    {formatCurrency(totalIncome / (filteredTransactions.filter(t => t.type === 'income').length || 1))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Média de despesas:</span>
                  <span className="font-medium">
                    {formatCurrency(totalExpenses / (filteredTransactions.filter(t => t.type === 'expense').length || 1))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Taxa de economia:</span>
                  <span className={`font-medium ${balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(1) : 0}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
