import type { OscillatorType } from '../../engine/types';
import type { FilterTypeLabel } from '../../constants/synth';

export interface FilterTypeSelectorProps {
  filterType: FilterTypeLabel;
  onFilterTypeChange: (type: FilterTypeLabel) => void;
  filterTypes: FilterTypeLabel[];
}

export interface BasicFilterControlsProps {
  cutoff: number;
  resonance: number;
  onCutoffChange: (cutoff: number) => void;
  onResonanceChange: (resonance: number) => void;
  formatCutoffValue: (cutoff: number) => string;
}

export interface FilterVisualizationProps {
  filterType: FilterTypeLabel;
  cutoff: number;
  resonance: number;
  width?: number;
  height?: number;
}

export interface WaveformSelectorProps {
  waveform: OscillatorType;
  frequency: number;
  onWaveformChange: (waveform: OscillatorType) => void;
  onFrequencyChange: (frequency: number) => void;
  waveformTypes: OscillatorType[];
}

export interface FilterPreviewButtonProps {
  isPlaying: boolean;
  buttonRef: React.RefObject<HTMLButtonElement>;
  onClick: () => void;
}

export interface AdvancedFilterSettingsProps {
  envAmount: number;
  keyTracking: boolean;
  drive: number;
  onEnvAmountChange: (amount: number) => void;
  onKeyTrackingChange: (enabled: boolean) => void;
  onDriveChange: (drive: number) => void;
}
