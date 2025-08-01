import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Transaction } from '@/types/financial';
import { getCurrentDateString } from '@/utils/dateUtils';

interface MobileTransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Transaction, 'id'>) => void;
  categories: Array<{ id: string; name: string; type: 'income' | 'expense'; color: string }>;
  accounts: Array<{ id: string; name: string }>;
  initialType?: 'income' | 'expense';
}

export function MobileTransactionForm({
  isOpen,
  onClose,
  onSubmit,
  categories,
  accounts,
  initialType = 'expense'
}: MobileTransactionFormProps) {
  const [formData, setFormData] = useState({
    type: initialType as 'income' | 'expense',
    category: '',
    description: '',
    amount: '',
    date: getCurrentDateString(),
    paymentMethod: 'cash',
    account: '',
    isRecurring: false,
    observations: '',
  });

  // Update form type when initialType changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, type: initialType, category: '' }));
  }, [initialType]);

  const typeCategories = categories.filter(c => c.type === formData.type);
  const entityAccounts = accounts;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.description || !formData.amount || !formData.account) {
      return;
    }

    onSubmit({
      ...formData,
      amount: parseFloat(formData.amount)
    });

    // Reset form
    setFormData({
      type: 'expense',
      category: '',
      description: '',
      amount: '',
      date: getCurrentDateString(),
      paymentMethod: 'cash',
      account: '',
      isRecurring: false,
      observations: '',
    });
    
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-4 rounded-2xl bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-center">Nova Transação</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <Tabs value={formData.type} onValueChange={(value) => 
            setFormData({...formData, type: value as 'income' | 'expense', category: ''})
          }>
            <TabsList className="grid w-full grid-cols-2 rounded-xl">
              <TabsTrigger value="income" className="rounded-lg">Receita</TabsTrigger>
              <TabsTrigger value="expense" className="rounded-lg">Despesa</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              placeholder="R$ 0,00"
              value={formData.amount}
              onChange={(e) => setFormData({...formData, amount: e.target.value})}
              className="text-2xl font-bold text-center h-14 rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição *</Label>
            <Input
              id="description"
              placeholder="O que foi?"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="rounded-xl"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria *</Label>
            <Input
              id="category"
              placeholder="Digite ou selecione uma categoria"
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
              className="rounded-xl"
              list="categories-list"
            />
            <datalist id="categories-list">
              {typeCategories.filter((category, index, self) => 
                self.findIndex(c => c.name === category.name) === index
              ).map((category) => (
                <option key={category.id} value={category.name} />
              ))}
            </datalist>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="rounded-xl"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="account">Conta *</Label>
              <Select value={formData.account} onValueChange={(value) => 
                setFormData({...formData, account: value})
              }>
              <SelectTrigger className="rounded-xl bg-background border-border">
                <SelectValue placeholder="Conta" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                {entityAccounts.filter((account, index, self) => 
                  self.findIndex(a => a.name === account.name) === index
                ).map((account) => (
                  <SelectItem key={account.id} value={account.name}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
            <Select value={formData.paymentMethod} onValueChange={(value) => 
              setFormData({...formData, paymentMethod: value})
            }>
              <SelectTrigger className="rounded-xl bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border">
                <SelectItem value="cash">Dinheiro</SelectItem>
                <SelectItem value="debit">Cartão de Débito</SelectItem>
                <SelectItem value="credit">Cartão de Crédito</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="transfer">Transferência</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="recurring"
              checked={formData.isRecurring}
              onCheckedChange={(checked) => 
                setFormData({...formData, isRecurring: checked as boolean})
              }
            />
            <Label htmlFor="recurring" className="text-sm">Transação recorrente</Label>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="flex-1 rounded-xl"
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1 rounded-xl">
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}