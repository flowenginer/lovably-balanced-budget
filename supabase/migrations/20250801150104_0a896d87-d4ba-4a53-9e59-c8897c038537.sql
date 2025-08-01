-- Primeiro, remover todas as categorias duplicadas, mantendo apenas uma de cada por usuário
DELETE FROM categories 
WHERE id NOT IN (
  SELECT DISTINCT ON (user_id, name, type) id 
  FROM categories 
  ORDER BY user_id, name, type, created_at ASC
);

-- Melhorar a função para evitar duplicatas futuras
CREATE OR REPLACE FUNCTION public.create_default_categories(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Verificar se já existem categorias para este usuário
  IF EXISTS (SELECT 1 FROM public.categories WHERE categories.user_id = create_default_categories.user_id LIMIT 1) THEN
    RETURN; -- Já tem categorias, não criar novamente
  END IF;

  -- Categorias de receita
  INSERT INTO public.categories (user_id, name, type, color) VALUES
    (user_id, 'Salário', 'income', '#10B981'),
    (user_id, 'Freelance', 'income', '#059669'),
    (user_id, 'Investimentos', 'income', '#047857'),
    (user_id, 'Vendas', 'income', '#065F46')
  ON CONFLICT (user_id, name, type) DO NOTHING;

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
  ON CONFLICT (user_id, name, type) DO NOTHING;
END;
$function$;

-- Adicionar constraint unique para evitar duplicatas futuras
ALTER TABLE categories 
ADD CONSTRAINT categories_user_name_type_unique 
UNIQUE (user_id, name, type);