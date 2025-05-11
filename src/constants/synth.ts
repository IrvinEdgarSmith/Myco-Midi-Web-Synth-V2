import type { OscillatorType } from '../engine/types';

/**
 * Available filter types for the synth's filter module
 */
export type FilterTypeLabel = 'LowPass' | 'HighPass' | 'BandPass' | 'Notch';

/**
 * List of all available filter types
 */
export const FILTER_TYPES: FilterTypeLabel[] = ['LowPass', 'HighPass', 'BandPass', 'Notch'];

/**
 * List of all available waveform types for oscillators
 */
export const WAVEFORM_TYPES: OscillatorType[] = ['sine', 'square', 'sawtooth', 'triangle'];