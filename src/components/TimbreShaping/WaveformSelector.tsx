import React from 'react';
import Slider from '../controls/Slider';
import InfoTooltip from '../InfoTooltip';
import WaveformIcon from '../icons/WaveformIcon';
import type { WaveformSelectorProps } from './types';
import './WaveformSelector.css';

/**
 * Component for selecting oscillator waveform and frequency
 */
const WaveformSelector: React.FC<WaveformSelectorProps> = ({
  waveform,
  frequency,
  onWaveformChange,
  onFrequencyChange,
  waveformTypes
}) => {
  return (
    <div className="preview-controls">
      <div className="control-container">
        <div className="control-label waveform-heading">
          Waveform
          <InfoTooltip text="Select the oscillator waveform shape. Each shape has a different harmonic content which affects how the filter sounds." />
        </div>
        <div className="waveform-selector">
          {waveformTypes.map((type) => (
            <button
              key={type}
              className={`waveform-btn ${waveform === type ? 'active' : ''}`}
              onClick={() => onWaveformChange(type)}
              aria-pressed={waveform === type}
              title={`Select ${type} waveform`}
            >
              <WaveformIcon type={type} />
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <Slider
        label="Frequency"
        min={20}
        max={2000}
        step={1}
        value={frequency}
        onChange={onFrequencyChange}
        formatValue={(val) => `${val} Hz`}
        unit="Hz"
      />
    </div>
  );
};

export default WaveformSelector;
