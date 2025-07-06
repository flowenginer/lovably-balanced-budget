
-- Criar tabela de perfis de usuário
CREATE TABLE public.profiles (
  id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  avatar_url TEXT,
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  PRIMARY KEY (id)
);

-- Criar tabela de contas
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'cash', 'investment', 'credit')),
  balance DECIMAL(12,2) DEFAULT 0.00,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('pf', 'pj')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de categorias
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  entity_type TEXT NOT NULL CHECK (entity_type IN ('pf', 'pj')),
  color TEXT NOT NULL DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de transações
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE RESTRICT,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE RESTRICT,
  description TEXT NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  date DATE NOT NULL,
  payment_method TEXT NOT NULL,
  is_recurring BOOLEAN DEFAULT FALSE,
  observations TEXT,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('pf', 'pj')),
  attachment_url TEXT,
  pix_key TEXT,
  pix_key_type TEXT CHECK (pix_key_type IN ('cpf', 'cnpj', 'email', 'phone', 'random')),
  bank_name TEXT,
  bank_agency TEXT,
  bank_account TEXT,
  bank_cpf_cnpj TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de metas financeiras
CREATE TABLE public.financial_goals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  target_amount DECIMAL(12,2) NOT NULL,
  current_amount DECIMAL(12,2) DEFAULT 0.00,
  deadline DATE NOT NULL,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('pf', 'pj')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS) em todas as tabelas
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_goals ENABLE ROW LEVEL SECURITY;

-- Políticas para tabela profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para tabela accounts
CREATE POLICY "Users can view their own accounts" ON public.accounts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts" ON public.accounts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" ON public.accounts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own accounts" ON public.accounts
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para tabela categories
CREATE POLICY "Users can view their own categories" ON public.categories
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories" ON public.categories
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories" ON public.categories
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories" ON public.categories
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para tabela transactions
CREATE POLICY "Users can view their own transactions" ON public.transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" ON public.transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own transactions" ON public.transactions
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own transactions" ON public.transactions
  FOR DELETE USING (auth.uid() = user_id);

-- Políticas para tabela financial_goals
CREATE POLICY "Users can view their own goals" ON public.financial_goals
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own goals" ON public.financial_goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own goals" ON public.financial_goals
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own goals" ON public.financial_goals
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger para criar perfil automaticamente quando usuário se registra
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Inserir categorias padrão (função para criar depois do primeiro usuário)
CREATE OR REPLACE FUNCTION public.create_default_categories(user_id UUID)
RETURNS VOID AS $$
BEGIN
  -- Categorias PF - Receitas
  INSERT INTO public.categories (user_id, name, type, entity_type, color) VALUES
  (user_id, 'Salário', 'income', 'pf', '#10B981'),
  (user_id, 'Freelance', 'income', 'pf', '#059669'),
  (user_id, 'Investimentos', 'income', 'pf', '#06B6D4');
  
  -- Categorias PF - Despesas
  INSERT INTO public.categories (user_id, name, type, entity_type, color) VALUES
  (user_id, 'Alimentação', 'expense', 'pf', '#EF4444'),
  (user_id, 'Transporte', 'expense', 'pf', '#F97316'),
  (user_id, 'Moradia', 'expense', 'pf', '#8B5CF6'),
  (user_id, 'Lazer', 'expense', 'pf', '#EC4899'),
  (user_id, 'Saúde', 'expense', 'pf', '#14B8A6');
  
  -- Categorias PJ - Receitas
  INSERT INTO public.categories (user_id, name, type, entity_type, color) VALUES
  (user_id, 'Vendas', 'income', 'pj', '#10B981'),
  (user_id, 'Serviços', 'income', 'pj', '#059669'),
  (user_id, 'Consultoria', 'income', 'pj', '#06B6D4');
  
  -- Categorias PJ - Despesas
  INSERT INTO public.categories (user_id, name, type, entity_type, color) VALUES
  (user_id, 'Folha de Pagamento', 'expense', 'pj', '#EF4444'),
  (user_id, 'Fornecedores', 'expense', 'pj', '#F97316'),
  (user_id, 'Impostos', 'expense', 'pj', '#8B5CF6'),
  (user_id, 'Aluguel Comercial', 'expense', 'pj', '#EC4899'),
  (user_id, 'Marketing', 'expense', 'pj', '#14B8A6');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Inserir contas padrão (função para criar depois do primeiro usuário)
CREATE OR REPLACE FUNCTION public.create_default_accounts(user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.accounts (user_id, name, type, balance, entity_type) VALUES
  (user_id, 'Conta Corrente PF', 'checking', 0.00, 'pf'),
  (user_id, 'Poupança PF', 'savings', 0.00, 'pf'),
  (user_id, 'Dinheiro', 'cash', 0.00, 'pf'),
  (user_id, 'Conta Empresarial', 'checking', 0.00, 'pj'),
  (user_id, 'Conta Investimentos PJ', 'investment', 0.00, 'pj');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
