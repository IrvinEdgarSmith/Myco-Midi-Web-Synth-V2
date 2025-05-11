import React from 'react';
import InfoTooltip from '../InfoTooltip';
import type { FilterTypeSelectorProps } from './types';
import './FilterTypeSelector.css';

/**
 * Component for selecting filter type from a set of options
 */
const FilterTypeSelector: React.FC<FilterTypeSelectorProps> = ({ 
  filterType, 
  onFilterTypeChange,
  filterTypes 
}) => {
  return (
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
            onClick={() => onFilterTypeChange(type)}
            aria-pressed={filterType === type}
            title={`Select ${type} filter`}
          >
            {type}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterTypeSelector;
