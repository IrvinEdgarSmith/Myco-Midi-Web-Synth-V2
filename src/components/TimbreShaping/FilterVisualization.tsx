import React from 'react';
import FilterResponse from '../controls/FilterResponse';
import type { FilterVisualizationProps } from './types';
import './FilterVisualization.css';

/**
 * Component that displays the filter response visualization
 */
const FilterVisualization: React.FC<FilterVisualizationProps> = ({
  filterType,
  cutoff,
  resonance,
  width = 500, // Increased from 350
  height = 150 // Increased from 70
}) => {
  return (
    <div className="filter-response-container">
      <FilterResponse 
        filterType={filterType}
        cutoff={cutoff}
        resonance={resonance}
        width={width}
        height={height}
      />
    </div>
  );
};

export default FilterVisualization;
