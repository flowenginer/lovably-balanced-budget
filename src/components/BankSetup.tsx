
import { useState, useEffect } from 'react';
import { useFinancial } from '@/contexts/FinancialContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Banknote, Plus } from 'lucide-react';

const BANKS = [
  'Banco do Brasil',
  'Bradesco',
  'Caixa Econômica Federal',
  'Itaú',
  'Santander',
  'Nubank',
  'Inter',
  'BTG Pactual',
  'Sicoob',
  'Sicredi',
  'Banco Original',
  'Banco Safra',
  'C6 Bank',
  'Next',
  'Neon',
  'PagBank',
  'Mercado Pago',
  'Outros'
];

interface BankSetupProps {
  onClose?: () => void;
}

export function BankSetup({ onClose }: BankSetupProps) {
  const { accounts, addAccount, activeTab } = useFinancial();
  const { toast } = useToast();
  
  const [selectedBank, setSelectedBank] = useState('');
  const [accountType, setAccountType] = useState<'checking' | 'savings' | 'investment'>('checking');
  const [initialBalance, setInitialBalance] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAddBankAccount = async () => {
    if (!selectedBank || !initialBalance) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um banco e informe o saldo inicial.",
        variant: "destructive",
      });
      return;
    }

    const balance = parseFloat(initialBalance.replace(',', '.'));
    if (isNaN(balance) || balance < 0) {
      toast({
        title: "Valor inválido",
        description: "Informe um valor válido para o saldo inicial.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const accountName = `${selectedBank} - ${accountType === 'checking' ? 'Conta Corrente' : accountType === 'savings' ? 'Poupança' : 'Investimentos'}`;
      
      await addAccount({
        name: accountName,
        type: accountType,
        balance: balance,
        entityType: activeTab,
      });

      toast({
        title: "Conta adicionada",
        description: `${accountName} foi adicionada com saldo inicial de R$ ${balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`,
      });

      // Reset form
      setSelectedBank('');
      setInitialBalance('');
      setAccountType('checking');
      
      if (onClose) onClose();
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar a conta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const currentAccounts = accounts.filter(account => account.entityType === activeTab);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Adicionar Conta Bancária
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="bank">Selecione o Banco</Label>
            <Select value={selectedBank} onValueChange={setSelectedBank}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha seu banco" />
              </SelectTrigger>
              <SelectContent>
                {BANKS.map((bank) => (
                  <SelectItem key={bank} value={bank}>
                    {bank}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="accountType">Tipo de Conta</Label>
            <Select value={accountType} onValueChange={(value: 'checking' | 'savings' | 'investment') => setAccountType(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="checking">Conta Corrente</SelectItem>
                <SelectItem value="savings">Poupança</SelectItem>
                <SelectItem value="investment">Investimentos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="initialBalance">Saldo Inicial (R$)</Label>
            <Input
              id="initialBalance"
              type="number"
              step="0.01"
              min="0"
              placeholder="0,00"
              value={initialBalance}
              onChange={(e) => setInitialBalance(e.target.value)}
            />
          </div>

          <Button 
            onClick={handleAddBankAccount} 
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? 'Adicionando...' : 'Adicionar Conta'}
          </Button>
        </CardContent>
      </Card>

      {currentAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Banknote className="h-5 w-5" />
              Contas Cadastradas ({activeTab === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {currentAccounts.map((account) => (
                <div key={account.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div>
                    <p className="font-medium">{account.name}</p>
                    <p className="text-sm text-muted-foreground capitalize">
                      {account.type === 'checking' ? 'Conta Corrente' : 
                       account.type === 'savings' ? 'Poupança' : 
                       account.type === 'investment' ? 'Investimentos' : 
                       account.type === 'cash' ? 'Dinheiro' : 'Cartão de Crédito'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      R$ {account.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
