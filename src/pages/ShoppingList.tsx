import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Plus, ExternalLink, Trash2, Edit, Check, ShoppingCart, Filter } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ShoppingItem {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  price: number;
  priority: number;
  purchase_link: string | null;
  target_date: string | null;
  is_purchased: boolean;
  purchased_at: string | null;
  created_at: string;
  updated_at: string;
}

const priorityColors = {
  1: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Muito Baixa' },
  2: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Baixa' },
  3: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Média' },
  4: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Alta' },
  5: { bg: 'bg-red-100', text: 'text-red-800', label: 'Muito Alta' },
};

export default function ShoppingList() {
  const { user } = useAuth();
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingItem | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'purchased'>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    priority: '3',
    purchaseLink: '',
    targetDate: '',
  });

  useEffect(() => {
    if (user) {
      loadItems();
    }
  }, [user]);

  const loadItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('shopping_items')
        .select('*')
        .eq('user_id', user?.id)
        .order('priority', { ascending: false })
        .order('target_date', { ascending: true });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
      toast({
        title: 'Erro ao carregar lista',
        description: 'Não foi possível carregar os itens da lista.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.price) {
      toast({
        title: 'Campos obrigatórios',
        description: 'Preencha o título e o valor do item.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const itemData = {
        user_id: user?.id,
        title: formData.title,
        description: formData.description || null,
        price: parseFloat(formData.price),
        priority: parseInt(formData.priority),
        purchase_link: formData.purchaseLink || null,
        target_date: formData.targetDate || null,
      };

      if (editingItem) {
        const { error } = await supabase
          .from('shopping_items')
          .update(itemData)
          .eq('id', editingItem.id);

        if (error) throw error;
        toast({ title: 'Item atualizado com sucesso!' });
      } else {
        const { error } = await supabase
          .from('shopping_items')
          .insert([itemData]);

        if (error) throw error;
        toast({ title: 'Item adicionado com sucesso!' });
      }

      setIsDialogOpen(false);
      resetForm();
      loadItems();
    } catch (error) {
      console.error('Erro ao salvar item:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar o item.',
        variant: 'destructive',
      });
    }
  };

  const handleTogglePurchased = async (item: ShoppingItem) => {
    try {
      const { error } = await supabase
        .from('shopping_items')
        .update({
          is_purchased: !item.is_purchased,
          purchased_at: !item.is_purchased ? new Date().toISOString() : null,
        })
        .eq('id', item.id);

      if (error) throw error;
      toast({
        title: !item.is_purchased ? 'Item marcado como comprado!' : 'Item marcado como pendente',
      });
      loadItems();
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o status do item.',
        variant: 'destructive',
      });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Deseja realmente excluir este item?')) return;

    try {
      const { error } = await supabase
        .from('shopping_items')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast({ title: 'Item excluído com sucesso!' });
      loadItems();
    } catch (error) {
      console.error('Erro ao excluir item:', error);
      toast({
        title: 'Erro ao excluir',
        description: 'Não foi possível excluir o item.',
        variant: 'destructive',
      });
    }
  };

  const openEditDialog = (item: ShoppingItem) => {
    setEditingItem(item);
    setFormData({
      title: item.title,
      description: item.description || '',
      price: item.price.toString(),
      priority: item.priority.toString(),
      purchaseLink: item.purchase_link || '',
      targetDate: item.target_date || '',
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      priority: '3',
      purchaseLink: '',
      targetDate: '',
    });
    setEditingItem(null);
  };

  const filteredItems = items.filter((item) => {
    const statusMatch =
      filterStatus === 'all' ||
      (filterStatus === 'pending' && !item.is_purchased) ||
      (filterStatus === 'purchased' && item.is_purchased);
    
    const priorityMatch =
      filterPriority === 'all' || item.priority.toString() === filterPriority;

    return statusMatch && priorityMatch;
  });

  const totalValue = filteredItems.reduce((sum, item) => sum + (item.is_purchased ? 0 : item.price), 0);
  const highPriorityCount = filteredItems.filter((item) => !item.is_purchased && item.priority >= 4).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Lista de Compras
          </h1>
          <p className="text-muted-foreground mt-2">
            Organize suas compras futuras com prioridades e planejamento
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={(open) => { setIsDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Adicionar Item
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{editingItem ? 'Editar Item' : 'Novo Item'}</DialogTitle>
              <DialogDescription>
                {editingItem ? 'Atualize as informações do item' : 'Adicione um novo item à sua lista de compras'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="title">Título *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Notebook Dell"
                  required
                />
              </div>
              <div>
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detalhes adicionais do item..."
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="price">Valor (R$) *</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    placeholder="0,00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Prioridade</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Muito Baixa</SelectItem>
                      <SelectItem value="2">Baixa</SelectItem>
                      <SelectItem value="3">Média</SelectItem>
                      <SelectItem value="4">Alta</SelectItem>
                      <SelectItem value="5">Muito Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label htmlFor="purchaseLink">Link de Compra</Label>
                <Input
                  id="purchaseLink"
                  type="url"
                  value={formData.purchaseLink}
                  onChange={(e) => setFormData({ ...formData, purchaseLink: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div>
                <Label htmlFor="targetDate">Data Planejada</Label>
                <Input
                  id="targetDate"
                  type="date"
                  value={formData.targetDate}
                  onChange={(e) => setFormData({ ...formData, targetDate: e.target.value })}
                />
              </div>
              <DialogFooter>
                <Button type="submit">{editingItem ? 'Salvar' : 'Adicionar'}</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Pendente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total de Itens</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredItems.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Alta Prioridade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{highPriorityCount}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Itens</CardTitle>
            <div className="flex gap-2">
              <Select value={filterStatus} onValueChange={(value: any) => setFilterStatus(value)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendentes</SelectItem>
                  <SelectItem value="purchased">Comprados</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Prioridade" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="5">Muito Alta</SelectItem>
                  <SelectItem value="4">Alta</SelectItem>
                  <SelectItem value="3">Média</SelectItem>
                  <SelectItem value="2">Baixa</SelectItem>
                  <SelectItem value="1">Muito Baixa</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredItems.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum item encontrado</h3>
              <p className="text-muted-foreground">Adicione itens à sua lista de compras</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className={item.is_purchased ? 'opacity-60' : ''}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className={`font-semibold text-lg ${item.is_purchased ? 'line-through' : ''}`}>
                            {item.title}
                          </h3>
                          <Badge className={`${priorityColors[item.priority as keyof typeof priorityColors].bg} ${priorityColors[item.priority as keyof typeof priorityColors].text}`}>
                            {priorityColors[item.priority as keyof typeof priorityColors].label}
                          </Badge>
                          {item.is_purchased && (
                            <Badge variant="outline" className="bg-green-100 text-green-800">
                              Comprado
                            </Badge>
                          )}
                        </div>
                        {item.description && (
                          <p className="text-sm text-muted-foreground">{item.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <span className="font-bold text-primary">
                            R$ {item.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                          {item.target_date && (
                            <span className="text-muted-foreground">
                              Meta: {format(new Date(item.target_date), "dd/MM/yyyy", { locale: ptBR })}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant={item.is_purchased ? "outline" : "default"}
                            onClick={() => handleTogglePurchased(item)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          {item.purchase_link && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => window.open(item.purchase_link!, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openEditDialog(item)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
