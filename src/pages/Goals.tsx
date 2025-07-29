import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Plus, Target, Calendar, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFinancial } from '@/contexts/FinancialContext';

export default function Goals() {
  const { goals } = useFinancial();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    deadline: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implementar criação de meta no FinancialContext
    setIsDialogOpen(false);
    setFormData({ title: '', targetAmount: '', deadline: '' });
  };

  return (
    <div className="px-4 pb-32 space-y-4">{/* Regra Global de Layout Mobile aplicada */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Metas Financeiras</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Acompanhe o progresso das suas metas
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 text-sm">
              <Plus className="h-4 w-4" />
              Nova Meta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nova Meta Financeira</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título da Meta *</Label>
                <Input
                  id="title"
                  placeholder="Ex: Reserva de emergência"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="targetAmount">Valor Objetivo (R$) *</Label>
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

              <div>
                <Label htmlFor="deadline">Prazo *</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({...formData, deadline: e.target.value})}
                  required
                />
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

      {/* Lista de Metas */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Target className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">Nenhuma meta criada</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Comece definindo suas metas financeiras.
                </p>
                <Button 
                  onClick={() => setIsDialogOpen(true)} 
                  className="mt-4"
                >
                  Criar primeira meta
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => {
            const progress = (goal.currentAmount / goal.targetAmount) * 100;
            const isCompleted = progress >= 100;
            const daysRemaining = Math.ceil(
              (new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
            );

            return (
              <Card key={goal.id} className={isCompleted ? 'border-green-500' : ''}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 min-w-0 flex-1">
                      <CardTitle className="text-base md:text-lg flex items-center gap-2">
                        <Target className="h-4 w-4 md:h-5 md:w-5 flex-shrink-0" />
                        <span className="break-words">{goal.title}</span>
                      </CardTitle>
                      <div className="flex flex-col gap-1 text-xs md:text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          <span>{new Date(goal.deadline).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3 md:h-4 md:w-4 flex-shrink-0" />
                          <span className="break-words">Meta: {goal.targetAmount.toLocaleString('pt-BR', { 
                            style: 'currency', 
                            currency: 'BRL' 
                          })}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right ml-2">
                      <p className="font-semibold text-sm md:text-lg break-words">
                        {goal.currentAmount.toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                      </p>
                      <p className="text-xs md:text-sm text-muted-foreground">
                        {progress.toFixed(0)}%
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    <Progress value={progress} className="h-2" />
                    <div className="flex justify-between text-xs md:text-sm">
                      <span className={isCompleted ? 'text-green-600' : 'text-muted-foreground'}>
                        {isCompleted ? '✓ Meta atingida!' : `Faltam ${daysRemaining} dias`}
                      </span>
                      <span className="text-muted-foreground break-words">
                        Restam {(goal.targetAmount - goal.currentAmount).toLocaleString('pt-BR', { 
                          style: 'currency', 
                          currency: 'BRL' 
                        })}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}