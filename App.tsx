import React, { useState, useEffect } from 'react';
import Navigation from './components/Navigation';
import AppointmentsView from './views/AppointmentsView';
import ClientsView from './views/ClientsView';
import StockView from './views/StockView';
import FinanceView from './views/FinanceView';
import AuthView from './views/AuthView';
import CalculatorView from './views/CalculatorView';
import { ViewState } from './types';
import { checkDatabaseConnection, supabase } from './services/supabase';
import { REQUIRED_SQL } from './constants';
import { Clipboard, LogOut } from 'lucide-react';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.APPOINTMENTS);
  const [dbError, setDbError] = useState(false);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    // 1. Get initial session (Supabase v2)
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    // 2. Listen for auth changes (Supabase v2)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoadingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Check database connection only if authenticated
    if (session) {
      checkDatabaseConnection().then(connected => {
        if (!connected) setDbError(true);
      });
    }
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const copySql = () => {
    navigator.clipboard.writeText(REQUIRED_SQL);
    alert("SQL copiado! Cole no SQL Editor do seu projeto Supabase.");
  };

  const renderView = () => {
    switch (currentView) {
      case ViewState.APPOINTMENTS:
        return <AppointmentsView />;
      case ViewState.STOCK:
        return <StockView />;
      case ViewState.CLIENTS:
        return <ClientsView />;
      case ViewState.FINANCE:
        return <FinanceView />;
      case ViewState.CALCULATOR:
        return <CalculatorView />;
      default:
        return <AppointmentsView />;
    }
  };

  if (loadingSession) {
    return (
      <div className="min-h-screen bg-brand-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  if (!session) {
    return <AuthView />;
  }

  if (dbError) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">Atualização Necessária</h1>
        <p className="text-gray-600 mb-6">
          Precisamos atualizar o banco de dados (criar colunas novas ou tabelas faltantes).
        </p>
        <div className="bg-gray-800 text-gray-200 p-4 rounded-lg text-left text-xs w-full overflow-x-auto mb-4 font-mono select-text">
          <pre>{REQUIRED_SQL}</pre>
        </div>
        <button 
          onClick={copySql}
          className="flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-brand-600 mb-4"
        >
          <Clipboard size={18} />
          Copiar SQL
        </button>
        <button 
          onClick={handleLogout}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Sair da conta
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 selection:bg-brand-100 relative">
      <main className="max-w-md mx-auto bg-white min-h-screen shadow-2xl overflow-hidden relative">
        <button 
          onClick={handleLogout}
          className="absolute top-4 right-4 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm text-gray-400 hover:text-red-500 transition-colors"
          title="Sair"
        >
          <LogOut size={18} />
        </button>
        {renderView()}
      </main>
      <Navigation currentView={currentView} onChangeView={setCurrentView} />
    </div>
  );
};

export default App;