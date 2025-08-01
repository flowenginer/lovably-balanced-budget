-- Atualizar URLs das logos dos bancos para a pasta public (funciona em produção)
UPDATE banks SET icon_url = '/banks/99pay.png' WHERE name = '99Pay';
UPDATE banks SET icon_url = '/banks/bradesco.png' WHERE name = 'Bradesco';
UPDATE banks SET icon_url = '/banks/btg-pactual.png' WHERE name = 'BTG Pactual';
UPDATE banks SET icon_url = '/banks/c6-bank.png' WHERE name = 'C6 Bank';
UPDATE banks SET icon_url = '/banks/caixa.png' WHERE name = 'Caixa Econômica Federal';
UPDATE banks SET icon_url = '/banks/itau.png' WHERE name = 'Itaú';
UPDATE banks SET icon_url = '/banks/mercado-pago.png' WHERE name = 'Mercado Pago';
UPDATE banks SET icon_url = '/banks/neon.png' WHERE name = 'Neon';
UPDATE banks SET icon_url = '/banks/next.png' WHERE name = 'Next';
UPDATE banks SET icon_url = '/banks/original.png' WHERE name = 'Original';
UPDATE banks SET icon_url = '/banks/paypal.png' WHERE name = 'PayPal';
UPDATE banks SET icon_url = '/banks/picpay.png' WHERE name = 'PicPay';
UPDATE banks SET icon_url = '/banks/safra.png' WHERE name = 'Safra';
UPDATE banks SET icon_url = '/banks/sicoob.png' WHERE name = 'Sicoob';
UPDATE banks SET icon_url = '/banks/sicredi.png' WHERE name = 'Sicredi';

-- Usar SVGs quando disponíveis
UPDATE banks SET icon_url = '/banks/nubank.svg' WHERE name = 'Nubank';

-- Para bancos que não conseguimos baixar, usar as existentes ou URLs diretas
UPDATE banks SET icon_url = '/src/assets/banks/banco-do-brasil.svg' WHERE name = 'Banco do Brasil';
UPDATE banks SET icon_url = '/src/assets/banks/inter.png' WHERE name = 'Inter';
UPDATE banks SET icon_url = '/src/assets/banks/santander.png' WHERE name = 'Santander';