import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2, Receipt, CreditCard, Banknote, Home, Car, ShoppingBag, Gamepad2, Heart, GraduationCap, Utensils, Check } from 'lucide-react';
import { Transaction } from '@/types/financial';

interface MobileTransactionCardProps {
  transaction: Transaction;
  categories: Array<{ id: string; name: string; color: string }>;
  onDelete: (id: string) => void;
  onMarkAsReceived?: (id: string) => void;
  onMarkAsPaid?: (id: string) => void;
  onClick: (transaction: Transaction) => void;
  formatCurrency: (value: number) => string;
}

export function MobileTransactionCard({ 
  transaction, 
  categories, 
  onDelete, 
  onMarkAsReceived,
  onMarkAsPaid,
  onClick,
  formatCurrency 
}: MobileTransactionCardProps) {
  const category = categories.find(c => c.name === transaction.category);

  const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase();
    if (name.includes('alimentação') || name.includes('food')) return <Utensils className="h-4 w-4" />;
    if (name.includes('transporte') || name.includes('transport')) return <Car className="h-4 w-4" />;
    if (name.includes('moradia') || name.includes('casa')) return <Home className="h-4 w-4" />;
    if (name.includes('saúde') || name.includes('health')) return <Heart className="h-4 w-4" />;
    if (name.includes('lazer') || name.includes('entertainment')) return <Gamepad2 className="h-4 w-4" />;
    if (name.includes('compras') || name.includes('shopping')) return <ShoppingBag className="h-4 w-4" />;
    if (name.includes('educação') || name.includes('education')) return <GraduationCap className="h-4 w-4" />;
    if (name.includes('assinaturas') || name.includes('subscription')) return <Receipt className="h-4 w-4" />;
    return <Receipt className="h-4 w-4" />;
  };

  return (
    <div 
      className="bg-card border border-border/30 p-4 rounded-2xl hover:bg-muted/20 transition-all duration-200 cursor-pointer active:bg-muted/30 shadow-sm"
      onClick={() => onClick(transaction)}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Icon and transaction info */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm"
            style={{ backgroundColor: category?.color || 'hsl(var(--primary))' }}
          >
            <div className="text-white">
              {getCategoryIcon(transaction.category)}
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-foreground text-sm truncate leading-tight mb-1">
              {transaction.description}
            </h3>
            <div className="flex items-center gap-2">
              <p className="text-xs text-muted-foreground truncate">
                {transaction.category} | {transaction.account}
              </p>
              {/* Indicador de receita recebida */}
              {transaction.type === 'income' && transaction.received && (
                <Badge variant="default" className="bg-green-100 text-green-800 text-xs">
                  Recebido
                </Badge>
              )}
              {/* Indicador de despesa paga */}
              {transaction.type === 'expense' && transaction.received && (
                <Badge variant="default" className="bg-blue-100 text-blue-800 text-xs">
                  Pago
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        {/* Right side - Amount and buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="text-right">
            <span className={`font-bold text-base ${
              transaction.type === 'income' 
                ? 'text-green-500' 
                : 'text-red-500'
            }`}>
              {formatCurrency(transaction.amount)}
            </span>
          </div>
          
          {/* Botão de check apenas para receitas não recebidas */}
          {transaction.type === 'income' && !transaction.received && onMarkAsReceived && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsReceived(transaction.id);
              }}
              className="h-8 w-8 p-0 rounded-full hover:bg-green-100"
              title="Marcar como recebido"
            >
              <Check className="h-4 w-4 text-green-600" />
            </Button>
          )}
          
          {/* Botão de check apenas para despesas não pagas */}
          {transaction.type === 'expense' && !transaction.received && onMarkAsPaid && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsPaid(transaction.id);
              }}
              className="h-8 w-8 p-0 rounded-full hover:bg-blue-100"
              title="Marcar como pago"
            >
              <Check className="h-4 w-4 text-blue-600" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(transaction.id);
            }}
            className="h-8 w-8 p-0 rounded-full hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive transition-colors" />
          </Button>
        </div>
      </div>
    </div>
  );
}