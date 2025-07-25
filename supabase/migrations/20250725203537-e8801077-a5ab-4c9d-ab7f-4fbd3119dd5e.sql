-- Corrigir search_path das funções existentes para segurança
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';
ALTER FUNCTION public.handle_new_user() SET search_path = '';
ALTER FUNCTION public.create_default_categories(uuid) SET search_path = '';
ALTER FUNCTION public.create_default_accounts(uuid) SET search_path = '';