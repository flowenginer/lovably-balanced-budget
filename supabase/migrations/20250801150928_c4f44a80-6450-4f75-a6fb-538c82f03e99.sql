-- Corrigir URLs finais para funcionar em produção
UPDATE banks SET icon_url = '/banks/banco-do-brasil.svg' WHERE name = 'Banco do Brasil';
UPDATE banks SET icon_url = '/banks/inter.png' WHERE name = 'Inter';  
UPDATE banks SET icon_url = '/banks/santander.png' WHERE name = 'Santander';

-- Corrigir o nome do Banco Original que estava errado
UPDATE banks SET icon_url = '/banks/original.png' WHERE name = 'Original';