-- Corrigir funções para adicionar search_path de segurança

-- Atualizar função de categorias padrão
CREATE OR REPLACE FUNCTION public.create_default_categories(user_id uuid)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO ''
AS $$
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
$$;

-- Atualizar função de contas padrão
CREATE OR REPLACE FUNCTION public.create_default_accounts(user_id uuid)
RETURNS void 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  INSERT INTO public.accounts (user_id, name, type, balance, initial_balance, show_in_dashboard) VALUES
    (user_id, 'Conta Corrente', 'checking', 0.00, 0.00, true),
    (user_id, 'Poupança', 'savings', 0.00, 0.00, true),
    (user_id, 'Carteira', 'cash', 0.00, 0.00, true)
  ON CONFLICT DO NOTHING;
END;
$$;