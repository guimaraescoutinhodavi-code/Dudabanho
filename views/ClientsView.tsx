import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Client } from '../types';
import { Plus, Phone, User, PawPrint, Search, Trash2, Loader2 } from 'lucide-react';

const ClientsView: React.FC = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    pet_name: '',
    notes: ''
  });

  const fetchClients = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('clients').select('*').order('name');
    if (error) {
      console.error("Erro ao buscar clientes:", error);
    } else if (data) {
      setClients(data as Client[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;
    setSubmitting(true);

    try {
      // Create explicit payload to ensure clean data
      const newClient = {
        name: formData.name,
        phone: formData.phone || null,
        pet_name: formData.pet_name || null,
        notes: formData.notes || null
      };

      const { data, error } = await supabase.from('clients').insert([newClient]).select();

      if (error) throw error;

      if (data) {
        setClients(prev => [...prev, data[0] as Client].sort((a,b) => a.name.localeCompare(b.name)));
        setShowForm(false);
        setFormData({ name: '', phone: '', pet_name: '', notes: '' });
      }
    } catch (error: any) {
      console.error("Erro ao adicionar cliente:", error);
      alert(`Erro ao salvar: ${error.message || "Verifique sua conexão ou se a tabela possui todas as colunas."}`);
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if(!confirm('Excluir cliente?')) return;
    
    // Optimistic update
    const previousClients = [...clients];
    setClients(prev => prev.filter(c => c.id !== id));

    const { error } = await supabase.from('clients').delete().eq('id', id);
    if (error) {
      alert("Erro ao excluir cliente.");
      setClients(previousClients); // Revert
    }
  }

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (c.pet_name && c.pet_name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="pb-20 pt-4 px-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Clientes</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-brand-500 text-white p-2 rounded-full shadow-lg hover:bg-brand-600 transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input 
          type="text"
          placeholder="Buscar cliente ou pet..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 border border-brand-100">
           <h2 className="text-lg font-semibold mb-3 text-brand-600">Novo Cadastro</h2>
           <form onSubmit={handleSubmit} className="space-y-3">
             <div>
               <label className="block text-xs font-medium text-gray-500 mb-1">Nome do Cliente *</label>
               <input 
                type="text"
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
               />
             </div>
             <div>
               <label className="block text-xs font-medium text-gray-500 mb-1">Telefone / WhatsApp</label>
               <input 
                type="tel"
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
               />
             </div>
             <div>
               <label className="block text-xs font-medium text-gray-500 mb-1">Nome do Pet</label>
               <input 
                type="text"
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none"
                value={formData.pet_name}
                onChange={e => setFormData({...formData, pet_name: e.target.value})}
                placeholder="Opcional"
               />
             </div>
             <div>
               <label className="block text-xs font-medium text-gray-500 mb-1">Observações</label>
               <textarea 
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none text-sm"
                rows={2}
                value={formData.notes}
                onChange={e => setFormData({...formData, notes: e.target.value})}
               />
             </div>
             <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 text-gray-500 bg-gray-100 rounded-lg">Cancelar</button>
              <button 
                type="submit" 
                disabled={submitting}
                className="flex-1 py-2 bg-brand-500 text-white rounded-lg font-medium flex items-center justify-center gap-2"
              >
                {submitting ? <Loader2 className="animate-spin" size={18} /> : 'Salvar'}
              </button>
            </div>
           </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredClients.map(client => (
            <div key={client.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
               <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="h-10 w-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-500 shrink-0">
                      <User size={20} />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-800">{client.name}</h3>
                      {client.pet_name && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <PawPrint size={12} />
                          <span>{client.pet_name}</span>
                        </div>
                      )}
                      {client.phone && (
                        <div className="flex items-center gap-1 text-xs text-brand-600 mt-1">
                          <Phone size={10} />
                          <a href={`tel:${client.phone}`}>{client.phone}</a>
                        </div>
                      )}
                    </div>
                  </div>
                  <button onClick={() => handleDelete(client.id)} className="text-gray-300 hover:text-red-400">
                    <Trash2 size={16} />
                  </button>
               </div>
               {client.notes && (
                 <div className="mt-3 text-xs text-gray-400 bg-gray-50 p-2 rounded">
                   {client.notes}
                 </div>
               )}
            </div>
          ))}
          {filteredClients.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-sm">
              Nenhum cliente encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ClientsView;