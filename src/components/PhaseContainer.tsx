import React, { type ReactNode } from 'react'; // Corrected type import
import './PhaseContainer.css';

interface PhaseContainerProps {
  title: string;
  headerControl?: ReactNode; // Prop for custom controls in the header
  children?: ReactNode;
}

const PhaseContainer: React.FC<PhaseContainerProps> = ({
  title,
  headerControl,
  children,
}) => {
  return (
    <section className="phase-container">
      <header className="phase-header">
        <h2 className="phase-title">{title}</h2>
        {headerControl && <div className="header-custom-control">{headerControl}</div>}
      </header>
      <div className="phase-body">
        {children || <div className="placeholder">{title} controls</div>}
      </div>
    </section>
  );
};

export default PhaseContainer;
