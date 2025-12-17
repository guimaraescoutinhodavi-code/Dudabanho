import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../services/supabase';
import { Appointment } from '../types';
import { ChevronLeft, ChevronRight, TrendingUp, DollarSign, Wallet } from 'lucide-react';

const FinanceView: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(getStartOfWeek(new Date()));

  function getStartOfWeek(date: Date) {
    const d = new Date(date);
    const day = d.getDay();
    // Monday as start of week
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  const fetchAppointments = async () => {
    setLoading(true);
    // Fetch all for simplicity in client-side filtering, or optimize with range query in future
    const { data, error } = await supabase
      .from('appointments')
      .select('*');
    
    if (!error && data) {
      setAppointments(data as Appointment[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const changeWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const weekData = useMemo(() => {
    const start = currentWeekStart;
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    end.setHours(23, 59, 59, 999);

    const filtered = appointments.filter(a => {
      const d = new Date(a.date);
      return d >= start && d <= end;
    });

    const paidTotal = filtered.reduce((acc, curr) => curr.is_paid ? acc + curr.price : acc, 0);
    const pendingTotal = filtered.reduce((acc, curr) => !curr.is_paid ? acc + curr.price : acc, 0);
    
    // Group by day for chart
    const dailyData = Array(7).fill(0).map((_, i) => {
      const dayDate = new Date(start);
      dayDate.setDate(dayDate.getDate() + i);
      const dayTotal = filtered
        .filter(a => new Date(a.date).getDate() === dayDate.getDate())
        .reduce((acc, curr) => acc + curr.price, 0); // Total revenue potential (paid + unpaid)
      
      return {
        dayName: dayDate.toLocaleDateString('pt-BR', { weekday: 'short' }).slice(0, 3),
        date: dayDate.getDate(),
        total: dayTotal,
        isToday: new Date().toDateString() === dayDate.toDateString()
      };
    });

    return {
      filtered,
      paidTotal,
      pendingTotal,
      total: paidTotal + pendingTotal,
      dailyData
    };
  }, [appointments, currentWeekStart]);

  const maxDaily = Math.max(...weekData.dailyData.map(d => d.total), 1);

  const formatDateRange = (start: Date) => {
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return `${start.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} - ${end.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financeiro</h1>
        <div className="flex items-center gap-2 bg-white rounded-full px-2 py-1 shadow-sm border border-gray-100">
          <button onClick={() => changeWeek('prev')} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronLeft size={20} className="text-gray-500" />
          </button>
          <span className="text-sm font-medium text-gray-600 min-w-[100px] text-center">
            {formatDateRange(currentWeekStart)}
          </span>
          <button onClick={() => changeWeek('next')} className="p-1 hover:bg-gray-100 rounded-full">
            <ChevronRight size={20} className="text-gray-500" />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center p-8">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="space-y-4 animate-fade-in">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-green-50 p-4 rounded-2xl border border-green-100 flex flex-col justify-between h-32">
              <div className="p-2 bg-green-100 w-fit rounded-lg text-green-600">
                <DollarSign size={20} />
              </div>
              <div>
                <p className="text-sm text-green-700 font-medium">Recebido</p>
                <p className="text-2xl font-bold text-green-800">R$ {weekData.paidTotal.toFixed(2)}</p>
              </div>
            </div>

            <div className="bg-yellow-50 p-4 rounded-2xl border border-yellow-100 flex flex-col justify-between h-32">
              <div className="p-2 bg-yellow-100 w-fit rounded-lg text-yellow-600">
                <Wallet size={20} />
              </div>
              <div>
                <p className="text-sm text-yellow-700 font-medium">A Receber</p>
                <p className="text-2xl font-bold text-yellow-800">R$ {weekData.pendingTotal.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="bg-brand-50 p-4 rounded-2xl border border-brand-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-brand-100 rounded-lg text-brand-600">
                <TrendingUp size={20} />
              </div>
              <div>
                <p className="text-sm text-brand-700 font-medium">Total da Semana</p>
                <p className="text-xl font-bold text-brand-800">R$ {weekData.total.toFixed(2)}</p>
              </div>
            </div>
            <div className="text-right">
              <span className="text-xs text-brand-600 font-medium block">Atendimentos</span>
              <span className="text-2xl font-bold text-brand-800">{weekData.filtered.length}</span>
            </div>
          </div>

          {/* Weekly Chart */}
          <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-semibold text-gray-700 mb-4">Desempenho Diário</h3>
            <div className="flex justify-between items-end h-40">
              {weekData.dailyData.map((day, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2 w-full group">
                   <div className="relative w-full flex justify-center h-full items-end">
                      <div 
                        className={`w-2/3 rounded-t-md transition-all duration-500 ${day.isToday ? 'bg-brand-500' : 'bg-brand-200 group-hover:bg-brand-300'}`}
                        style={{ height: `${(day.total / maxDaily) * 100}%`, minHeight: '4px' }}
                      ></div>
                      {day.total > 0 && (
                        <div className="absolute -top-8 bg-gray-800 text-white text-[10px] py-1 px-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                          R$ {day.total.toFixed(0)}
                        </div>
                      )}
                   </div>
                   <div className="text-center">
                     <span className={`block text-[10px] font-bold ${day.isToday ? 'text-brand-600' : 'text-gray-500'}`}>{day.dayName}</span>
                     <span className="block text-[10px] text-gray-400">{day.date}</span>
                   </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinanceView;