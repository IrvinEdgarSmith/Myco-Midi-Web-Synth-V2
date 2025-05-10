import React from 'react';
import PhaseContainer from './PhaseContainer';
import './CentralWorkspace.css';

const CentralWorkspace: React.FC = () => {
  return (
    <main className="central-workspace">
      <PhaseContainer title="Abstract Audio Visualizer">
        <div className="visualizer-placeholder">Visualizer Canvas</div>
      </PhaseContainer>

      <PhaseContainer title="Global Spectrum Display">
        <div className="spectrum-placeholder">Spectrum Canvas</div>
      </PhaseContainer>

      <PhaseContainer title="MIDI Inputs & Mapping">
        <div className="midi-mapping-placeholder">MIDI Mapping Panel</div>
      </PhaseContainer>

      <PhaseContainer title="Modulation Matrix Access">
        <button className="open-matrix-btn">Open Modulation Matrix</button>
      </PhaseContainer>

      <PhaseContainer title="Global Controls & Effects">
        <div className="global-controls-placeholder">Controls & Preset Browser</div>
      </PhaseContainer>

      <PhaseContainer title="Global Amplitude Envelope">
        <div className="env-placeholder">Global ADSR Envelope</div>
      </PhaseContainer>
    </main>
  );
};

export default CentralWorkspace;
