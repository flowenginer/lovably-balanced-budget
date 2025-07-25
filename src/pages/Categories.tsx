
import { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash2, Edit, Palette } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const PRESET_COLORS = [
  '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
  '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9',
  '#3B82F6', '#6366F1', '#8B5CF6', '#A855F7', '#D946EF',
  '#EC4899', '#F43F5E', '#64748B', '#6B7280', '#374151'
];

export default function Categories() {
  const { categories, addCategory, deleteCategory } = useFinancial();
  const { toast } = useToast();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<'income' | 'expense'>('expense');
  const [formData, setFormData] = useState({
    name: '',
    color: '#EF4444',
  });

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da categoria é obrigatório",
        variant: "destructive",
      });
      return;
    }

    // Verificar se categoria já existe
    const categoryExists = categories.some(
      c => c.name.toLowerCase() === formData.name.toLowerCase().trim() && c.type === selectedType
    );

    if (categoryExists) {
      toast({
        title: "Erro",
        description: "Já existe uma categoria com este nome",
        variant: "destructive",
      });
      return;
    }

    try {
      await addCategory({
        name: formData.name.trim(),
        type: selectedType,
        color: formData.color
      });

      toast({
        title: "Sucesso",
        description: "Categoria criada com sucesso!",
      });

      setFormData({ name: '', color: '#EF4444' });
      setIsDialogOpen(false);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao criar categoria. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string, name: string) => {
    const confirm = window.confirm(`Tem certeza que deseja excluir a categoria "${name}"?`);
    if (!confirm) return;

    try {
      await deleteCategory(id);
      toast({
        title: "Sucesso",
        description: "Categoria excluída com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao excluir categoria. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const CategoryList = ({ categories, type }: { categories: any[], type: string }) => (
    <div className="space-y-3">
      {categories.length > 0 ? (
        categories.map((category) => (
          <div key={category.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors">
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="font-medium">{category.name}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(category.id, category.name)}
              className="text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        ))
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          <p>Nenhuma categoria de {type.toLowerCase()} encontrada</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Categorias</h1>
          <p className="text-muted-foreground">
            Gerencie suas categorias de finanças
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Categoria
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Nova Categoria</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs value={selectedType} onValueChange={(value) => setSelectedType(value as 'income' | 'expense')}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="income">Receita</TabsTrigger>
                  <TabsTrigger value="expense">Despesa</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-2">
                <Label htmlFor="name">Nome da Categoria *</Label>
                <Input
                  id="name"
                  placeholder="Ex: Alimentação, Transporte..."
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div className="space-y-2">
                <Label>Cor da Categoria</Label>
                <div className="grid grid-cols-10 gap-2">
                  {PRESET_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({...formData, color})}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        formData.color === color 
                          ? 'border-gray-800 scale-110' 
                          : 'border-gray-300 hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <input
                    type="color"
                    value={formData.color}
                    onChange={(e) => setFormData({...formData, color: e.target.value})}
                    className="w-6 h-6 rounded border"
                  />
                  <span className="text-sm text-muted-foreground">Ou escolha uma cor personalizada</span>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Criar Categoria</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <div className="w-3 h-3 bg-green-600 rounded-full" />
              Receitas ({incomeCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryList categories={incomeCategories} type="Receitas" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <div className="w-3 h-3 bg-red-600 rounded-full" />
              Despesas ({expenseCategories.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CategoryList categories={expenseCategories} type="Despesas" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
