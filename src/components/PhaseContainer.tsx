import React, { useState, ReactNode } from 'react';
import './PhaseContainer.css';

interface PhaseContainerProps {
  title: string;
  children?: ReactNode;
}

const PhaseContainer: React.FC<PhaseContainerProps> = ({ title, children }) => {
  const [showAdvanced, setShowAdvanced] = useState(false);
  return (
    <section className="phase-container">
      <header className="phase-header">
        <h2 className="phase-title">{title}</h2>
        <button
          className="advanced-toggle"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          {showAdvanced ? 'Hide Advanced' : 'Show Advanced'}
        </button>
      </header>
      <div className="phase-body">
        {children || <div className="placeholder">{title} controls</div>}
        {showAdvanced && (
          <div className="advanced-section">
            {title} advanced controls
          </div>
        )}
      </div>
    </section>
  );
};

export default PhaseContainer;
