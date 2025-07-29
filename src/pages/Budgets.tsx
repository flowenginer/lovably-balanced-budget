import { useState, useEffect } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Budget, Category } from '@/types/financial';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Target, TrendingUp, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

export default function Budgets() {
  const { categories, transactions } = useFinancial();
  const { user } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({
    categoryId: '',
    amount: 0,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear()
  });

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  // Filtrar categorias de despesa
  const expenseCategories = categories.filter(cat => 
    cat.type === 'expense'
  );

  // Carregar orçamentos
  const loadBudgets = async () => {
    try {
      const { data, error } = await supabase
        .from('budgets')
        .select('*')
        .eq('month', currentMonth)
        .eq('year', currentYear);

      if (error) throw error;
      
      // Mapear dados do Supabase para o tipo Budget
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
      toast.error('Erro ao carregar orçamentos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBudgets();
  }, []);

  // Calcular gasto atual por categoria
  const getSpentAmount = (categoryId: string) => {
    const categoryName = categories.find(c => c.id === categoryId)?.name || '';
    
    return transactions
      .filter(t => 
        t.type === 'expense' && 
        t.category === categoryName &&
        new Date(t.date).getMonth() + 1 === currentMonth &&
        new Date(t.date).getFullYear() === currentYear
      )
      .reduce((sum, t) => sum + t.amount, 0);
  };

  // Criar novo orçamento
  const handleCreateBudget = async () => {
    if (!newBudget.categoryId || newBudget.amount <= 0 || !user) {
      toast.error('Preencha todos os campos corretamente');
      return;
    }

    try {
      const { error } = await supabase
        .from('budgets')
        .insert({
          user_id: user.id,
          category_id: newBudget.categoryId,
          amount: newBudget.amount,
          month: newBudget.month,
          year: newBudget.year
        });

      if (error) throw error;

      toast.success('Orçamento criado com sucesso!');
      setDialogOpen(false);
      setNewBudget({
        categoryId: '',
        amount: 0,
        month: currentMonth,
        year: currentYear
      });
      loadBudgets();
    } catch (error) {
      console.error('Erro ao criar orçamento:', error);
      toast.error('Erro ao criar orçamento');
    }
  };

  // Deletar orçamento
  const handleDeleteBudget = async (budgetId: string) => {
    try {
      const { error } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budgetId);

      if (error) throw error;

      toast.success('Orçamento removido com sucesso!');
      loadBudgets();
    } catch (error) {
      console.error('Erro ao deletar orçamento:', error);
      toast.error('Erro ao deletar orçamento');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const budgetsWithProgress = budgets.map(budget => {
    const category = categories.find(c => c.id === budget.categoryId);
    const spent = getSpentAmount(budget.categoryId);
    const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
    
    return {
      ...budget,
      category,
      spent,
      percentage,
      status: percentage >= 100 ? 'exceeded' : percentage >= 80 ? 'warning' : 'normal'
    };
  });

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.amount, 0);
  const totalSpent = budgetsWithProgress.reduce((sum, b) => sum + b.spent, 0);
  const budgetsInLimit = budgetsWithProgress.filter(b => b.percentage < 100).length;

  return (
    <div className="px-4 pb-32 space-y-4">{/* Regra Global: px-4 pb-32 aplicada */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Orçamentos</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie seus limites de gastos por categoria
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 text-sm">
              <Plus className="h-4 w-4" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Orçamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category">Categoria</Label>
                <Select 
                  value={newBudget.categoryId} 
                  onValueChange={(value) => setNewBudget(prev => ({ ...prev, categoryId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                  <SelectContent>
                    {expenseCategories
                      .filter(cat => !budgets.some(b => b.categoryId === cat.id))
                      .map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="amount">Valor Limite (R$)</Label>
                <Input
                  id="amount"
                  type="number"
                  value={newBudget.amount || ''}
                  onChange={(e) => setNewBudget(prev => ({ 
                    ...prev, 
                    amount: parseFloat(e.target.value) || 0 
                  }))}
                  placeholder="0,00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="month">Mês</Label>
                  <Select 
                    value={newBudget.month.toString()} 
                    onValueChange={(value) => setNewBudget(prev => ({ 
                      ...prev, 
                      month: parseInt(value) 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: 12 }, (_, i) => (
                        <SelectItem key={i + 1} value={(i + 1).toString()}>
                          {new Date(2024, i).toLocaleDateString('pt-BR', { month: 'long' })}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="year">Ano</Label>
                  <Input
                    id="year"
                    type="number"
                    value={newBudget.year}
                    onChange={(e) => setNewBudget(prev => ({ 
                      ...prev, 
                      year: parseInt(e.target.value) || currentYear 
                    }))}
                  />
                </div>
              </div>

              <Button onClick={handleCreateBudget} className="w-full">
                Criar Orçamento
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo dos Orçamentos */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Orçado</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalBudgeted.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalSpent.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgetsInLimit}/{budgets.length}
            </div>
            <p className="text-xs text-muted-foreground">
              dentro do limite
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Orçamentos */}
      <div className="space-y-4">
        {budgetsWithProgress.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">Nenhum orçamento criado</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Comece criando orçamentos para suas categorias de despesa.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          budgetsWithProgress.map((budget) => (
            <Card key={budget.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: budget.category?.color || '#3B82F6' }}
                    />
                    <CardTitle className="text-lg">{budget.category?.name}</CardTitle>
                    <Badge variant={
                      budget.status === 'exceeded' ? 'destructive' :
                      budget.status === 'warning' ? 'secondary' : 'default'
                    }>
                      {budget.percentage.toFixed(0)}%
                    </Badge>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDeleteBudget(budget.id)}
                  >
                    Remover
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">{/* Aplicando space-y-2 dentro do card conforme diretrizes */}
                  <div className="flex justify-between text-sm">
                    <span>
                      Gasto: {budget.spent.toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      })}
                    </span>
                    <span>
                      Limite: {budget.amount.toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      })}
                    </span>
                  </div>
                  <Progress 
                    value={Math.min(budget.percentage, 100)} 
                    className={`h-2 ${
                      budget.status === 'exceeded' ? 'bg-red-100' :
                      budget.status === 'warning' ? 'bg-yellow-100' : ''
                    }`}
                  />
                  {budget.percentage >= 80 && (
                    <div className="flex items-center gap-2 text-sm">
                      <AlertTriangle className="h-4 w-4 text-orange-500" />
                      <span className="text-orange-600">
                        {budget.percentage >= 100 ? 
                          'Orçamento excedido!' : 
                          'Atenção: próximo do limite!'
                        }
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}