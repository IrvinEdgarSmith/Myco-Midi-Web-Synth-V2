import React from 'react';

interface AdvancedToggleIconProps {
  isOpen: boolean;
  width?: number;
  height?: number;
  strokeWidth?: number;
}

/**
 * Icon that shows plus/minus state for an expandable section
 */
const AdvancedToggleIcon: React.FC<AdvancedToggleIconProps> = ({ 
  isOpen, 
  width = 20, 
  height = 20,
  strokeWidth = 2
}) => (
  <svg 
    width={width} 
    height={height} 
    viewBox="0 0 24 24" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg"
  >
    <path 
      d={isOpen ? "M18 12H6" : "M12 6V18M6 12H18"} 
      stroke="var(--text-color)" 
      strokeWidth={strokeWidth} 
      strokeLinecap="round" 
      strokeLinejoin="round"
    />
  </svg>
);

export default AdvancedToggleIcon;