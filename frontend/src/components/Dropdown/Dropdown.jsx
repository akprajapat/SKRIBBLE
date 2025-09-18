import React, { useState, useRef } from 'react';
import useOutsideClick from './useOutsideClick';
import './Dropdown.css';

function Dropdown ({ label, options, onSelect, defaultValue }){
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const dropdownRef = useRef(null);

  const handleSelect = (option) => {
    setSelected(option);
    onSelect(option);
    setIsOpen(false);
  };

  useOutsideClick(dropdownRef, () => setIsOpen(false));

  return (
    <div className="dropdown-container" ref={dropdownRef}>
      <label className="dropdown-label">{label  }</label>
      <button className="dropdown-toggle" onClick={() => setIsOpen(!isOpen)}>
        {selected || defaultValue || 'Select an option'}
        <span className="arrow">   &#x25BC;</span>

      {isOpen && (
        <div className="dropdown-menu">
          {options.map((option) => (
            <div
              id={option}
              key={option}
              className="dropdown-item"
              onClick={() => handleSelect(option)}
            >
              {option}
            </div>
          ))}
        </div>
      )}
      </button>
    </div>
  );
};

export default Dropdown;