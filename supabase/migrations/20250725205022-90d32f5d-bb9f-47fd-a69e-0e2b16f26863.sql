-- Remove entity_type column from all tables
ALTER TABLE public.accounts DROP COLUMN IF EXISTS entity_type;
ALTER TABLE public.categories DROP COLUMN IF EXISTS entity_type; 
ALTER TABLE public.transactions DROP COLUMN IF EXISTS entity_type;
ALTER TABLE public.budgets DROP COLUMN IF EXISTS entity_type;
ALTER TABLE public.financial_goals DROP COLUMN IF EXISTS entity_type;