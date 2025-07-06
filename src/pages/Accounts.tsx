
import { useState } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Wallet, CreditCard, PiggyBank } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Accounts() {
  const { accounts, activeTab } = useFinancial();
  const { toast } = useToast();
  const [isAddingAccount, setIsAddingAccount] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'checking' as 'checking' | 'savings' | 'investment' | 'credit_card',
    balance: 0
  });

  const filteredAccounts = accounts.filter(acc => acc.entityType === activeTab);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return <Wallet className="h-5 w-5" />;
      case 'savings': return <PiggyBank className="h-5 w-5" />;
      case 'credit_card': return <CreditCard className="h-5 w-5" />;
      case 'investment': return <Wallet className="h-5 w-5" />;
      default: return <Wallet className="h-5 w-5" />;
    }
  };

  const getAccountTypeName = (type: string) => {
    switch (type) {
      case 'checking': return 'Conta Corrente';
      case 'savings': return 'Poupança';
      case 'credit_card': return 'Cartão de Crédito';
      case 'investment': return 'Investimento';
      default: return type;
    }
  };

  const handleAddAccount = () => {
    if (!newAccount.name.trim()) {
      toast({
        title: "Erro",
        description: "Nome da conta é obrigatório",
        variant: "destructive",
      });
      return;
    }

    // Here you would add the account to the database
    toast({
      title: "Conta adicionada",
      description: `Conta "${newAccount.name}" foi criada com sucesso.`,
    });
    
    setNewAccount({ name: '', type: 'checking', balance: 0 });
    setIsAddingAccount(false);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Contas</h1>
          <p className="text-muted-foreground">
            Gerencie suas contas para {activeTab === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
          </p>
        </div>
        <Button onClick={() => setIsAddingAccount(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Conta
        </Button>
      </div>

      {isAddingAccount && (
        <Card>
          <CardHeader>
            <CardTitle>Nova Conta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nome da Conta</Label>
                <Input
                  id="name"
                  value={newAccount.name}
                  onChange={(e) => setNewAccount({...newAccount, name: e.target.value})}
                  placeholder="Ex: Banco do Brasil"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo de Conta</Label>
                <select
                  id="type"
                  className="w-full p-2 border rounded-md"
                  value={newAccount.type}
                  onChange={(e) => setNewAccount({...newAccount, type: e.target.value as any})}
                >
                  <option value="checking">Conta Corrente</option>
                  <option value="savings">Poupança</option>
                  <option value="investment">Investimento</option>
                  <option value="credit_card">Cartão de Crédito</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">Saldo Inicial</Label>
              <Input
                id="balance"
                type="number"
                step="0.01"
                value={newAccount.balance}
                onChange={(e) => setNewAccount({...newAccount, balance: parseFloat(e.target.value) || 0})}
                placeholder="0.00"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleAddAccount}>Salvar</Button>
              <Button variant="outline" onClick={() => setIsAddingAccount(false)}>
                Cancelar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredAccounts.map((account) => (
          <Card key={account.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {getAccountIcon(account.type)}
                  <h3 className="font-medium">{account.name}</h3>
                </div>
                <Badge variant="outline">
                  {getAccountTypeName(account.type)}
                </Badge>
              </div>
              
              <div className="space-y-2">
                <div className="text-2xl font-bold">
                  {formatCurrency(account.balance || 0)}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Saldo atual
                  </span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm">
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAccounts.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <Wallet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="font-medium mb-2">Nenhuma conta encontrada</h3>
            <p className="text-muted-foreground mb-4">
              Crie sua primeira conta para começar a controlar suas finanças.
            </p>
            <Button onClick={() => setIsAddingAccount(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Criar Conta
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
