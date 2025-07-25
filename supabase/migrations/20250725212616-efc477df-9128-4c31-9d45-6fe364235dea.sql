-- Atualizar os bancos com os URLs das logos baixadas
UPDATE banks SET icon_url = '/src/assets/banks/santander.png' WHERE name = 'Santander';
UPDATE banks SET icon_url = '/src/assets/banks/nubank.svg' WHERE name = 'Nubank';
UPDATE banks SET icon_url = '/src/assets/banks/banco-do-brasil.svg' WHERE name = 'Banco do Brasil';
UPDATE banks SET icon_url = '/src/assets/banks/inter.png' WHERE name = 'Inter';