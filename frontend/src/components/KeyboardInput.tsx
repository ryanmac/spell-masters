// src/components/KeyboardInput.tsx
import React, { useEffect, useState } from 'react';
import { FaBackspace } from "react-icons/fa";

const KeyboardInput: React.FC<{
  onSubmit: (answer: string) => void;
  disabled: boolean;
}> = ({ onSubmit, disabled }) => {
  const [input, setInput] = useState('');
  const keys = [
    'qwertyuiop'.split(''),
    'asdfghjkl'.split(''),
    ['Enter', ...'zxcvbnm'.split(''), 'Backspace']
  ];

  const handleKeyClick = (key: string) => {
    if (disabled) return;
    if (key === 'Enter') {
      onSubmit(input);
      setInput('');
    } else if (key === 'Backspace') {
      setInput(prev => prev.slice(0, -1));
    } else {
      setInput(prev => prev + key);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleClear = () => {
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSubmit(input);
      setInput('');
    } else if (e.key === 'Backspace') {
      setInput(prev => prev.slice(0, -1));
    } else if (e.key.length === 1) {
      setInput(prev => prev + e.key);
    }
  };

  return (
    <div className="mb-4">
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          className="w-full p-2 mb-2 text-lg font-semibold rounded bg-white text-black"
          disabled={disabled}
        />
        <button
          onClick={handleClear}
          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
          disabled={disabled}
        >
          Clear
        </button>
      </div>
      <div>
        {keys.map((row, rowIndex) => (
          <div key={rowIndex} className="flex justify-center mb-2">
            {row.map(key => (
              <button
                key={key}
                onClick={() => handleKeyClick(key)}
                disabled={disabled}
                className={`px-3 py-2 m-1 text-lg font-semibold rounded ${
                  disabled ? 'bg-gray-400' : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                {key === 'Backspace' ? <FaBackspace /> : key}
              </button>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default KeyboardInput;