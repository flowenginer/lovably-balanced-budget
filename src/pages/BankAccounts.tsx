
import { BankSetup } from '@/components/BankSetup';
import { useFinancial } from '@/contexts/FinancialContext';

export default function BankAccounts() {
  const { activeTab } = useFinancial();

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Contas Bancárias</h1>
        <p className="text-muted-foreground">
          Configure suas contas bancárias e saldos iniciais para {activeTab === 'pf' ? 'Pessoa Física' : 'Pessoa Jurídica'}
        </p>
      </div>

      <BankSetup />
    </div>
  );
}
