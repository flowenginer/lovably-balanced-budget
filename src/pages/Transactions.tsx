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
import { Plus, Calendar, Filter, Search, Trash2, Edit, ChevronLeft, ChevronRight, Lock, Wallet } from 'lucide-react';
import { Transaction } from '@/types/financial';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { MobileTransactionCard } from '@/components/Mobile/MobileTransactionCard';
import { MobileTransactionForm } from '@/components/Mobile/MobileTransactionForm';
import { TransactionDetailsModal } from '@/components/Mobile/TransactionDetailsModal';

export default function Transactions() {
  const { 
    transactions, 
    categories, 
    accounts, 
    addTransaction, 
    deleteTransaction 
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

  // Form state
  const [formData, setFormData] = useState({
    type: 'expense' as 'income' | 'expense',
    category: '',
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    paymentMethod: 'cash',
    account: '',
    isRecurring: false,
    observations: '',
  });

  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || t.category === selectedCategory;
    const matchesType = selectedType === 'all' || t.type === selectedType;
    
    return matchesSearch && matchesCategory && matchesType;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
      date: new Date().toISOString().split('T')[0],
      paymentMethod: 'cash',
      account: '',
      isRecurring: false,
      observations: '',
    });
    setIsDialogOpen(false);
  };

  const handleMobileSubmit = (data: Omit<Transaction, 'id'>) => {
    addTransaction(data);

    toast({
      title: "Sucesso",
      description: "Transação adicionada com sucesso!",
    });
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    toast({
      title: "Sucesso",
      description: "Transação excluída com sucesso!",
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const typeCategories = entityCategories.filter(c => c.type === formData.type);

  // Helper functions for mobile
  const handleTransactionClick = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsModalOpen(true);
  };

  const handleMarkAsPaid = (transactionId: string) => {
    // Aqui você pode implementar a lógica para marcar como pago
    toast({
      title: "Sucesso",
      description: "Transação marcada como paga!",
    });
    setIsDetailsModalOpen(false);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    // Implementar lógica de edição
    setIsDetailsModalOpen(false);
    setIsDialogOpen(true);
  };

  // Calculate monthly data
  const currentMonthTransactions = transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth.getMonth() && 
           transactionDate.getFullYear() === currentMonth.getFullYear();
  });

  const monthlyIncome = currentMonthTransactions
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyExpenses = currentMonthTransactions
    .filter(t => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const monthlyBalance = monthlyIncome - monthlyExpenses;

  const totalBalance = transactions.reduce((acc, t) => {
    return t.type === 'income' ? acc + t.amount : acc - t.amount;
  }, 0);

  // Filter transactions by current month
  const monthlyFilteredTransactions = filteredTransactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth.getMonth() && 
           transactionDate.getFullYear() === currentMonth.getFullYear();
  });

  // Group transactions by date
  const groupedTransactions = monthlyFilteredTransactions.reduce((groups, transaction) => {
    const date = new Date(transaction.date);
    const dateKey = date.toLocaleDateString('pt-BR', { 
      weekday: 'long', 
      day: '2-digit' 
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

  // Mobile version
  if (isMobile) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        {/* Header with month navigation and balance */}
        <div className="px-4 pt-6 pb-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevMonth}
              className="text-muted-foreground hover:text-foreground rounded-full p-2"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <h2 className="text-xl font-bold text-foreground">
              {monthNames[currentMonth.getMonth()]}
            </h2>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={nextMonth}
              className="text-muted-foreground hover:text-foreground rounded-full p-2"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>

          {/* Balance section - seguindo o padrão da dashboard */}
          <div className="bg-primary text-primary-foreground px-4 py-6 rounded-2xl">
            <div className="text-center space-y-4">
              <div>
                <p className="text-sm opacity-90 mb-2">Saldo atual em contas</p>
                <p className="text-2xl font-bold break-words">
                  {formatCurrency(totalBalance)}
                </p>
              </div>
              
              <div className="flex justify-center gap-6">
                <div className="text-center min-w-0 flex-1">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-green-300" />
                    <span className="text-xs opacity-90">Receitas</span>
                  </div>
                  <p className="text-sm font-semibold text-green-100 break-words">
                    {formatCurrency(monthlyIncome)}
                  </p>
                </div>
                
                <div className="text-center min-w-0 flex-1">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <div className="w-2 h-2 rounded-full bg-red-300" />
                    <span className="text-xs opacity-90">Despesas</span>
                  </div>
                  <p className="text-sm font-semibold text-red-100 break-words">
                    {formatCurrency(monthlyExpenses)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Transactions grouped by date */}
        <div className="px-4 pb-32 space-y-4">{/* Aplicando o mesmo padding da dashboard */}
          {Object.entries(groupedTransactions).length > 0 ? (
            Object.entries(groupedTransactions).map(([dateKey, transactionsForDate]) => (
              <div key={dateKey}>
                <h3 className="text-sm font-medium text-muted-foreground mb-3 capitalize px-1">
                  {dateKey}
                </h3>
                <div className="space-y-2">
                  {transactionsForDate.map((transaction) => (
                    <MobileTransactionCard
                      key={transaction.id}
                      transaction={transaction}
                      categories={categories}
                      onDelete={handleDelete}
                      onClick={handleTransactionClick}
                      formatCurrency={formatCurrency}
                    />
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
        </div>


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
      </div>
    );
  }

  // Desktop version
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
                  <Label htmlFor="account">Conta *</Label>
                  <Select value={formData.account} onValueChange={(value) => 
                    setFormData({...formData, account: value})
                  }>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a conta" />
                    </SelectTrigger>
                    <SelectContent>
                      {entityAccounts.filter((account, index, self) => 
                        self.findIndex(a => a.name === account.name) === index
                      ).map((account) => (
                        <SelectItem key={`${account.id}-${account.name}`} value={account.name}>
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
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Dinheiro</SelectItem>
                    <SelectItem value="debit">Cartão de Débito</SelectItem>
                    <SelectItem value="credit">Cartão de Crédito</SelectItem>
                    <SelectItem value="pix">PIX</SelectItem>
                    <SelectItem value="transfer">Transferência</SelectItem>
                    <SelectItem value="boleto">Boleto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observations">Observações</Label>
                <Textarea
                  id="observations"
                  placeholder="Observações adicionais..."
                  value={formData.observations}
                  onChange={(e) => setFormData({...formData, observations: e.target.value})}
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recurring"
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => 
                    setFormData({...formData, isRecurring: checked as boolean})
                  }
                />
                <Label htmlFor="recurring">Transação recorrente</Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Transação</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar transações..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="income">Receitas</SelectItem>
                <SelectItem value="expense">Despesas</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {entityCategories.filter((category, index, self) => 
                  self.findIndex(c => c.name === category.name) === index
                ).map((category) => (
                  <SelectItem key={`filter-${category.id}-${category.name}`} value={category.name}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Transactions List */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Transações</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => {
                const category = categories.find(c => c.name === transaction.category);
                return (
                  <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: category?.color || '#6B7280' }}
                      />
                      <div>
                        <p className="font-medium">{transaction.description}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{transaction.category}</span>
                          <span>•</span>
                          <span>{transaction.account}</span>
                          <span>•</span>
                          <span>{new Date(transaction.date).toLocaleDateString('pt-BR')}</span>
                          {transaction.isRecurring && (
                            <>
                              <span>•</span>
                              <Badge variant="secondary" className="text-xs">Recorrente</Badge>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold text-lg ${
                        transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                      </span>
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
                );
              })
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhuma transação encontrada</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsDialogOpen(true)}
                >
                  Criar primeira transação
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
