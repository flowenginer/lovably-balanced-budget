import { useState, useEffect } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Account, Bank } from '@/types/financial';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Plus, Building2, Eye, EyeOff, Search, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

export default function Accounts() {
  const { accounts, refreshData } = useFinancial();
  const { user } = useAuth();
  const [banks, setBanks] = useState<Bank[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking' as Account['type'],
    initialBalance: 0,
    showInDashboard: true,
    bankName: '',
    isBankAccount: true
  });

  // Carregar bancos disponíveis
  const loadBanks = async () => {
    try {
      const { data, error } = await supabase
        .from('banks')
        .select('*')
        .order('name');

      if (error) throw error;
      
      const mappedBanks: Bank[] = (data || []).map(item => ({
        id: item.id,
        name: item.name,
        iconUrl: item.icon_url,
        color: item.color
      }));
      
      setBanks(mappedBanks);
    } catch (error) {
      console.error('Erro ao carregar bancos:', error);
      toast.error('Erro ao carregar bancos');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadBanks();
  }, []);

  // Filtrar bancos por busca
  const filteredBanks = banks.filter(bank => 
    bank.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Criar nova conta
  const handleCreateAccount = async () => {
    if (!newAccount.name || !selectedBank || !user) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    try {
      const { error } = await supabase
        .from('accounts')
        .insert({
          user_id: user.id,
          name: newAccount.name,
          type: newAccount.type,
          balance: newAccount.initialBalance,
          initial_balance: newAccount.initialBalance,
          bank_name: selectedBank.name,
          bank_icon: selectedBank.iconUrl,
          show_in_dashboard: newAccount.showInDashboard,
          is_bank_account: newAccount.isBankAccount
        });

      if (error) throw error;

      toast.success('Conta criada com sucesso!');
      setDialogOpen(false);
      setSelectedBank(null);
      setNewAccount({
        name: '',
        type: 'checking',
        initialBalance: 0,
        showInDashboard: true,
        bankName: '',
        isBankAccount: true
      });
      refreshData();
    } catch (error) {
      console.error('Erro ao criar conta:', error);
      toast.error('Erro ao criar conta');
    }
  };

  // Alternar visibilidade na dashboard
  const toggleDashboardVisibility = async (accountId: string, currentValue: boolean) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .update({ show_in_dashboard: !currentValue })
        .eq('id', accountId);

      if (error) throw error;

      toast.success(`Conta ${!currentValue ? 'exibida' : 'ocultada'} na dashboard`);
      refreshData();
    } catch (error) {
      console.error('Erro ao alterar visibilidade:', error);
      toast.error('Erro ao alterar visibilidade');
    }
  };

  // Deletar conta
  const handleDeleteAccount = async (accountId: string) => {
    try {
      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', accountId);

      if (error) throw error;

      toast.success('Conta removida com sucesso!');
      refreshData();
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      toast.error('Erro ao deletar conta');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const bankAccounts = accounts.filter(account => 
    // Considerar como conta bancária se é nova (tem bankName) ou antiga sem bankName mas não é dinheiro
    account.bankName || (!account.bankName && account.type !== 'cash')
  );

  const totalBalance = bankAccounts
    .filter(account => account.showInDashboard ?? true)
    .reduce((sum, account) => sum + account.balance, 0);

  const visibleAccounts = bankAccounts.filter(account => account.showInDashboard ?? true);

  return (
    <div className="space-y-4 px-4 md:px-6 pb-32 md:pb-6 mobile-safe-area">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Contas Bancárias</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            Gerencie suas contas e configure quais aparecem na dashboard
          </p>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 text-sm">
              <Plus className="h-4 w-4" />
              Nova Conta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {selectedBank ? `Conta ${selectedBank.name}` : 'Qual é a instituição financeira da conta que você quer adicionar?'}
              </DialogTitle>
            </DialogHeader>
            
            {!selectedBank ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {filteredBanks.map((bank) => (
                    <Button
                      key={bank.id}
                      variant="ghost"
                      className="w-full justify-between h-auto p-4"
                      onClick={() => setSelectedBank(bank)}
                    >
                      <div className="flex items-center gap-3">
                        {bank.iconUrl ? (
                          <img 
                            src={bank.iconUrl} 
                            alt={bank.name}
                            className="w-8 h-8 rounded-full object-contain"
                          />
                        ) : (
                          <div 
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: bank.color }}
                          >
                            {bank.name.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium">{bank.name}</span>
                      </div>
                      <div className="w-4 h-4 text-muted-foreground">→</div>
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  {selectedBank.iconUrl ? (
                    <img 
                      src={selectedBank.iconUrl} 
                      alt={selectedBank.name}
                      className="w-10 h-10 rounded-full object-contain"
                    />
                  ) : (
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: selectedBank.color }}
                    >
                      {selectedBank.name.charAt(0)}
                    </div>
                  )}
                  <span className="font-medium">{selectedBank.name}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setSelectedBank(null)}
                    className="ml-auto"
                  >
                    Trocar
                  </Button>
                </div>

                <div>
                  <Label htmlFor="accountName">Nome da Conta *</Label>
                  <Input
                    id="accountName"
                    placeholder="Ex: Conta Corrente, Poupança..."
                    value={newAccount.name}
                    onChange={(e) => setNewAccount(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                
                <div>
                  <Label htmlFor="accountType">Tipo de Conta</Label>
                  <Select 
                    value={newAccount.type} 
                    onValueChange={(value) => setNewAccount(prev => ({ 
                      ...prev, 
                      type: value as Account['type'] 
                    }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="checking">Conta Corrente</SelectItem>
                      <SelectItem value="savings">Poupança</SelectItem>
                      <SelectItem value="investment">Investimentos</SelectItem>
                      <SelectItem value="credit">Cartão de Crédito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="initialBalance">Saldo Atual (R$)</Label>
                  <Input
                    id="initialBalance"
                    type="number"
                    step="0.01"
                    value={newAccount.initialBalance || ''}
                    onChange={(e) => setNewAccount(prev => ({ 
                      ...prev, 
                      initialBalance: parseFloat(e.target.value) || 0 
                    }))}
                    placeholder="0,00"
                  />
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="showInDashboard">Mostrar na Dashboard</Label>
                  <Switch
                    id="showInDashboard"
                    checked={newAccount.showInDashboard}
                    onCheckedChange={(checked) => setNewAccount(prev => ({ 
                      ...prev, 
                      showInDashboard: checked 
                    }))}
                  />
                </div>

                <Button onClick={handleCreateAccount} className="w-full">
                  Criar Conta
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Resumo Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Total</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalBalance.toLocaleString('pt-BR', { 
                style: 'currency', 
                currency: 'BRL' 
              })}
            </div>
            <p className="text-xs text-muted-foreground">
              {visibleAccounts.length} contas visíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Contas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bankAccounts.length}</div>
            <p className="text-xs text-muted-foreground">
              {bankAccounts.length - visibleAccounts.length} ocultas da dashboard
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Contas */}
      <div className="space-y-4">
        {bankAccounts.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center">
                <Building2 className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-2 text-sm font-semibold">Nenhuma conta criada</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Comece adicionando suas contas bancárias.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          bankAccounts.map((account) => (
            <Card key={account.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {account.bankName && banks.find(b => b.name === account.bankName)?.iconUrl ? (
                        <img 
                          src={banks.find(b => b.name === account.bankName)?.iconUrl} 
                          alt={account.bankName}
                          className="w-12 h-12 rounded-full object-contain"
                        />
                      ) : (
                        <div 
                          className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold"
                          style={{ 
                            backgroundColor: banks.find(b => b.name === account.bankName)?.color || '#3B82F6' 
                          }}
                        >
                          {(account.bankName || account.name).charAt(0)}
                        </div>
                      )}
                    <div>
                      <h3 className="font-semibold">{account.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        {account.bankName || 'Conta Manual'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {account.type === 'checking' && 'Corrente'}
                          {account.type === 'savings' && 'Poupança'}
                          {account.type === 'investment' && 'Investimento'}
                          {account.type === 'credit' && 'Crédito'}
                          {account.type === 'cash' && 'Dinheiro'}
                        </Badge>
                        {(account.showInDashboard ?? true) ? (
                          <Badge variant="default" className="text-xs">
                            <Eye className="w-3 h-3 mr-1" />
                            Visível
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            <EyeOff className="w-3 h-3 mr-1" />
                            Oculta
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-2xl font-bold">
                      {account.balance.toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      })}
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleDashboardVisibility(account.id, account.showInDashboard ?? true)}
                      >
                        {(account.showInDashboard ?? true) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteAccount(account.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}