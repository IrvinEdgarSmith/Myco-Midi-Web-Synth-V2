import React from 'react';
import './Knob.css';

interface KnobProps {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
}

const Knob: React.FC<KnobProps> = ({ label, min, max, step = 1, value, onChange }) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  return (
    <div className="knob-container">
      {label && <div className="knob-label">{label}</div>}
      <input
        type="range"
        className="knob"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={handleChange}
      />
      <div className="knob-value">{value}</div>
    </div>
  );
};

export default Knob;
