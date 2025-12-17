import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY, REQUIRED_SQL } from '../constants';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const checkDatabaseConnection = async () => {
  try {
    // We try to select a specific column (pet_name) that was added recently.
    // If the table exists but the column is missing, this will error out, 
    // forcing the user to see the SQL screen to update their DB.
    const { error } = await supabase.from('clients').select('pet_name').limit(1);
    
    if (error) {
      console.warn("Possível erro de conexão, tabela ou coluna faltando:", error.message);
      console.info("SQL Necessário para criar tabelas:", REQUIRED_SQL);
      return false;
    }
    return true;
  } catch (e) {
    console.error("Erro ao conectar:", e);
    return false;
  }
};