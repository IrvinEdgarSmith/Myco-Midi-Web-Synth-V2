import React from 'react';
import './Slider.css';

interface SliderProps {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
  unit?: string;
  fillColor?: string;
}

const Slider: React.FC<SliderProps> = ({
  label,
  min,
  max,
  step,
  value,
  onChange,
  formatValue,
  unit = '',
  fillColor = 'var(--accent-color)'
}) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(parseFloat(event.target.value));
  };

  const percentage = ((value - min) / (max - min)) * 100;
  
  return (
    <div className="slider-container">
      <div className="slider-header">
        <label className="slider-label">{label}</label>
        <div className="slider-value">
          {formatValue ? formatValue(value) : value.toString()}
          {unit && <span className="slider-unit">{unit}</span>}
        </div>
      </div>
      <div className="slider-track-container">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={handleChange}
          className="slider"
          style={{
            // Using CSS variables to style the fill dynamically
            // Will be picked up by the slider styling in CSS
            '--fill-percentage': `${percentage}%`,
            '--fill-color': fillColor
          } as React.CSSProperties}
        />
      </div>
    </div>
  );
};

export default Slider;