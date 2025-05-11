import React, { useState } from 'react';
import PhaseContainer from '../PhaseContainer';
import FilterAudioPreview from '../audio/FilterAudioPreview';
import { FILTER_TYPES, WAVEFORM_TYPES } from '../../constants/synth';
import { useAudioVerifier } from '../../hooks/useAudioVerifier';
import { useKeyboardEscape } from '../../hooks/useKeyboardEscape';
import { useFilterPreview } from '../../hooks/useFilterPreview';
import { mapFrequencyToPercent, mapPercentToFrequency } from '../../utils/audio';
import AdvancedToggleIcon from '../icons/AdvancedToggleIcon';
import FilterTypeSelector from './FilterTypeSelector';
import BasicFilterControls from './BasicFilterControls';
import FilterVisualization from './FilterVisualization';
import WaveformSelector from './WaveformSelector';
import FilterPreviewButton from './FilterPreviewButton';
import AdvancedFilterSettings from './AdvancedFilterSettings';
import type { FilterTypeLabel } from '../../constants/synth';
import type { OscillatorType } from '../../engine/types';
import './TimbreShaping.css';

/**
 * TimbreShaping component for controlling the synth's filter parameters
 */
const TimbreShaping: React.FC = () => {
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
  
  // Preview oscillator settings
  const [previewWaveform, setPreviewWaveform] = useState<OscillatorType>('sawtooth');
  const [previewFrequency, setPreviewFrequency] = useState<number>(220);
  
  // Use custom hooks
  const { 
    isPlaying: isPreviewPlaying, 
    audioPreviewRef, 
    buttonRef, 
    togglePlayback: handlePreviewToggle 
  } = useFilterPreview();
    // Verify audio output when playback starts
  useAudioVerifier(isPreviewPlaying);
  
  // Enable keyboard escape to stop audio
  useKeyboardEscape({ 
    isActive: isPreviewPlaying, 
    onEscape: handlePreviewToggle 
  });
  
  // Handler for cutoff changes with logarithmic mapping
  const handleCutoffChange = (percent: number): void => {
    setCutoff(mapPercentToFrequency(percent));
  };
  
  // Format cutoff value for display
  const formatCutoff = (percent: number): string => {
    const freq = mapPercentToFrequency(percent);
    return freq < 1000 ? freq.toFixed(0) : (freq / 1000).toFixed(1) + "k";
  };

  return (
    <PhaseContainer title="Timbre Shaping">
      <div className="timbre-shaping-content">
        {/* Filter Type Selector */}
        <FilterTypeSelector
          filterType={filterType}
          onFilterTypeChange={setFilterType}
          filterTypes={FILTER_TYPES}
        />
          {/* Main filter controls layout */}
        <div className="filter-main-controls">
          {/* Basic filter controls */}
          <BasicFilterControls
            cutoff={mapFrequencyToPercent(cutoff)}
            resonance={resonance}
            onCutoffChange={handleCutoffChange}
            onResonanceChange={setResonance}
            formatCutoffValue={formatCutoff}
          />

          {/* Filter visualization and audio preview */}
          <div className="filter-visualization-wrapper">
            <div className="filter-visualization">
              <FilterVisualization
                filterType={filterType}
                cutoff={cutoff}
                resonance={resonance}
              />
              <FilterPreviewButton
                isPlaying={isPreviewPlaying}
                buttonRef={buttonRef}
                onClick={handlePreviewToggle}
              />
            </div>

            {/* Waveform and frequency control */}
            <WaveformSelector
              waveform={previewWaveform}
              frequency={previewFrequency}
              onWaveformChange={setPreviewWaveform}
              onFrequencyChange={setPreviewFrequency}
              waveformTypes={WAVEFORM_TYPES}
            />

            {/* Audio Preview Component - No visible UI */}
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
          <AdvancedFilterSettings
            envAmount={envAmount}
            keyTracking={keyTracking}
            drive={drive}
            onEnvAmountChange={setEnvAmount}
            onKeyTrackingChange={setKeyTracking}
            onDriveChange={setDrive}
          />
        )}
      </div>
    </PhaseContainer>
  );
};

export default TimbreShaping;
