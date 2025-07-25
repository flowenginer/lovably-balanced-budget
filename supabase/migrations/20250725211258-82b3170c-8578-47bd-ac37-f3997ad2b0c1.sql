-- Habilitar RLS na tabela banks e criar políticas
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;

-- Permitir que todos os usuários autenticados vejam os bancos (dados públicos)
CREATE POLICY "Banks are viewable by authenticated users" 
ON banks 
FOR SELECT 
TO authenticated 
USING (true);