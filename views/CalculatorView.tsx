import React, { useState } from 'react';
import { Delete } from 'lucide-react';

const CalculatorView: React.FC = () => {
  const [input, setInput] = useState('');
  const [result, setResult] = useState('');

  const handlePress = (value: string) => {
    if (result && !['+', '-', '*', '/'].includes(value)) {
      // Start fresh if typing a number after a result
      setInput(value);
      setResult('');
    } else if (result && ['+', '-', '*', '/'].includes(value)) {
      // Continue with result if typing an operator
      setInput(result + value);
      setResult('');
    } else {
      setInput((prev) => prev + value);
    }
  };

  const handleClear = () => {
    setInput('');
    setResult('');
  };

  const handleBackspace = () => {
    setInput((prev) => prev.slice(0, -1));
  };

  const handleCalculate = () => {
    try {
      // Safe evaluation for simple math
      // eslint-disable-next-line no-new-func
      const calc = new Function('return ' + input);
      const res = calc();
      
      if (!isFinite(res) || isNaN(res)) {
        setResult('Erro');
      } else {
        // Format to avoid long decimals
        setResult(String(Math.round(res * 100) / 100));
      }
    } catch (e) {
      setResult('Erro');
    }
  };

  const buttons = [
    { label: 'C', type: 'action', onClick: handleClear },
    { label: '(', type: 'operator', onClick: () => handlePress('(') },
    { label: ')', type: 'operator', onClick: () => handlePress(')') },
    { label: '÷', value: '/', type: 'operator', onClick: () => handlePress('/') },
    { label: '7', type: 'number', onClick: () => handlePress('7') },
    { label: '8', type: 'number', onClick: () => handlePress('8') },
    { label: '9', type: 'number', onClick: () => handlePress('9') },
    { label: '×', value: '*', type: 'operator', onClick: () => handlePress('*') },
    { label: '4', type: 'number', onClick: () => handlePress('4') },
    { label: '5', type: 'number', onClick: () => handlePress('5') },
    { label: '6', type: 'number', onClick: () => handlePress('6') },
    { label: '-', type: 'operator', onClick: () => handlePress('-') },
    { label: '1', type: 'number', onClick: () => handlePress('1') },
    { label: '2', type: 'number', onClick: () => handlePress('2') },
    { label: '3', type: 'number', onClick: () => handlePress('3') },
    { label: '+', type: 'operator', onClick: () => handlePress('+') },
    { label: '0', type: 'number', className: 'col-span-2', onClick: () => handlePress('0') },
    { label: '.', type: 'number', onClick: () => handlePress('.') },
    { label: '=', type: 'equal', onClick: handleCalculate },
  ];

  return (
    <div className="pb-24 pt-4 px-4 max-w-md mx-auto h-[calc(100vh-80px)] flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Calculadora</h1>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-lg border border-gray-100 p-6 flex flex-col justify-end mb-4">
        <div className="text-right space-y-2 overflow-hidden">
          <div className="text-gray-500 text-xl h-8 font-medium truncate">
            {input || '0'}
          </div>
          <div className="text-brand-600 text-5xl font-bold truncate h-14">
            {result || (input ? '' : '0')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {buttons.map((btn, idx) => (
          <button
            key={idx}
            onClick={btn.onClick}
            className={`
              h-16 rounded-2xl text-xl font-semibold transition-all active:scale-95 flex items-center justify-center shadow-sm
              ${btn.type === 'number' ? 'bg-white text-gray-700 hover:bg-gray-50' : ''}
              ${btn.type === 'operator' ? 'bg-brand-50 text-brand-600 hover:bg-brand-100' : ''}
              ${btn.type === 'action' ? 'bg-red-50 text-red-500 hover:bg-red-100' : ''}
              ${btn.type === 'equal' ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-md shadow-brand-200' : ''}
              ${btn.className || ''}
            `}
          >
            {btn.label}
          </button>
        ))}
        <button 
           onClick={handleBackspace} 
           className="h-16 rounded-2xl text-xl font-semibold transition-all active:scale-95 flex items-center justify-center shadow-sm bg-gray-100 text-gray-600 hover:bg-gray-200 absolute right-4 bottom-[29rem] w-16 opacity-0 pointer-events-none"
        >
           {/* Hidden accessible placeholder, actual backspace is below input usually but we can put it in grid if we want. Let's replace the top right or add it. */}
        </button>
        
        {/* Floating Backspace inside the display area logic or extra grid row? Let's add it to the top row in the grid for better UX */}
      </div>
       
       {/* Floating Backspace Button near display */}
       <button 
          onClick={handleBackspace}
          className="absolute top-[160px] right-8 p-2 text-gray-400 hover:text-red-400 transition-colors"
       >
          <Delete size={24} />
       </button>
    </div>
  );
};

export default CalculatorView;