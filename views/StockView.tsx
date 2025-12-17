import React, { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { Product } from '../types';
import { Plus, Minus, Trash2, Package, Search } from 'lucide-react';

const StockView: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    quantity: 1,
    price: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('name');
    if (!error && data) setProducts(data as Product[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const updateQuantity = async (id: string, current: number, change: number) => {
    const newQty = Math.max(0, current + change);
    setProducts(prev => prev.map(p => p.id === id ? { ...p, quantity: newQty } : p));
    
    await supabase.from('products').update({ quantity: newQty }).eq('id', id);
  };

  const deleteProduct = async (id: string) => {
    if(!confirm('Remover produto do estoque?')) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    await supabase.from('products').delete().eq('id', id);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    const newProduct = {
      name: formData.name,
      quantity: formData.quantity,
      price: parseFloat(formData.price) || 0
    };

    const { data, error } = await supabase.from('products').insert([newProduct]).select();

    if (!error && data) {
      setProducts(prev => [...prev, data[0] as Product].sort((a,b) => a.name.localeCompare(b.name)));
      setShowForm(false);
      setFormData({ name: '', quantity: 1, price: '' });
    }
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="pb-20 pt-4 px-4 max-w-md mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Estoque</h1>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-secondary-500 text-white p-2 rounded-full shadow-lg hover:bg-secondary-600 transition-colors"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
        <input 
          type="text"
          placeholder="Buscar produtos..."
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary-500 bg-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {showForm && (
        <div className="bg-white p-4 rounded-xl shadow-md mb-6 border border-secondary-100">
           <h2 className="text-lg font-semibold mb-3 text-secondary-600">Novo Produto</h2>
           <form onSubmit={handleSubmit} className="space-y-3">
             <div>
               <label className="block text-xs font-medium text-gray-500 mb-1">Nome do Produto</label>
               <input 
                type="text"
                className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary-500 outline-none"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
               />
             </div>
             <div className="flex gap-2">
                <div className="flex-1">
                   <label className="block text-xs font-medium text-gray-500 mb-1">Quantidade Inicial</label>
                   <input 
                    type="number"
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary-500 outline-none"
                    value={formData.quantity}
                    onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 0})}
                   />
                </div>
                <div className="flex-1">
                   <label className="block text-xs font-medium text-gray-500 mb-1">Preço Unit.</label>
                   <input 
                    type="number"
                    placeholder="0.00"
                    className="w-full p-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-secondary-500 outline-none"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                   />
                </div>
             </div>
             <div className="flex gap-2 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="flex-1 py-2 text-gray-500 bg-gray-100 rounded-lg">Cancelar</button>
              <button type="submit" className="flex-1 py-2 bg-secondary-500 text-white rounded-lg font-medium">Adicionar</button>
            </div>
           </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center p-8">
           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-secondary-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {filteredProducts.map(p => (
            <div key={p.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg ${p.quantity === 0 ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-500'}`}>
                  <Package size={20} />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">{p.name}</h3>
                  <p className="text-xs text-gray-500">R$ {p.price.toFixed(2)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
                  <button 
                    onClick={() => updateQuantity(p.id, p.quantity, -1)}
                    className="p-2 hover:bg-gray-100 active:bg-gray-200 text-gray-600"
                  >
                    <Minus size={14} />
                  </button>
                  <span className={`w-8 text-center font-medium text-sm ${p.quantity < 5 ? 'text-red-500' : 'text-gray-700'}`}>
                    {p.quantity}
                  </span>
                  <button 
                    onClick={() => updateQuantity(p.id, p.quantity, 1)}
                    className="p-2 hover:bg-gray-100 active:bg-gray-200 text-gray-600"
                  >
                    <Plus size={14} />
                  </button>
                </div>
                <button onClick={() => deleteProduct(p.id)} className="text-gray-300 hover:text-red-500 p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
          {filteredProducts.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              Nenhum produto encontrado.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StockView;