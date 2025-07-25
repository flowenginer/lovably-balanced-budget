-- Primeiro, remover as transações existentes
DELETE FROM transactions;

-- Depois remover todas as contas
DELETE FROM accounts;

-- Limpar outras tabelas relacionadas para um fresh start
DELETE FROM categories;
DELETE FROM budgets;
DELETE FROM financial_goals;