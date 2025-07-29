-- Primeiro, vamos criar uma função para recalcular os saldos das contas
CREATE OR REPLACE FUNCTION update_account_balances()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE accounts 
  SET balance = (
    SELECT 
      COALESCE(accounts.initial_balance, 0) + 
      COALESCE(SUM(
        CASE 
          WHEN transactions.type = 'income' THEN transactions.amount
          WHEN transactions.type = 'expense' THEN -transactions.amount
          ELSE 0
        END
      ), 0)
    FROM transactions 
    WHERE transactions.account_id = accounts.id
  );
END;
$$;

-- Executar a função para recalcular todos os saldos
SELECT update_account_balances();

-- Corrigir as URLs dos bancos para usar o caminho correto dos assets
UPDATE banks SET icon_url = REPLACE(icon_url, '/src/assets/banks/', '/') WHERE icon_url LIKE '/src/assets/banks/%';

-- Atualizar URLs específicas para o caminho correto dos assets no Vite
UPDATE banks SET 
  icon_url = CASE 
    WHEN icon_url LIKE '/99pay.png' THEN '/src/assets/banks/99pay.png'
    WHEN icon_url LIKE '/banco-do-brasil.svg' THEN '/src/assets/banks/banco-do-brasil.svg'
    WHEN icon_url LIKE '/bradesco-new.png' THEN '/src/assets/banks/bradesco-new.png'
    WHEN icon_url LIKE '/btg-new.png' THEN '/src/assets/banks/btg-new.png'
    WHEN icon_url LIKE '/c6-bank.png' THEN '/src/assets/banks/c6-bank.png'
    WHEN icon_url LIKE '/caixa-new.png' THEN '/src/assets/banks/caixa-new.png'
    WHEN icon_url LIKE '/inter.png' THEN '/src/assets/banks/inter.png'
    WHEN icon_url LIKE '/itau-new.png' THEN '/src/assets/banks/itau-new.png'
    WHEN icon_url LIKE '/mercado-pago.png' THEN '/src/assets/banks/mercado-pago.png'
    WHEN icon_url LIKE '/neon.png' THEN '/src/assets/banks/neon.png'
    WHEN icon_url LIKE '/next.png' THEN '/src/assets/banks/next.png'
    WHEN icon_url LIKE '/nubank.svg' THEN '/src/assets/banks/nubank.svg'
    WHEN icon_url LIKE '/original.png' THEN '/src/assets/banks/original.png'
    WHEN icon_url LIKE '/paypal.png' THEN '/src/assets/banks/paypal.png'
    WHEN icon_url LIKE '/picpay.png' THEN '/src/assets/banks/picpay.png'
    WHEN icon_url LIKE '/safra.png' THEN '/src/assets/banks/safra.png'
    WHEN icon_url LIKE '/santander.png' THEN '/src/assets/banks/santander.png'
    WHEN icon_url LIKE '/sicoob.png' THEN '/src/assets/banks/sicoob.png'
    WHEN icon_url LIKE '/sicredi.png' THEN '/src/assets/banks/sicredi.png'
    ELSE icon_url
  END;