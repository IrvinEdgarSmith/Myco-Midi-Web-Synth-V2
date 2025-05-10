import React, { useState } from 'react';
import PhaseContainer from './PhaseContainer';
import Toggle from './controls/Toggle';
import SoundGeneration from './SoundGeneration';
import './Sidebar.css';

interface SidebarProps {
  variant: 'subtractive' | 'additive';
}

const Sidebar: React.FC<SidebarProps> = ({ variant }) => {
  // master on/off state for subtractive variant
  const [masterOn, setMasterOn] = useState(true);

  const containers =
    variant === 'subtractive'
      ? [
          'Sound Generation',
          'Timbre Shaping',
          'Modulation',
          'Amplitude Envelope',
          'Local Spectrum Display',
          'Unison & Tuning',
        ]
      : [
          'Sound Generation',
          'Timbre Shaping',
          'Spectral Shaping',
          'Modulation',
          'Deep Edit (Partials)',
          'Local Spectrum Display',
          'Amplitude Envelope',
        ];

  return (
    <aside className={`sidebar ${variant}`}>  
      {variant === 'subtractive' && (
        <div className="sidebar-header">
          <h2 className="sidebar-title">Subtractive Synthesizer</h2>
          <Toggle label="Master On/Off" value={masterOn} onChange={setMasterOn} />
        </div>
      )}
      
      <div className="sidebar-content">
        {containers.map((title) => {
          if (variant === 'subtractive' && title === 'Sound Generation') {
            return <SoundGeneration key={title} />;
          }
          return <PhaseContainer key={title} title={title} />;
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
