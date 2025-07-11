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
    <div className="bg-card/95 backdrop-blur-sm rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${category?.color || '#6B7280'}20` }}
          >
            <div 
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: category?.color || '#6B7280' }}
            />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-card-foreground text-sm truncate">
              {transaction.description}
            </h3>
            <p className="text-xs text-muted-foreground truncate">
              {transaction.category}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-1 flex-shrink-0 ml-2">
          <div className="text-right">
            <span className={`font-bold text-sm block ${
              transaction.type === 'income' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400'
            }`}>
              {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(transaction.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span className="truncate">{transaction.account}</span>
          <span>•</span>
          <span className="flex-shrink-0">{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
        </div>
        
        {transaction.isRecurring && (
          <Badge variant="secondary" className="text-xs px-2 py-0.5 ml-2 flex-shrink-0">
            Recorrente
          </Badge>
        )}
      </div>
    </div>
  );
}