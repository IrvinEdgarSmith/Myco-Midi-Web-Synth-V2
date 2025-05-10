import React, { useState, useEffect } from 'react';
import PhaseContainer from './PhaseContainer';
import Knob from './controls/Knob';
import Toggle from './controls/Toggle';
import FilterResponse from './controls/FilterResponse';
import InfoTooltip from './InfoTooltip';
import FilterAudioPreview from './audio/FilterAudioPreview';
import './TimbreShaping.css';

// Utility functions for logarithmic mapping of frequency
const mapFrequencyToPercent = (freq: number): number => {
  // Convert a frequency (20-20000 Hz) to a percentage (0-100)
  // Using a logarithmic scale to better match human hearing
  const minFreq = 20;
  const maxFreq = 20000;
  const minLog = Math.log(minFreq);
  const maxLog = Math.log(maxFreq);
  const scale = (maxLog - minLog) / 100;
  
  return Math.max(0, Math.min(100, (Math.log(freq) - minLog) / scale));
};

const mapPercentToFrequency = (percent: number): number => {
  // Convert a percentage (0-100) back to frequency (20-20000 Hz)
  const minFreq = 20;
  const maxFreq = 20000;
  const minLog = Math.log(minFreq);
  const maxLog = Math.log(maxFreq);
  const scale = (maxLog - minLog) / 100;
  
  return Math.round(Math.exp(minLog + scale * percent));
};

// A simple SVG icon for the advanced toggle
const AdvancedToggleIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d={isOpen ? "M18 12H6" : "M12 6V18M6 12H18"} stroke="var(--text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const TimbreShaping: React.FC = () => {
  // Filter type state
  const [filterType, setFilterType] = useState('LowPass');

  // Basic filter parameters
  const [cutoff, setCutoff] = useState(1000);
  const [resonance, setResonance] = useState(0.5);
  
  // Advanced parameters
  const [envAmount, setEnvAmount] = useState(0);
  const [keyTracking, setKeyTracking] = useState(false);
  const [drive, setDrive] = useState(0);
  
  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isPreviewPlaying, setIsPreviewPlaying] = useState(false);
  // Array of available filter types
  const filterTypes = ['LowPass', 'HighPass', 'BandPass', 'Notch'];
  
  // Effect for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Stop audio preview on Escape key
      if (e.key === 'Escape' && isPreviewPlaying) {
        setIsPreviewPlaying(false);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPreviewPlaying]);
  return (
    <PhaseContainer title="Timbre Shaping">
      <div className="timbre-shaping-content">        {/* Filter Type Selector */}
        <div className="filter-selector">
          <div className="control-label">
            Filter Type
            <InfoTooltip text="LowPass: Allows frequencies below cutoff to pass. HighPass: Allows frequencies above cutoff to pass. BandPass: Allows a range of frequencies around cutoff to pass. Notch: Blocks a range of frequencies around cutoff." />
          </div>
          <div className="filter-type-selector">
            {filterTypes.map((type) => (
              <button
                key={type}
                className={`filter-type-btn ${filterType === type ? 'active' : ''}`}
                onClick={() => setFilterType(type)}
                aria-pressed={filterType === type}
                title={`Select ${type} filter`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
          {/* Basic filter controls */}        <div className="basic-filter-controls">
          <div className="control-container">            
            <Knob
              label="Cutoff"
              min={0}
              max={100}
              step={1}
              value={mapFrequencyToPercent(cutoff)}
              onChange={(val) => setCutoff(mapPercentToFrequency(val))}
              formatValue={(val) => {
                const freq = mapPercentToFrequency(val);
                return freq < 1000 ? freq.toFixed(0) : (freq / 1000).toFixed(1) + "k"
              }}
              unit="Hz"
            />
            <InfoTooltip text="Sets the cutoff frequency for the filter (20Hz-20kHz). The effect depends on the selected filter type." />
          </div>
          <div className="control-container">
            <Knob
              label="Resonance"
              min={0}
              max={1}
              step={0.01}
              value={resonance}
              onChange={setResonance}
              formatValue={(val) => (val * 100).toFixed(0)}
              unit="%"
            />
            <InfoTooltip text="Controls the emphasis of frequencies around the cutoff point. Higher values create a more pronounced effect and can lead to self-oscillation." />
          </div>
        </div>
          {/* Filter Response Visualization */}
        <div className="filter-visualization">
          <FilterResponse 
            filterType={filterType}
            cutoff={cutoff}
            resonance={resonance}
            width={350}
            height={80}
          />          <button 
            className={`filter-preview-button ${isPreviewPlaying ? 'playing' : ''}`}
            onClick={() => setIsPreviewPlaying(!isPreviewPlaying)}
            aria-pressed={isPreviewPlaying}
            aria-label={`${isPreviewPlaying ? 'Stop' : 'Play'} filter audio preview`}
            title={`${isPreviewPlaying ? 'Stop' : 'Play'} filter audio preview (Press Escape to stop)`}
          >
            {isPreviewPlaying ? 'Stop Preview' : 'Hear Filter'}
          </button>
          
          {/* Audio Preview Component */}
          <FilterAudioPreview 
            filterType={filterType}
            cutoff={cutoff}
            resonance={resonance}
            isPlaying={isPreviewPlaying}
          />
        </div>
        
        {/* Advanced Section Toggle Button */}
        <button 
          className="advanced-section-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
          aria-expanded={showAdvanced}
          aria-controls="advanced-filter-controls"
        >
          <span>{showAdvanced ? 'Hide' : 'Show'} Advanced</span>
          <AdvancedToggleIcon isOpen={showAdvanced} />
        </button>
        
        {/* Advanced filter controls */}
        {showAdvanced && (
          <div id="advanced-filter-controls" className="advanced-filter-settings">            <h4>Advanced Filter Settings</h4>            <div className="advanced-controls-grid">
              <div className="control-container">
                <Knob
                  label="Env Amount"
                  min={-100}
                  max={100}
                  step={1}
                  value={envAmount}
                  onChange={setEnvAmount}
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
                  onChange={setKeyTracking} 
                />
              </div>
              
              <div className="control-container">
                <Knob
                  label="Drive"
                  min={0}
                  max={100}
                  step={1}
                  value={drive}
                  onChange={setDrive}
                  formatValue={(val) => val.toString()}
                  unit="%"
                />
                <InfoTooltip text="Adds overdrive distortion to the filter for a more aggressive sound. Higher values result in more saturation and harmonics." />
              </div>
            </div>
          </div>
        )}
      </div>
    </PhaseContainer>
  );
};

export default TimbreShaping;