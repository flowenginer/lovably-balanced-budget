-- Atualizar políticas de INSERT para garantir que user_id seja do usuário autenticado

-- Contas
DROP POLICY IF EXISTS "Users can create their own accounts" ON public.accounts;
CREATE POLICY "Users can create their own accounts" 
ON public.accounts 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Categorias
DROP POLICY IF EXISTS "Users can create their own categories" ON public.categories;
CREATE POLICY "Users can create their own categories" 
ON public.categories 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Metas financeiras
DROP POLICY IF EXISTS "Users can create their own goals" ON public.financial_goals;
CREATE POLICY "Users can create their own goals" 
ON public.financial_goals 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Perfis
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = id);

-- Transações
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;
CREATE POLICY "Users can create their own transactions" 
ON public.transactions 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id);