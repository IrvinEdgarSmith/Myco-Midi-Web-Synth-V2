import React from 'react';
import './Toggle.css';

interface ToggleProps {
  label?: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

const Toggle: React.FC<ToggleProps> = ({ label, value, onChange }) => {
  return (
    <label className="toggle-container">
      {label && <span className="toggle-label">{label}</span>}
      <input
        type="checkbox"
        className="toggle-input"
        checked={value}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="toggle-slider" />
    </label>
  );
};

export default Toggle;
