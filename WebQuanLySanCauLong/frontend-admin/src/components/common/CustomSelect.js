import React, { useState, useRef, useEffect } from 'react';

export default function CustomSelect({ options, value, onChange, placeholder = "Chọn..." }) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedOpt = options.find(o => o.value === value) || options[0];

  const renderIcon = (iconStr) => {
    if (!iconStr) return null;
    if (iconStr.startsWith('http') || iconStr.startsWith('/') || iconStr.startsWith('data:image')) {
      return <img src={iconStr} alt="icon" className="w-5 h-5 object-contain rounded-sm" />;
    }
    return <span className="text-base">{iconStr}</span>;
  };

  return (
    <div className="relative" ref={containerRef} style={{ minWidth: '160px' }}>
      <div 
        className="flex items-center justify-between px-3 py-2 border border-slate-200 rounded-lg bg-white cursor-pointer hover:bg-slate-50 transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {selectedOpt && renderIcon(selectedOpt.icon)}
          <span className="text-sm font-medium text-slate-700">{selectedOpt ? selectedOpt.label : placeholder}</span>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-auto py-1">
          {options.map((opt) => (
            <div 
              key={opt.value}
              className={`flex items-center gap-2 px-3 py-2 cursor-pointer transition ${opt.value === value ? 'bg-blue-50 text-blue-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'}`}
              onClick={() => {
                onChange({ target: { value: opt.value } });
                setIsOpen(false);
              }}
            >
              {renderIcon(opt.icon)}
              <span className="text-sm">{opt.label}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
