-- Limpar todos os dados do usuário atual, mantendo a estrutura do banco

-- Deletar transações do usuário
DELETE FROM public.transactions WHERE user_id = auth.uid();

-- Deletar orçamentos do usuário  
DELETE FROM public.budgets WHERE user_id = auth.uid();

-- Deletar metas financeiras do usuário
DELETE FROM public.financial_goals WHERE user_id = auth.uid();

-- Deletar contas do usuário
DELETE FROM public.accounts WHERE user_id = auth.uid();

-- Deletar categorias do usuário
DELETE FROM public.categories WHERE user_id = auth.uid();

-- Deletar perfil do usuário (será recriado automaticamente)
DELETE FROM public.profiles WHERE id = auth.uid();