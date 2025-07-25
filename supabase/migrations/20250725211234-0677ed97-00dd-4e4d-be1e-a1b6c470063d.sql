-- Atualizar tabela de contas para incluir informações bancárias
ALTER TABLE accounts 
ADD COLUMN bank_name TEXT,
ADD COLUMN bank_icon TEXT,
ADD COLUMN show_in_dashboard BOOLEAN DEFAULT true,
ADD COLUMN initial_balance NUMERIC DEFAULT 0.00,
ADD COLUMN is_bank_account BOOLEAN DEFAULT false;

-- Atualizar contas existentes para serem contas bancárias por padrão
UPDATE accounts SET is_bank_account = true WHERE is_bank_account IS NULL;

-- Criar uma tabela para armazenar os bancos disponíveis
CREATE TABLE IF NOT EXISTS banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  icon_url TEXT,
  color TEXT DEFAULT '#3B82F6',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Inserir bancos populares brasileiros
INSERT INTO banks (name, color) VALUES 
('Santander', '#FF0000'),
('Nubank', '#8A05BE'),
('Banco do Brasil', '#FFD700'),
('Caixa Econômica Federal', '#0066CC'),
('Itaú', '#FF6600'),
('Bradesco', '#CC092F'),
('BTG Pactual', '#000000'),
('Inter', '#FF7A00'),
('C6 Bank', '#000000'),
('Original', '#00A859'),
('Safra', '#003366'),
('Sicoob', '#00A651'),
('Sicredi', '#4CAF50'),
('Next', '#8BC34A'),
('Neon', '#00E5FF'),
('99Pay', '#FFD54F'),
('PicPay', '#21C25E'),
('Mercado Pago', '#009EE3'),
('PayPal', '#003087'),
('Outro', '#6B7280')
ON CONFLICT DO NOTHING;