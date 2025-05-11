import React from 'react';
import Knob from '../controls/Knob';
import Toggle from '../controls/Toggle';
import InfoTooltip from '../InfoTooltip';
import type { AdvancedFilterSettingsProps } from './types';
import './AdvancedFilterSettings.css';

/**
 * Component for advanced filter settings (envelope amount, key tracking, drive)
 */
const AdvancedFilterSettings: React.FC<AdvancedFilterSettingsProps> = ({
  envAmount,
  keyTracking,
  drive,
  onEnvAmountChange,
  onKeyTrackingChange,
  onDriveChange
}) => {
  return (
    <div id="advanced-filter-controls" className="advanced-filter-settings">
      <h4>Advanced Filter Settings</h4>
      <div className="advanced-controls-grid">
        <div className="control-container">
          <Knob
            label="Env Amount"
            min={-100}
            max={100}
            step={1}
            value={envAmount}
            onChange={onEnvAmountChange}
            formatValue={(val) => val.toString()}
            unit="%"
          />
          <InfoTooltip text="Controls how much the envelope affects the filter cutoff. Positive values increase the cutoff, negative values decrease it." />
        </div>
        
        <div className="key-tracking-container">
          <div className="key-tracking-label">
            Key Tracking
            <InfoTooltip text="When enabled, the filter cutoff will follow the note pitch. Higher notes will have a higher cutoff frequency." />
          </div>
          <Toggle 
            label="" 
            value={keyTracking} 
            onChange={onKeyTrackingChange} 
          />
        </div>
        
        <div className="control-container">
          <Knob
            label="Drive"
            min={0}
            max={100}
            step={1}
            value={drive}
            onChange={onDriveChange}
            formatValue={(val) => val.toString()}
            unit="%"
          />
          <InfoTooltip text="Adds overdrive distortion to the filter for a more aggressive sound. Higher values result in more saturation and harmonics." />
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilterSettings;
