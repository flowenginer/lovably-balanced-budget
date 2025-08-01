import { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useFinancial } from '@/contexts/FinancialContext';
import { format, isSameDay, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays, TrendingUp, TrendingDown, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { requestNotificationPermission } from '@/utils/pwaUtils';

interface CalendarTransaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  account: string;
  received?: boolean;
  isRecurring: boolean;
}

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDayTransactions, setSelectedDayTransactions] = useState<CalendarTransaction[]>([]);
  const { transactions, categories, accounts } = useFinancial();
  const { toast } = useToast();

  // Request notification permission on component mount
  useEffect(() => {
    const setupNotifications = async () => {
      try {
        const permission = await requestNotificationPermission();
        if (permission === 'granted') {
          toast({
            title: "Notificações ativadas",
            description: "Você receberá lembretes sobre suas transações.",
          });
          scheduleNotifications();
        }
      } catch (error) {
        console.error('Error setting up notifications:', error);
      }
    };

    setupNotifications();
  }, [toast]);

  // Schedule notifications for upcoming transactions
  const scheduleNotifications = () => {
    const today = new Date();
    const upcomingTransactions = transactions.filter(transaction => {
      const transactionDate = parseISO(transaction.date);
      const daysDiff = Math.ceil((transactionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff <= 3 && daysDiff >= 0 && !transaction.received;
    });

    upcomingTransactions.forEach(transaction => {
      const transactionDate = parseISO(transaction.date);
      const daysDiff = Math.ceil((transactionDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 0) {
        // Show notification for today's transactions
        if ('Notification' in window && Notification.permission === 'granted') {
          new Notification(`Transação hoje: ${transaction.description}`, {
            body: `${transaction.type === 'income' ? 'Receita' : 'Despesa'} de R$ ${transaction.amount.toFixed(2)}`,
            icon: '/logo-dindin.png'
          });
        }
      }
    });
  };

  // Get transactions for a specific date
  const getTransactionsForDate = (date: Date): CalendarTransaction[] => {
    return transactions
      .filter(transaction => isSameDay(parseISO(transaction.date), date))
      .map(transaction => {
        const category = categories.find(c => c.id === transaction.category);
        const account = accounts.find(a => a.id === transaction.account);
        
        return {
          id: transaction.id,
          description: transaction.description,
          amount: transaction.amount,
          type: transaction.type,
          category: category?.name || 'Categoria não encontrada',
          account: account?.name || 'Conta não encontrada',
          received: transaction.received,
          isRecurring: transaction.isRecurring
        };
      });
  };

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const dayTransactions = getTransactionsForDate(date);
      setSelectedDayTransactions(dayTransactions);
    }
  };

  // Add custom CSS for transaction indicators
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .calendar-day-with-income::after {
        content: '';
        position: absolute;
        bottom: 2px;
        left: 50%;
        transform: translateX(-50%);
        width: 6px;
        height: 6px;
        background-color: #10b981;
        border-radius: 50%;
      }
      .calendar-day-with-expense::after {
        content: '';
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 6px;
        height: 6px;
        background-color: #ef4444;
        border-radius: 50%;
      }
      .calendar-day-with-both::after {
        content: '';
        position: absolute;
        bottom: 2px;
        left: 2px;
        width: 6px;
        height: 6px;
        background-color: #10b981;
        border-radius: 50%;
      }
      .calendar-day-with-both::before {
        content: '';
        position: absolute;
        bottom: 2px;
        right: 2px;
        width: 6px;
        height: 6px;
        background-color: #ef4444;
        border-radius: 50%;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const totalIncome = selectedDayTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = selectedDayTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-3">
        <CalendarDays className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold">Calendário Financeiro</h1>
          <p className="text-muted-foreground">Visualize suas receitas e despesas por data</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Calendar */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarDays className="h-5 w-5" />
              Calendário
              <Button
                variant="outline"
                size="sm"
                onClick={() => requestNotificationPermission()}
                className="ml-auto"
              >
                <Bell className="h-4 w-4 mr-2" />
                Ativar Notificações
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={handleDateSelect}
              locale={ptBR}
              className="rounded-md border"
              modifiers={{
                hasIncome: (date) => {
                  const dayTransactions = getTransactionsForDate(date);
                  return dayTransactions.some(t => t.type === 'income') && !dayTransactions.some(t => t.type === 'expense');
                },
                hasExpense: (date) => {
                  const dayTransactions = getTransactionsForDate(date);
                  return dayTransactions.some(t => t.type === 'expense') && !dayTransactions.some(t => t.type === 'income');
                },
                hasBoth: (date) => {
                  const dayTransactions = getTransactionsForDate(date);
                  return dayTransactions.some(t => t.type === 'income') && dayTransactions.some(t => t.type === 'expense');
                }
              }}
              modifiersClassNames={{
                hasIncome: "calendar-day-with-income font-semibold text-green-700 dark:text-green-400",
                hasExpense: "calendar-day-with-expense font-semibold text-red-700 dark:text-red-400", 
                hasBoth: "calendar-day-with-both font-bold text-primary"
              }}
            />
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedDate && (
              <>
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium">Receitas</span>
                  </div>
                  <span className="font-bold text-green-600">
                    R$ {totalIncome.toFixed(2)}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-950/20 rounded-lg">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="h-4 w-4 text-red-600" />
                    <span className="text-sm font-medium">Despesas</span>
                  </div>
                  <span className="font-bold text-red-600">
                    R$ {totalExpense.toFixed(2)}
                  </span>
                </div>

                <div className="pt-3 border-t">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Saldo do Dia</span>
                    <span className={`font-bold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      R$ {(totalIncome - totalExpense).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Transaction Details */}
                {selectedDayTransactions.length > 0 && (
                  <div className="space-y-3 pt-4 border-t">
                    <h4 className="font-medium text-sm">Transações do Dia</h4>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {selectedDayTransactions.map((transaction) => (
                        <div key={transaction.id} className="p-3 bg-muted/50 rounded-lg">
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm">{transaction.description}</span>
                              {transaction.isRecurring && (
                                <Badge variant="outline" className="text-xs">
                                  Recorrente
                                </Badge>
                              )}
                            </div>
                            <span className={`font-bold text-sm ${
                              transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {transaction.type === 'income' ? '+' : '-'} R$ {transaction.amount.toFixed(2)}
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {transaction.category} • {transaction.account}
                          </p>
                          {transaction.received && (
                            <Badge variant="secondary" className="text-xs mt-1">
                              {transaction.type === 'income' ? 'Recebido' : 'Pago'}
                            </Badge>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}