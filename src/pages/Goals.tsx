
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Target, Plus, Calendar, TrendingUp, CheckCircle } from 'lucide-react';
import { useFinancial } from '@/contexts/FinancialContext';

export default function Goals() {
  const { activeTab } = useFinancial();
  const [goals, setGoals] = useState([
    {
      id: '1',
      title: 'Reserva de Emergência',
      targetAmount: 50000,
      currentAmount: 15000,
      deadline: '2024-12-31',
      entityType: 'pf' as 'pf' | 'pj',
      category: 'emergency'
    },
    {
      id: '2',
      title: 'Viagem Europa',
      targetAmount: 25000,
      currentAmount: 8000,
      deadline: '2024-08-15',
      entityType: 'pf' as 'pf' | 'pj',
      category: 'travel'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    deadline: '',
    category: 'savings'
  });

  const filteredGoals = goals.filter(g => g.entityType === activeTab);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newGoal = {
      id: Date.now().toString(),
      title: formData.title,
      targetAmount: parseFloat(formData.targetAmount),
      currentAmount: 0,
      deadline: formData.deadline,
      entityType: activeTab,
      category: formData.category
    };

    setGoals([...goals, newGoal]);
    setFormData({ title: '', targetAmount: '', deadline: '', category: 'savings' });
    setIsDialogOpen(false);
  };

  const updateGoalProgress = (goalId: string, amount: number) => {
    setGoals(goals.map(g => 
      g.id === goalId 
        ? { ...g, currentAmount: Math.min(g.targetAmount, g.currentAmount + amount) }
        : g
    ));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getDaysUntilDeadline = (deadline: string) => {
    const now = new Date();
    const deadlineDate = new Date(deadline);
    const timeDiff = deadlineDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return daysDiff;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      emergency: 'bg-red-100 text-red-800',
      travel: 'bg-blue-100 text-blue-800',
      savings: 'bg-green-100 text-green-800',
      investment: 'bg-purple-100 text-purple-800',
      business: 'bg-orange-100 text-orange-800',
      other: 'bg-gray-100 text-gray-800'
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      emergency: 'Emergência',
      travel: 'Viagem',
      savings: 'Poupança',
      investment: 'Investimento',
      business: 'Negócios',
      other: 'Outros'
    };
    return labels[category as keyof typeof labels] || 'Outros';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 md:px-6 pb-24 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Metas Financeiras</h1>
          <p className="text-muted-foreground">
            Defina e acompanhe suas metas {activeTab === 'pf' ? 'pessoais' : 'empresariais'}
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Nova Meta</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título da Meta *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Reserva de emergência"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAmount">Valor Objetivo *</Label>
                <Input
                  id="targetAmount"
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={formData.targetAmount}
                  onChange={(e) => setFormData({...formData, targetAmount: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="deadline">Prazo *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Categoria</Label>
                <select
                  id="category"
                  className="w-full p-2 border rounded-md"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option value="savings">Poupança</option>
                  <option value="emergency">Emergência</option>
                  <option value="travel">Viagem</option>
                  <option value="investment">Investimento</option>
                  {activeTab === 'pj' && <option value="business">Negócios</option>}
                  <option value="other">Outros</option>
                </select>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Meta</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Goals Overview */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Metas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredGoals.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Metas Concluídas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {filteredGoals.filter(g => g.currentAmount >= g.targetAmount).length}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Progresso Médio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {filteredGoals.length > 0 
                ? (filteredGoals.reduce((acc, g) => acc + (g.currentAmount / g.targetAmount), 0) / filteredGoals.length * 100).toFixed(0)
                : 0
              }%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Goals List */}
      <div className="space-y-4">
        {filteredGoals.length > 0 ? (
          filteredGoals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const daysLeft = getDaysUntilDeadline(goal.deadline);
            const isCompleted = goal.currentAmount >= goal.targetAmount;
            const isOverdue = daysLeft < 0 && !isCompleted;

            return (
              <Card key={goal.id} className={`${isCompleted ? 'border-green-200 bg-green-50/50' : ''}`}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Target className="h-5 w-5 text-blue-600" />
                      )}
                      <div>
                        <CardTitle className="text-lg">{goal.title}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getCategoryColor(goal.category)}>
                            {getCategoryLabel(goal.category)}
                          </Badge>
                          {isOverdue && (
                            <Badge variant="destructive">Atrasado</Badge>
                          )}
                          {isCompleted && (
                            <Badge className="bg-green-100 text-green-800">Concluído</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">
                        {progress.toFixed(0)}%
                      </div>
                      <div className="text-sm text-muted-foreground flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {daysLeft > 0 ? `${daysLeft} dias` : daysLeft === 0 ? 'Hoje' : `${Math.abs(daysLeft)} dias atraso`}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progresso</span>
                      <span>{formatCurrency(goal.currentAmount)} / {formatCurrency(goal.targetAmount)}</span>
                    </div>
                    <Progress value={Math.min(100, progress)} className="h-3" />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                      Faltam: {formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))}
                    </div>
                    {!isCompleted && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateGoalProgress(goal.id, 100)}
                        >
                          +R$ 100
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateGoalProgress(goal.id, 500)}
                        >
                          +R$ 500
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => {
                            const amount = prompt('Digite o valor a adicionar:');
                            if (amount && !isNaN(parseFloat(amount))) {
                              updateGoalProgress(goal.id, parseFloat(amount));
                            }
                          }}
                        >
                          Adicionar Valor
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        ) : (
          <Card>
            <CardContent className="text-center py-12">
              <Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">Nenhuma meta definida</h3>
              <p className="text-muted-foreground mb-4">
                Comece definindo suas metas financeiras para ter um direcionamento claro.
              </p>
              <Button onClick={() => setIsDialogOpen(true)}>
                Criar Primeira Meta
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Quick Tips */}
      <Card>
        <CardHeader>
          <CardTitle>Dicas para Atingir suas Metas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <h4 className="font-medium">✨ Seja Específico</h4>
              <p className="text-sm text-muted-foreground">
                Defina metas claras e mensuráveis com prazos realistas.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🔄 Automatize</h4>
              <p className="text-sm text-muted-foreground">
                Configure transferências automáticas para suas metas.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">📊 Monitore</h4>
              <p className="text-sm text-muted-foreground">
                Acompanhe seu progresso regularmente e ajuste quando necessário.
              </p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium">🎯 Priorize</h4>
              <p className="text-sm text-muted-foreground">
                Foque primeiro na reserva de emergência, depois nos outros objetivos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
