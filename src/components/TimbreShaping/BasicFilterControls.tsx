import React from 'react';
import Slider from '../controls/Slider';
import InfoTooltip from '../InfoTooltip';
import type { BasicFilterControlsProps } from './types';
import './BasicFilterControls.css';

/**
 * Component for controlling basic filter parameters (cutoff and resonance)
 */
const BasicFilterControls: React.FC<BasicFilterControlsProps> = ({
  cutoff,
  resonance,
  onCutoffChange,
  onResonanceChange,
  formatCutoffValue
}) => {
  return (
    <div className="basic-filter-controls">
      <div className="control-container">
        <Slider
          label="Cutoff"
          min={0}
          max={100}
          step={1}          value={cutoff}
          onChange={onCutoffChange}
          formatValue={formatCutoffValue}
          unit="Hz"
          fillColor="#AEEA00"
        />
        <InfoTooltip text="Sets the cutoff frequency for the filter (20Hz-20kHz). The effect depends on the selected filter type." />
      </div>
      <div className="control-container">
        <Slider
          label="Resonance"
          min={0}
          max={1}
          step={0.01}
          value={resonance}
          onChange={onResonanceChange}
          formatValue={(val) => (val * 100).toFixed(0)}
          unit="%"
          fillColor="#AEEA00"
        />
        <InfoTooltip text="Controls the emphasis of frequencies around the cutoff point. Higher values create a more pronounced effect and can lead to self-oscillation." />
      </div>
    </div>
  );
};

export default BasicFilterControls;
