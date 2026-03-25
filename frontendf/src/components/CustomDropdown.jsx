import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

const CustomDropdown = ({ options, defaultValue, onChange, width = '200px' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(defaultValue || options[0]);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    setSelected(option);
    setIsOpen(false);
    if (onChange) onChange(option);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', 
          padding: '0.6rem 1rem', 
          borderRadius: '8px', 
          border: '1px solid #e2e8f0', 
          background: '#fff', 
          fontSize: '0.95rem',
          color: '#1e293b',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          cursor: 'pointer',
          outline: 'none',
          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
          fontWeight: 500
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selected}</span>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown size={18} color="#64748b" />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              top: '100%',
              left: 0,
              right: 0,
              marginTop: '0.5rem',
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '0.5rem',
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)',
              zIndex: 50,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.25rem'
            }}
          >
            {options.map((option, idx) => (
              <div
                key={idx}
                onClick={() => handleSelect(option)}
                style={{
                  padding: '0.5rem 0.75rem',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: selected === option ? '#eff6ff' : 'transparent',
                  color: selected === option ? '#2563eb' : '#475569',
                  fontWeight: selected === option ? 600 : 500,
                  transition: 'background 0.15s ease',
                  fontSize: '0.9rem'
                }}
                onMouseEnter={(e) => {
                  if (selected !== option) e.currentTarget.style.background = '#f8fafc';
                }}
                onMouseLeave={(e) => {
                  if (selected !== option) e.currentTarget.style.background = 'transparent';
                }}
              >
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{option}</span>
                {selected === option && <Check size={16} color="#2563eb" style={{ flexShrink: 0 }} />}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CustomDropdown;
