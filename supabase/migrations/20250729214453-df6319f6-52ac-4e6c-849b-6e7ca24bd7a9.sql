-- Corrigir funções para criar categorias e contas padrão

-- Remover as funções antigas que estão com erro
DROP FUNCTION IF EXISTS public.create_default_categories(uuid);
DROP FUNCTION IF EXISTS public.create_default_accounts(uuid);

-- Criar função para categorias padrão
CREATE OR REPLACE FUNCTION public.create_default_categories(user_id uuid)
RETURNS void AS $$
BEGIN
  -- Categorias de receita
  INSERT INTO public.categories (user_id, name, type, color) VALUES
    (user_id, 'Salário', 'income', '#10B981'),
    (user_id, 'Freelance', 'income', '#059669'),
    (user_id, 'Investimentos', 'income', '#047857'),
    (user_id, 'Vendas', 'income', '#065F46')
  ON CONFLICT DO NOTHING;

  -- Categorias de despesa
  INSERT INTO public.categories (user_id, name, type, color) VALUES
    (user_id, 'Alimentação', 'expense', '#EF4444'),
    (user_id, 'Transporte', 'expense', '#F97316'),
    (user_id, 'Moradia', 'expense', '#EAB308'),
    (user_id, 'Saúde', 'expense', '#22C55E'),
    (user_id, 'Educação', 'expense', '#3B82F6'),
    (user_id, 'Lazer', 'expense', '#A855F7'),
    (user_id, 'Compras', 'expense', '#EC4899'),
    (user_id, 'Outros', 'expense', '#6B7280')
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar função para contas padrão
CREATE OR REPLACE FUNCTION public.create_default_accounts(user_id uuid)
RETURNS void AS $$
BEGIN
  INSERT INTO public.accounts (user_id, name, type, balance, initial_balance, show_in_dashboard) VALUES
    (user_id, 'Conta Corrente', 'checking', 0.00, 0.00, true),
    (user_id, 'Poupança', 'savings', 0.00, 0.00, true),
    (user_id, 'Carteira', 'cash', 0.00, 0.00, true)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;