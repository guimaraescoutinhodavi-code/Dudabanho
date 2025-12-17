export const SUPABASE_URL = 'https://pnbrqkwnskaihljuothj.supabase.co';
export const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBuYnJxa3duc2thaWhsanVvdGhqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU5MjAxMTcsImV4cCI6MjA4MTQ5NjExN30.0IF_jJj3RBqTtSPFykn2mCeHjY7-BJefq1PWkWwJX_4';
2
// Helps the user set up their database if tables are missing
export const REQUIRED_SQL = `
-- Execute isso no SQL Editor do Supabase se as tabelas não existirem

CREATE TABLE IF NOT EXISTS clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT,
  pet_name TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Garante que as colunas existam caso a tabela tenha sido criada em versão anterior
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'pet_name') THEN
        ALTER TABLE clients ADD COLUMN pet_name TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clients' AND column_name = 'notes') THEN
        ALTER TABLE clients ADD COLUMN notes TEXT;
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  quantity INTEGER DEFAULT 0,
  price DECIMAL(10,2) DEFAULT 0.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS appointments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES clients(id),
  client_name TEXT, -- Fallback se não usar relação estrita
  pet_name TEXT,
  service TEXT,
  price DECIMAL(10,2),
  date TIMESTAMP WITH TIME ZONE,
  is_paid BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar Row Level Security (opcional, mas recomendado para produção)
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Políticas para permitir acesso total a usuários autenticados
-- DROP POLICY IF EXISTS remove políticas antigas para evitar conflitos
DROP POLICY IF EXISTS "Permitir acesso total a usuários autenticados em clients" ON clients;
CREATE POLICY "Permitir acesso total a usuários autenticados em clients" ON clients FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso total a usuários autenticados em products" ON products;
CREATE POLICY "Permitir acesso total a usuários autenticados em products" ON products FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir acesso total a usuários autenticados em appointments" ON appointments;
CREATE POLICY "Permitir acesso total a usuários autenticados em appointments" ON appointments FOR ALL TO authenticated USING (true) WITH CHECK (true);
`;