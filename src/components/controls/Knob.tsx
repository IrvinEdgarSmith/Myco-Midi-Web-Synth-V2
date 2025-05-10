import React from 'react';
import './Knob.css';

interface KnobProps {
  label?: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  unit?: string;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

const Knob: React.FC<KnobProps> = ({ 
  label, 
  min, 
  max, 
  step = 1, 
  value, 
  unit = '', 
  onChange,
  formatValue 
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value));
  };

  const displayValue = formatValue ? formatValue(value) : value.toString();
  
  // Create a visually pleasing display, combining value and unit if provided
  const formattedDisplay = unit ? `${displayValue} ${unit}` : displayValue;

  // Calculate fill width as percentage based on value within range
  const fillPercentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div 
      className="knob-container"
      style={{'--fill-width': `${fillPercentage}%`} as React.CSSProperties}
    >
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
      <div className="knob-value">{formattedDisplay}</div>
    </div>
  );
};

export default Knob;
