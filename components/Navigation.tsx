import React from 'react';
import { Calendar, Users, Package, DollarSign, Calculator } from 'lucide-react';
import { ViewState } from '../types';

interface NavigationProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentView, onChangeView }) => {
  const navItemClass = (view: ViewState) => 
    `flex flex-col items-center justify-center w-full py-3 transition-colors duration-200 ${
      currentView === view ? 'text-brand-600 font-medium' : 'text-gray-400 hover:text-gray-600'
    }`;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 pb-safe z-50">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        <button 
          onClick={() => onChangeView(ViewState.APPOINTMENTS)} 
          className={navItemClass(ViewState.APPOINTMENTS)}
        >
          <Calendar size={22} strokeWidth={currentView === ViewState.APPOINTMENTS ? 2.5 : 2} />
          <span className="text-[10px] mt-1">Agenda</span>
        </button>

        <button 
          onClick={() => onChangeView(ViewState.CLIENTS)} 
          className={navItemClass(ViewState.CLIENTS)}
        >
          <Users size={22} strokeWidth={currentView === ViewState.CLIENTS ? 2.5 : 2} />
          <span className="text-[10px] mt-1">Clientes</span>
        </button>

        <button 
          onClick={() => onChangeView(ViewState.STOCK)} 
          className={navItemClass(ViewState.STOCK)}
        >
          <Package size={22} strokeWidth={currentView === ViewState.STOCK ? 2.5 : 2} />
          <span className="text-[10px] mt-1">Estoque</span>
        </button>

        <button 
          onClick={() => onChangeView(ViewState.FINANCE)} 
          className={navItemClass(ViewState.FINANCE)}
        >
          <DollarSign size={22} strokeWidth={currentView === ViewState.FINANCE ? 2.5 : 2} />
          <span className="text-[10px] mt-1">Caixa</span>
        </button>

        <button 
          onClick={() => onChangeView(ViewState.CALCULATOR)} 
          className={navItemClass(ViewState.CALCULATOR)}
        >
          <Calculator size={22} strokeWidth={currentView === ViewState.CALCULATOR ? 2.5 : 2} />
          <span className="text-[10px] mt-1">Calc</span>
        </button>
      </div>
    </div>
  );
};

export default Navigation;