import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Appointment } from '../types';
import { Plus, CheckCircle, Circle, Trash2, Calendar as CalendarIcon, Scissors, DollarSign } from 'lucide-react';

const AppointmentsView: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    client_name: '',
    pet_name: '',
    service: 'Banho',
    price: '',
    date: new Date().toISOString().slice(0, 16),
  });

  const fetchAppointments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('appointments')
      .select('*')
      .order('date', { ascending: true });
    
    if (!error && data) {
      setAppointments(data as Appointment[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const togglePaid = async (id: string, currentStatus: boolean) => {
    // Optimistic update
    setAppointments(prev => prev.map(a => a.id === id ? { ...a, is_paid: !currentStatus } : a));

    const { error } = await supabase
      .from('appointments')
      .update({ is_paid: !currentStatus })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating payment', error);
      fetchAppointments(); // Revert on error
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Excluir agendamento?')) return;
    
    setAppointments(prev => prev.filter(a => a.id !== id));
    await supabase.from('appointments').delete().eq('id', id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.client_name || !formData.pet_name) return;

    const newAppointment = {
      client_name: formData.client_name,
      pet_name: formData.pet_name,
      service: formData.service,
      price: parseFloat(formData.price) || 0,
      date: formData.date,
      is_paid: false
    };

    const { data, error } = await supabase.from('appointments').insert([newAppointment]).select();

    if (!error && data) {
      setAppointments(prev => [...prev, data[0] as Appointment].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
      setShowForm(false);
      setFormData({
        client_name: '',
        pet_name: '',
        service: 'Banho',
        price: '',
        date: new Date().toISOString().slice(0, 16),
      });
    }
  };

  return (
    <div className="pb-20 pt-4 px-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Agenda</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-500 text-white p-2 rounded-full shadow-lg hover:bg-brand-600 transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 border border-brand-100 animate-fade-in">
          <h2 className="text-lg font-semibold mb-3 text-brand-600">Novo Agendamento</h2>
          <form onSubmit={handleSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Cliente</label>
              <input 
                type="text" 
                placeholder="Nome do Dono"
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={formData.client_name}
                onChange={e => setFormData({...formData, client_name: e.target.value})}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Pet</label>
              <input 
                type="text" 
                placeholder="Nome do Pet"
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={formData.pet_name}
                onChange={e => setFormData({...formData, pet_name: e.target.value})}
                required
              />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Serviço</label>
                <select 
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
                  value={formData.service}
                  onChange={e => setFormData({...formData, service: e.target.value})}
                >
                  <option>Banho</option>
                  <option>Tosa</option>
                  <option>Banho e Tosa</option>
                  <option>Tosa Higiênica</option>
                  <option>Corte de Unha</option>
                </select>
              </div>
              <div className="w-1/3">
                 <label className="block text-xs font-medium text-gray-500 mb-1">Valor</label>
                 <input 
                  type="number" 
                  placeholder="0.00"
                  className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Data e Hora</label>
              <input 
                type="datetime-local" 
                className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                value={formData.date}
                onChange={e => setFormData({...formData, date: e.target.value})}
                required
              />
            </div>
            <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 text-gray-500 bg-gray-100 rounded-lg">Cancelar</button>
              <button type="submit" className="flex-1 py-2 bg-brand-500 text-white rounded-lg font-medium">Salvar</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : appointments.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <p>Nenhum agendamento encontrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {appointments.map(apt => (
            <div key={apt.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    {apt.pet_name} 
                    <span className="text-xs font-normal text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {apt.client_name}
                    </span>
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mt-1 gap-1">
                    <CalendarIcon size={14} />
                    {new Date(apt.date).toLocaleDateString('pt-BR')} às {new Date(apt.date).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}
                  </div>
                  <div className="flex items-center text-sm text-brand-600 mt-1 gap-1 font-medium">
                    <Scissors size={14} />
                    {apt.service}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                   <span className="font-bold text-gray-700">R$ {apt.price.toFixed(2)}</span>
                   <button onClick={() => handleDelete(apt.id)} className="text-red-300 hover:text-red-500 p-1">
                     <Trash2 size={16} />
                   </button>
                </div>
              </div>
              
              <div className="border-t border-gray-50 pt-2 flex justify-between items-center">
                 <button 
                  onClick={() => togglePaid(apt.id, apt.is_paid)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                    apt.is_paid 
                      ? 'bg-green-50 text-green-700 border border-green-200' 
                      : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                  }`}
                 >
                   {apt.is_paid ? <CheckCircle size={16} /> : <Circle size={16} />}
                   {apt.is_paid ? 'Pago' : 'Pendente'}
                 </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AppointmentsView;