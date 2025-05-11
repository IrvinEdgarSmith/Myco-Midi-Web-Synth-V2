import React from 'react';
import type { FilterPreviewButtonProps } from './types';
import './FilterPreviewButton.css';

/**
 * Component for toggling filter audio preview playback
 */
const FilterPreviewButton: React.FC<FilterPreviewButtonProps> = ({
  isPlaying,
  buttonRef,
  onClick
}) => {
  return (
    <button 
      ref={buttonRef}
      className={`filter-preview-button ${isPlaying ? 'playing' : ''}`}
      onClick={onClick}
      aria-pressed={isPlaying}
      aria-label={`${isPlaying ? 'Stop' : 'Play'} filter audio preview`}
      title={`${isPlaying ? 'Stop' : 'Play'} filter audio preview (Press Escape to stop)`}
    >
      {isPlaying ? 'Stop' : 'Hear Filter'}
    </button>
  );
};

export default FilterPreviewButton;
