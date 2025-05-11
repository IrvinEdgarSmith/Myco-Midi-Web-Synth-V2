import React, { useState } from 'react';
import PhaseContainer from './PhaseContainer';
import Knob from './controls/Knob';
import Toggle from './controls/Toggle';
import './SoundGeneration.css';

// A simple SVG icon for the advanced toggle
const AdvancedToggleIcon: React.FC<{ isOpen: boolean }> = ({ isOpen }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d={isOpen ? "M18 12H6" : "M12 6V18M6 12H18"} stroke="var(--text-color)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SoundGeneration: React.FC = () => {
  const [selectedOsc, setSelectedOsc] = useState(1);
  const [oscEnabled, setOscEnabled] = useState(true);
  const [waveform, setWaveform] = useState('Saw');
  const [coarseTune, setCoarseTune] = useState(6);
  const [fineTune, setFineTune] = useState(0);
  const [level, setLevel] = useState(0.5);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showTuningAndLevel, setShowTuningAndLevel] = useState(true);

  // New state for advanced controls
  const [pulseWidth, setPulseWidth] = useState(0.5);
  const [supersawDetune, setSupersawDetune] = useState(0.25);
  const [supersawMix, setSupersawMix] = useState(0.5);

  const waveforms = ['Sine', 'Square', 'Saw', 'Triangle', 'Noise'];

  const renderAdvancedControls = () => {
    if (!showAdvanced) return null;

    let advancedContent = null;    if (waveform === 'Square') {
      advancedContent = (
        <Knob
          label="Pulse Width"
          min={0.01} max={0.99} step={0.01}
          value={pulseWidth}
          onChange={setPulseWidth}
          formatValue={(val) => (val * 100).toFixed(0)}
          unit="%"
        />
      );
    } else if (waveform === 'Saw') {
      advancedContent = (
        <>
          <Knob
            label="Supersaw Detune"
            min={0} max={1} step={0.01}
            value={supersawDetune}
            onChange={setSupersawDetune}
            formatValue={(val) => (val * 100).toFixed(0)}
            unit="%"
          />
          <Knob
            label="Supersaw Mix"
            min={0} max={1} step={0.01}
            value={supersawMix}
            onChange={setSupersawMix}
            formatValue={(val) => (val * 100).toFixed(0)}
            unit="%"
          />
        </>
      );
    } else {
      // Placeholder for other waveforms or if no specific controls
      advancedContent = (
        <p className="advanced-placeholder-text">
          No advanced controls specific to {waveform} waveform.
        </p>
      );
    }

    return (
      <div className="advanced-osc-settings">
        <h4>Advanced Settings (OSC {selectedOsc} - {waveform})</h4>
        {advancedContent}
      </div>
    );
  };

  const enableToggleControl = (
    <Toggle
      label="Enable OSC"
      value={oscEnabled}
      onChange={setOscEnabled}
    />
  );

  return (
    <PhaseContainer title="Sound Generation" headerControl={enableToggleControl}>
      <div className="sound-gen-content">        <div className="osc-selector">
          {[1, 2, 3].map((n) => (
            <button
              key={n}
              className={`osc-btn ${selectedOsc === n ? 'active' : ''}`}
              onClick={() => setSelectedOsc(n)}
              aria-pressed={selectedOsc === n}
              title={`Select Oscillator ${n}`}
            >
              OSC {n}
            </button>
          ))}
        </div>
        
        <div className="control-label waveform-title">Waveform</div>

        {oscEnabled && (
          <div className="osc-control-panel">
            <div className="waveform-selector">
              <div className="waveform-buttons">
                {waveforms.map((wf) => (
                  <button
                    key={wf}
                    className={`waveform-btn ${waveform === wf ? 'active' : ''}`}
                    onClick={() => setWaveform(wf)}
                    aria-pressed={waveform === wf}
                    title={`Select ${wf} waveform`}
                  >
                    {wf}
                  </button>
                ))}
              </div>
            </div>

            {/* Tuning and Level Section */}
            <div className="tuning-level-section">
              <button
                className="section-toggle-btn"
                onClick={() => setShowTuningAndLevel(!showTuningAndLevel)}
                aria-expanded={showTuningAndLevel}
              >
                Tuning and Level
                <span className={`toggle-arrow ${showTuningAndLevel ? 'open' : ''}`}>▼</span>
              </button>
              {showTuningAndLevel && (                <div className="collapsible-controls">
                  <Knob
                    label="Coarse Tune"
                    min={-24} max={24} step={1}
                    value={coarseTune}
                    onChange={setCoarseTune}
                    unit="st"
                    formatValue={(val) => val.toString()}
                  />
                  <Knob
                    label="Fine Tune"
                    min={-100} max={100} step={1}
                    value={fineTune}
                    onChange={setFineTune}
                    unit="cents"
                    formatValue={(val) => val.toString()}
                  />
                  <Knob
                    label="Level"
                    min={0} max={1} step={0.01}
                    value={level}
                    onChange={setLevel}
                    formatValue={(val) => (val * 100).toFixed(0)}
                    unit="%"
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {oscEnabled && renderAdvancedControls()}
      </div>

      {oscEnabled && (
        <button
          className="advanced-section-toggle"
          onClick={() => setShowAdvanced(!showAdvanced)}
          aria-expanded={showAdvanced}
          title={showAdvanced ? 'Hide Advanced Settings' : 'Show Advanced Settings'}
        >
          <AdvancedToggleIcon isOpen={showAdvanced} />
          <span>{showAdvanced ? 'Hide Advanced' : 'Show Advanced'}</span>
        </button>
      )}
    </PhaseContainer>
  );
};

export default SoundGeneration;
