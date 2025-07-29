import { useState } from 'react';
import { Transaction } from '@/types/financial';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CheckCircle, TrendingDown, Paperclip, Heart, Calendar, DollarSign, Building, Tag, Bell, FileText } from 'lucide-react';

interface TransactionDetailsModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (transaction: Transaction) => void;
  onMarkAsPaid: (transactionId: string) => void;
  formatCurrency: (value: number) => string;
  categories: Array<{ id: string; name: string; color: string }>;
}

export function TransactionDetailsModal({
  transaction,
  isOpen,
  onClose,
  onEdit,
  onMarkAsPaid,
  formatCurrency,
  categories
}: TransactionDetailsModalProps) {
  const [ignoreExpense, setIgnoreExpense] = useState(false);

  if (!transaction) return null;

  const category = categories.find(c => c.name === transaction.category);
  const isExpense = transaction.type === 'expense';

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('alimentação') || name.includes('food')) return <FileText className="h-4 w-4" />;
    if (name.includes('transporte') || name.includes('transport')) return <FileText className="h-4 w-4" />;
    if (name.includes('moradia') || name.includes('casa')) return <Building className="h-4 w-4" />;
    if (name.includes('saúde') || name.includes('health')) return <Heart className="h-4 w-4" />;
    if (name.includes('lazer') || name.includes('entertainment')) return <FileText className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-sm mx-auto bg-background border-border">
        <DialogHeader className="pb-4">
          <DialogTitle className="sr-only">Detalhes da Transação</DialogTitle>
          
          {/* Action buttons */}
          <div className="flex justify-center gap-4 pt-2">
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs text-muted-foreground">Pago</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-red-500 flex items-center justify-center">
                <TrendingDown className="h-5 w-5 text-white" />
              </div>
              <span className="text-xs text-muted-foreground">
                {isExpense ? 'Despesa' : 'Receita'}
              </span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Paperclip className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">Anexo</span>
            </div>
            
            <div className="flex flex-col items-center gap-1">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Heart className="h-5 w-5 text-muted-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">Favorita</span>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Description and Value */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Paperclip className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Descrição</p>
                <p className="font-medium">{transaction.description}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Valor</p>
                <p className="font-medium">{formatCurrency(transaction.amount)}</p>
              </div>
            </div>
          </div>

          {/* Date and Account */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Data</p>
                <p className="font-medium">
                  {new Date(transaction.date).toLocaleDateString('pt-BR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div 
                className="w-6 h-6 rounded-full flex items-center justify-center"
                style={{ backgroundColor: '#FF6B35' }}
              >
                <Building className="h-3 w-3 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Conta</p>
                <p className="font-medium">{transaction.account}</p>
              </div>
            </div>
          </div>

          {/* Category and Tags */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getCategoryIcon(transaction.category)}
              <div>
                <p className="text-sm text-muted-foreground">Categoria</p>
                <p className="font-medium">{transaction.category}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Tags</p>
                <p className="font-medium text-muted-foreground">Nenhuma</p>
              </div>
            </div>
          </div>

          {/* Reminder */}
          <div className="flex items-center gap-3">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Lembrete</p>
              <p className="font-medium">
                {transaction.isRecurring ? 'Recorrente' : 'Inativo'}
              </p>
            </div>
          </div>

          {/* Observations */}
          <div className="flex items-center gap-3">
            <FileText className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm text-muted-foreground">Observações</p>
              <p className="font-medium text-muted-foreground">
                {transaction.observations || 'Nenhuma'}
              </p>
            </div>
          </div>

          {/* Ignore expense toggle */}
          {isExpense && (
            <div className="flex items-center justify-between py-2">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center">
                  <span className="text-white text-xs font-bold">i</span>
                </div>
                <span className="font-medium">Ignorar despesa</span>
              </div>
              <Switch 
                checked={ignoreExpense}
                onCheckedChange={setIgnoreExpense}
              />
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="space-y-3 pt-4">
          <Button 
            onClick={() => onEdit(transaction)}
            className="w-full bg-red-500 hover:bg-red-600 text-white rounded-full"
          >
            Editar {isExpense ? 'despesa' : 'receita'}
          </Button>
          
          <Button 
            onClick={() => onMarkAsPaid(transaction.id)}
            variant="outline"
            className="w-full border-red-500 text-red-500 hover:bg-red-50 rounded-full"
          >
            {isExpense ? 'Pagar' : 'Receber'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}