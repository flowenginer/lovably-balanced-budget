import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Transaction } from '@/types/financial';

interface MobileTransactionCardProps {
  transaction: Transaction;
  categories: Array<{ id: string; name: string; color: string }>;
  onDelete: (id: string) => void;
  formatCurrency: (value: number) => string;
}

export function MobileTransactionCard({ 
  transaction, 
  categories, 
  onDelete, 
  formatCurrency 
}: MobileTransactionCardProps) {
  const category = categories.find(c => c.name === transaction.category);

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-white/20 p-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${category?.color || '#6B7280'}20` }}
          >
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: category?.color || '#6B7280' }}
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm line-clamp-1">
              {transaction.description}
            </h3>
            <p className="text-xs text-muted-foreground">
              {transaction.category}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <span className={`font-bold text-sm ${
            transaction.type === 'income' 
              ? 'text-green-600' 
              : 'text-red-600'
          }`}>
            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(transaction.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span>{transaction.account}</span>
          <span>•</span>
          <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
        </div>
        
        {transaction.isRecurring && (
          <Badge variant="secondary" className="text-xs px-2 py-0.5">
            Recorrente
          </Badge>
        )}
      </div>
    </div>
  );
}