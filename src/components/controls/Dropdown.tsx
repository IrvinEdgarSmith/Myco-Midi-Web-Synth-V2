import React from 'react';
import './Dropdown.css';

interface DropdownProps {
  label?: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
}

const Dropdown: React.FC<DropdownProps> = ({ label, options, value, onChange }) => {
  return (
    <div className="dropdown-container">
      {label && <label className="dropdown-label">{label}</label>}
      <select
        className="dropdown"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;
