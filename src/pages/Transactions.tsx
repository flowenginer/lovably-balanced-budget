import { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Calendar, Filter, Search, Trash2, Edit, ChevronLeft, ChevronRight, Lock, Wallet, Check } from 'lucide-react';
import { Transaction } from '@/types/financial';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTransactionCard } from '@/components/Mobile/MobileTransactionCard';
import { MobileTransactionForm } from '@/components/Mobile/MobileTransactionForm';
import { TransactionDetailsModal } from '@/components/Mobile/TransactionDetailsModal';
import { getCurrentDateString } from '@/utils/dateUtils';
import { DeleteRecurringDialog } from '@/components/DeleteRecurringDialog';

export default function Transactions() {
  const { 
    transactions, 
    categories, 
    accounts, 
    addTransaction, 
    markTransactionAsReceived,
    markTransactionAsPaid,
    deleteTransaction,
    deleteAllRecurringTransactions 
  } = useFinancial();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedType, setSelectedType] = useState('all');
  const [initialTransactionType, setInitialTransactionType] = useState<'income' | 'expense'>('expense');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<Transaction | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    amount: '',
    date: getCurrentDateString(),
    paymentMethod: 'cash',
    account: '',
    isRecurring: false,
    observations: '',
  });

  const entityCategories = categories;
  const entityAccounts = accounts;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.category || !formData.description || !formData.amount || !formData.account) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }

    addTransaction({
      ...formData,
      amount: parseFloat(formData.amount)
    });

    toast({
      title: "Sucesso",
      description: "Transação adicionada com sucesso!",
    });

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
    setIsDialogOpen(false);
  };

  const handleMobileSubmit = async (transactionData: Omit<Transaction, 'id'>) => {
    try {
      await addTransaction(transactionData);
      toast({
        title: "Sucesso",
        description: "Transação adicionada com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao adicionar transação",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: string) => {
    const transaction = transactions.find(t => t.id === id);
    
    if (transaction?.isRecurring) {
      setTransactionToDelete(transaction);
      setDeleteDialogOpen(true);
    } else {
      await performDelete(id);
    }
  };

  const performDelete = async (id: string) => {
    try {
      await deleteTransaction(id);
      toast({
        title: "Sucesso",
        description: "Transação removida com sucesso!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao remover transação",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSingle = async () => {
    if (transactionToDelete) {
      await performDelete(transactionToDelete.id);
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleDeleteAll = async () => {
    if (transactionToDelete) {
      try {
        await deleteAllRecurringTransactions(transactionToDelete.id);
        toast({
          title: "Sucesso",
          description: "Todas as transações recorrentes foram removidas!",
        });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao remover transações recorrentes",
          variant: "destructive",
        });
      }
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const handleMarkAsReceived = async (id: string) => {
    try {
      await markTransactionAsReceived(id);
      toast({
        title: "Sucesso",
        description: "Receita marcada como recebida!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao marcar receita como recebida",
        variant: "destructive",
      });
    }
  };

  const handleMarkAsPaid = async (id: string) => {
    try {
      await markTransactionAsPaid(id);
      toast({
        title: "Sucesso",
        description: "Despesa marcada como paga!",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao marcar despesa como paga",
        variant: "destructive",
      });
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };


  const handleEditTransaction = (transaction: Transaction) => {
    toast({
      title: "Info",
      description: "Funcionalidade de edição em desenvolvimento",
    });
  };

  const typeCategories = categories.filter(c => c.type === formData.type);

  // Filter transactions by current month
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth.getMonth() && 
           transactionDate.getFullYear() === currentMonth.getFullYear();
  });

  // Filter transactions based on search and filters
  const filteredTransactions = currentMonthTransactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesType = selectedType === 'all' || t.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Calculate monthly totals
  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyBalance = monthlyIncome - monthlyExpenses;

  // Calculate total balance from all accounts
  const totalBalance = accounts.reduce((sum, account) => sum + (account.balance || 0), 0);

  // Group transactions by date for mobile view
  const groupedTransactions = currentMonthTransactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date);
    const dateKey = date.toLocaleDateString('pt-BR', { 
      weekday: 'long',
      day: 'numeric'
    });
    
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(transaction);
    return groups;
  }, {} as Record<string, Transaction[]>);

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  // Mobile version - RECONSTRUÇÃO COMPLETA CONFORME ESPECIFICAÇÕES
  if (isMobile) {
    return (
      <div className="px-4 pb-32 space-y-3">
        {/* Navegação de Mês */}
        <div className="flex items-center justify-center gap-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={prevMonth}
            className="rounded-full p-2 flex-shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-lg font-bold">
            {monthNames[currentMonth.getMonth()]}
          </h2>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={nextMonth}
            className="rounded-full p-2 flex-shrink-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Card de Saldos */}
        <div className="bg-primary text-primary-foreground p-3 rounded-lg">
          <div className="flex gap-3">
            {/* Div de "Saldo atual" */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/80">Saldo atual</p>
              <p className="text-lg font-bold text-white break-words">
                {formatCurrency(totalBalance)}
              </p>
            </div>
            
            {/* Linha vertical */}
            <div className="w-px bg-white/20"></div>
            
            {/* Div de "Balanço mensal" */}
            <div className="flex-1 min-w-0">
              <p className="text-xs text-white/80">Balanço mensal</p>
              <p className="text-lg font-bold text-white break-words">
                {formatCurrency(monthlyBalance)}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Transações */}
        {Object.entries(groupedTransactions).length > 0 ? (
          Object.entries(groupedTransactions).map(([dateKey, transactionsForDate]) => (
            <div key={dateKey}>
              {/* Título da data com classes específicas */}
              <h3 className="font-semibold text-sm text-muted-foreground pt-4">
                {dateKey}
              </h3>
              <div className="space-y-2 mt-2">
                {transactionsForDate.map((transaction) => (
                  <Card key={transaction.id}>{/* Cada item como Card para consistência */}
                    <CardContent className="p-0">
                      <MobileTransactionCard
                        transaction={transaction}
                        categories={categories}
                        onDelete={(transactionId: string) => handleDelete(transactionId)}
                        onMarkAsReceived={(transactionId: string) => handleMarkAsReceived(transactionId)}
                        onMarkAsPaid={(transactionId: string) => handleMarkAsPaid(transactionId)}
                        onClick={handleTransactionClick}
                        formatCurrency={formatCurrency}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground mb-4">
              Nenhuma transação encontrada para {monthNames[currentMonth.getMonth()]}
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setInitialTransactionType('expense');
                setIsDialogOpen(true);
              }}
              className="rounded-full"
            >
              Criar primeira transação
            </Button>
          </div>
        )}

        {/* Mobile Form */}
        <MobileTransactionForm
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          onSubmit={handleMobileSubmit}
          categories={categories}
          accounts={accounts}
          initialType={initialTransactionType}
        />

        {/* Transaction Details Modal */}
        <TransactionDetailsModal
          transaction={selectedTransaction}
          isOpen={isDetailsModalOpen}
          onClose={() => setIsDetailsModalOpen(false)}
          onEdit={handleEditTransaction}
          onMarkAsPaid={handleMarkAsPaid}
          formatCurrency={formatCurrency}
          categories={categories}
        />

        {/* Delete Recurring Dialog */}
        <DeleteRecurringDialog
          isOpen={deleteDialogOpen}
          onClose={() => setDeleteDialogOpen(false)}
          onDeleteSingle={handleDeleteSingle}
          onDeleteAll={handleDeleteAll}
          transactionDescription={transactionToDelete?.description || ''}
        />
      </div>
    );
  }

  // Desktop version remains unchanged
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Transações</h1>
          <p className="text-muted-foreground">
            Gerencie suas finanças
          </p>
        </div>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Nova Transação
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg z-[9999]">
            <DialogHeader>
              <DialogTitle>Nova Transação</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Tabs value={formData.type} onValueChange={(value) => 
                setFormData({...formData, type: value as 'income' | 'expense', category: ''})
              }>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="income">Receita</TabsTrigger>
                  <TabsTrigger value="expense">Despesa</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="category">Categoria *</Label>
                  <Input
                    id="category"
                    placeholder="Digite ou selecione uma categoria"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    list="desktop-categories-list"
                  />
                  <datalist id="desktop-categories-list">
                    {typeCategories.map((category) => (
                      <option key={category.id} value={category.name} />
                    ))}
                  </datalist>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="amount">Valor *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    value={formData.amount}
                    onChange={(e) => setFormData({...formData, amount: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição *</Label>
                <Input
                  id="description"
                  placeholder="Descrição da transação"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="date">Data *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Método de Pagamento</Label>
                  <Select value={formData.paymentMethod} onValueChange={(value) => setFormData({...formData, paymentMethod: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="cash">Dinheiro</SelectItem>
                      <SelectItem value="debit">Cartão de Débito</SelectItem>
                      <SelectItem value="credit">Cartão de Crédito</SelectItem>
                      <SelectItem value="pix">PIX</SelectItem>
                      <SelectItem value="transfer">Transferência</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="account">Conta *</Label>
                <Select value={formData.account} onValueChange={(value) => setFormData({...formData, account: value})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma conta" />
                  </SelectTrigger>
                  <SelectContent>
                    {entityAccounts.map((account) => (
                      <SelectItem key={account.id} value={account.name}>
                        {account.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  placeholder="Observações adicionais (opcional)"
                  value={formData.observations}
                  onChange={(e) => setFormData({...formData, observations: e.target.value})}
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, isRecurring: !!checked})
                  }
                />
                <Label htmlFor="recurring">Transação recorrente</Label>
              </div>

              <div className="flex gap-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Adicionar Transação</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Month/Year Filter */}
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const prevMonth = new Date(currentMonth);
                prevMonth.setMonth(prevMonth.getMonth() - 1);
                setCurrentMonth(prevMonth);
              }}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <div className="text-center">
              <h3 className="font-semibold text-lg">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h3>
              <p className="text-sm text-muted-foreground">
                {currentMonthTransactions.length} transações
              </p>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const nextMonth = new Date(currentMonth);
                nextMonth.setMonth(nextMonth.getMonth() + 1);
                setCurrentMonth(nextMonth);
              }}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Saldo do mês</div>
            <div className={`font-semibold ${monthlyBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatCurrency(monthlyBalance)}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Receitas</div>
            <div className="text-green-600 font-semibold">{formatCurrency(monthlyIncome)}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-muted-foreground">Despesas</div>
            <div className="text-red-600 font-semibold">{formatCurrency(monthlyExpenses)}</div>
          </div>
        </div>
      </Card>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transações..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="income">Receitas</SelectItem>
            <SelectItem value="expense">Despesas</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            {entityCategories.map((category) => (
              <SelectItem key={category.id} value={category.name}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transactions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Nenhuma transação encontrada.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        transaction.type === 'income' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                    />
                    <div>
                      <h4 className="font-medium">{transaction.description}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline" className="text-xs">
                          {transaction.category}
                        </Badge>
                        <span>•</span>
                        <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                        <span>•</span>
                        <span>{transaction.account}</span>
                      </div>
                    </div>
                  </div>
                  
                   <div className="flex items-center gap-4">
                     <span
                       className={`font-semibold ${
                         transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                       }`}
                     >
                       {transaction.type === 'income' ? '+' : '-'}
                       {formatCurrency(transaction.amount)}
                     </span>
                     
                     {/* Botão de check apenas para receitas não recebidas */}
                     {transaction.type === 'income' && !transaction.received && (
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => handleMarkAsReceived(transaction.id)}
                         className="text-green-600 hover:text-green-700"
                         title="Marcar como recebido"
                       >
                         <Check className="h-4 w-4" />
                       </Button>
                     )}
                     
                     {/* Botão de check apenas para despesas não pagas */}
                     {transaction.type === 'expense' && !transaction.received && (
                       <Button
                         variant="ghost"
                         size="sm"
                         onClick={() => handleMarkAsPaid(transaction.id)}
                         className="text-blue-600 hover:text-blue-700"
                         title="Marcar como pago"
                       >
                         <Check className="h-4 w-4" />
                       </Button>
                     )}
                     
                     {/* Indicador de receita recebida */}
                     {transaction.type === 'income' && transaction.received && (
                       <Badge variant="default" className="bg-green-100 text-green-800">
                         Recebido
                       </Badge>
                     )}
                     
                     {/* Indicador de despesa paga */}
                     {transaction.type === 'expense' && transaction.received && (
                       <Badge variant="default" className="bg-blue-100 text-blue-800">
                         Pago
                       </Badge>
                     )}
                     
                     <Button
                       variant="ghost"
                       size="sm"
                       onClick={() => handleDelete(transaction.id)}
                       className="text-red-600 hover:text-red-700"
                     >
                       <Trash2 className="h-4 w-4" />
                     </Button>
                   </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Recurring Dialog */}
      <DeleteRecurringDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onDeleteSingle={handleDeleteSingle}
        onDeleteAll={handleDeleteAll}
        transactionDescription={transactionToDelete?.description || ''}
      />
    </div>
  );
}
