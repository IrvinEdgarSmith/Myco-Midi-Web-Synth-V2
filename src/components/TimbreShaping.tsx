import React, { useState, useEffect, useRef } from 'react';
import PhaseContainer from './PhaseContainer';
import Knob from './controls/Knob';
import Slider from './controls/Slider';
import Toggle from './controls/Toggle';
import FilterResponse from './controls/FilterResponse';
import InfoTooltip from './InfoTooltip';
import FilterAudioPreview from './audio/FilterAudioPreview';
import type { FilterAudioPreviewHandle } from './audio/FilterAudioPreview';
import type { OscillatorType } from '../engine/types';
// Define filterType literal type matching preview and response
type FilterTypeLabel = 'LowPass' | 'HighPass' | 'BandPass' | 'Notch';
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

// Array of available waveform types
const waveformTypes: OscillatorType[] = ['sine', 'square', 'sawtooth', 'triangle'];

// A simple SVG icon for the advanced toggle
const AdvancedToggleIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d={isOpen ? "M18 12H6" : "M12 6V18M6 12H18"} stroke="var(--text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// WaveformIcon component to display visual representations of each waveform
const WaveformIcon: React.FC<{ type: OscillatorType }> = ({ type }) => {
  // Simple SVG paths representing each waveform shape
  const paths: Record<OscillatorType, string> = {
    sine: "M2,10 C2,8 4,6 8,10 C12,14 14,12 14,10 C14,8 12,6 8,10 C4,14 2,12 2,10",
    square: "M2,5 L2,15 L8,15 L8,5 L14,5 L14,15",
    sawtooth: "M2,15 L8,5 L8,15 L14,5",
    triangle: "M2,15 L6,5 L10,15 L14,5",
    custom: "M2,10 L4,7 L6,13 L8,7 L10,13 L12,7 L14,10" // Custom/wavetable representation
  };
    return (
    <svg width="22" height="22" viewBox="0 0 16 20" className="waveform-icon">
      <path d={paths[type]} stroke="currentColor" fill="none" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
};

// Add a simple audio checker to verify sound output
const useAudioOutputVerifier = (isPlaying: boolean) => {
  useEffect(() => {
    if (isPlaying) {
      // Create a simple verification tone that plays for just 100ms
      // This helps confirm the audio system is actually working
      try {
        const verifierContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const verifierOsc = verifierContext.createOscillator();
        const verifierGain = verifierContext.createGain();
        
        // Set to a high frequency that won't interfere much with main audio
        verifierOsc.frequency.value = 5000;
        
        // Very quiet, just for verification
        verifierGain.gain.value = 0.02;
        
        // Connect and start
        verifierOsc.connect(verifierGain);
        verifierGain.connect(verifierContext.destination);
        verifierOsc.start();
        
        // Stop after 100ms
        setTimeout(() => {
          verifierOsc.stop();
          setTimeout(() => {
            verifierContext.close();
          }, 100);
        }, 100);
        
        console.log('Audio verification tone played');
      } catch (e) {
        console.error('Audio verification failed:', e);
      }
    }
  }, [isPlaying]);
};

const TimbreShaping: React.FC = () => {
  // Reference to filter audio preview component
  const audioPreviewRef = useRef<FilterAudioPreviewHandle>(null);
  // Reference to play button
  const buttonRef = useRef<HTMLButtonElement>(null);
  
  // Filter type state
  const [filterType, setFilterType] = useState<FilterTypeLabel>('LowPass');

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
  // Preview oscillator settings
  const [previewWaveform, setPreviewWaveform] = useState<OscillatorType>('sawtooth');
  const [previewFrequency, setPreviewFrequency] = useState<number>(220);
  
  // Verify audio output when playback starts
  useAudioOutputVerifier(isPreviewPlaying);
  
  // Array of available filter types
  const filterTypes: FilterTypeLabel[] = ['LowPass', 'HighPass', 'BandPass', 'Notch'];  // Handler to toggle playback and ensure AudioContext is resumed
  const handlePreviewToggle = async () => {
    console.log('TimbreShaping: handlePreviewToggle called, current isPlaying:', isPreviewPlaying);
    
    // Immediately try to resume AudioContext on direct user interaction
    // This is critical for browsers that require user gesture to start audio
    try {
      let audioCtx = (window as any).myAudioContext;
      if (!audioCtx) {
        // Create a new AudioContext if one doesn't exist yet
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        (window as any).myAudioContext = audioCtx;
        console.log('TimbreShaping: Created new AudioContext, state:', audioCtx.state);
      }
      
      console.log('TimbreShaping: Direct interaction - attempting immediate resume:', audioCtx.state);
      await audioCtx.resume();
      console.log('TimbreShaping: After immediate resume:', audioCtx.state);
    } catch (e) {
      console.error('TimbreShaping: Direct resume failed:', e);
    }
    
    // Toggle the playing state
    const newPlayingState = !isPreviewPlaying;
    
    try {
      // If starting playback, first ensure AudioContext is resumed
      if (newPlayingState && audioPreviewRef.current) {
        console.log('TimbreShaping: Attempting to resume AudioContext');
        await audioPreviewRef.current.resumeAudioContext();
        console.log('TimbreShaping: AudioContext resumed successfully');
      }
      
      // Update the state after AudioContext is successfully resumed
      console.log('TimbreShaping: Setting isPreviewPlaying to', newPlayingState);
      setIsPreviewPlaying(newPlayingState);
      
      // Ensure the button is properly styled by forcing a focus
      if (buttonRef.current) {
        buttonRef.current.blur();
        buttonRef.current.focus();
      }
    } catch (error) {
      console.error('TimbreShaping: Error toggling playback:', error);
    }
  };
  
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
  
  // Use audio output verifier
  useAudioOutputVerifier(isPreviewPlaying);
  
  return (
    <PhaseContainer title="Timbre Shaping">
      <div className="timbre-shaping-content">
        {/* Filter Type Selector - More compact */}
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
        
        {/* New layout combining controls and visualization side by side on desktop */}
        <div className="filter-main-controls">
          {/* Basic filter controls - using sliders instead of knobs */}
          <div className="basic-filter-controls">
            <div className="control-container">              <Slider
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
                onChange={setResonance}
                formatValue={(val) => (val * 100).toFixed(0)}
                unit="%"
                fillColor="#AEEA00"
              />
              <InfoTooltip text="Controls the emphasis of frequencies around the cutoff point. Higher values create a more pronounced effect and can lead to self-oscillation." />
            </div>
          </div>
            {/* Filter Response Visualization */}
          <div className="filter-visualization">            <FilterResponse 
              filterType={filterType}
              cutoff={cutoff}
              resonance={resonance}
              width={350}
              height={70}
            />            {/* Preview Oscillator Controls */}
            <div className="preview-controls">
              <div className="control-container">                <div className="control-label waveform-heading">
                  Waveform
                  <InfoTooltip text="Select the oscillator waveform shape. Each shape has a different harmonic content which affects how the filter sounds." />
                </div>
                <div className="waveform-selector">
                  {waveformTypes.map((type) => (
                    <button
                      key={type}
                      className={`waveform-btn ${previewWaveform === type ? 'active' : ''}`}
                      onClick={() => setPreviewWaveform(type)}
                      aria-pressed={previewWaveform === type}
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
                value={previewFrequency}
                onChange={setPreviewFrequency}
                formatValue={(val) => `${val} Hz`}
                unit="Hz"
              />
            </div>            <button 
              ref={buttonRef}
              className={`filter-preview-button ${isPreviewPlaying ? 'playing' : ''}`}
              onClick={handlePreviewToggle}
              aria-pressed={isPreviewPlaying}
              aria-label={`${isPreviewPlaying ? 'Stop' : 'Play'} filter audio preview`}
              title={`${isPreviewPlaying ? 'Stop' : 'Play'} filter audio preview (Press Escape to stop)`}
            >
              {isPreviewPlaying ? 'Stop' : 'Hear Filter'}
            </button>
            
            {/* Audio Preview Component with ref */}
            <FilterAudioPreview 
              ref={audioPreviewRef}
              filterType={filterType}
              cutoff={cutoff}
              resonance={resonance}
              isPlaying={isPreviewPlaying}
              waveform={previewWaveform}
              frequency={previewFrequency}
            />
          </div>
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
          </div>        )}
      </div>
    </PhaseContainer>
  );
};

export default TimbreShaping;