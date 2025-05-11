import React from 'react';
import type { OscillatorType } from '../../engine/types';

interface WaveformIconProps {
  type: OscillatorType;
  width?: number;
  height?: number;
  strokeWidth?: number;
  className?: string;
}

/**
 * Visual representation of different oscillator waveform types
 */
const WaveformIcon: React.FC<WaveformIconProps> = ({ 
  type, 
  width = 22, 
  height = 22, 
  strokeWidth = 1.8,
  className = "waveform-icon"
}) => {
  // SVG paths representing each waveform shape
  const paths: Record<OscillatorType, string> = {
    sine: "M2,10 C2,8 4,6 8,10 C12,14 14,12 14,10 C14,8 12,6 8,10 C4,14 2,12 2,10",
    square: "M2,5 L2,15 L8,15 L8,5 L14,5 L14,15",
    sawtooth: "M2,15 L8,5 L8,15 L14,5",
    triangle: "M2,15 L6,5 L10,15 L14,5",
    custom: "M2,10 L4,7 L6,13 L8,7 L10,13 L12,7 L14,10" // Custom/wavetable representation
  };
  
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox="0 0 16 20" 
      className={className}
    >
      <path 
        d={paths[type]} 
        stroke="currentColor" 
        fill="none" 
        strokeWidth={strokeWidth} 
        strokeLinejoin="round" 
      />
    </svg>
  );
};

export default WaveformIcon;