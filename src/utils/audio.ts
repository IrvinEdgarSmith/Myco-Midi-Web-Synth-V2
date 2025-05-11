/**
 * Utility functions for audio processing and parameter conversion
 */

/**
 * Convert a frequency (20-20000 Hz) to a percentage (0-100)
 * Using a logarithmic scale to better match human hearing
 */
export const mapFrequencyToPercent = (freq: number): number => {
  const minFreq = 20;
  const maxFreq = 20000;
  const minLog = Math.log(minFreq);
  const maxLog = Math.log(maxFreq);
  const scale = (maxLog - minLog) / 100;
  
  return Math.max(0, Math.min(100, (Math.log(freq) - minLog) / scale));
};

/**
 * Convert a percentage (0-100) back to frequency (20-20000 Hz)
 */
export const mapPercentToFrequency = (percent: number): number => {
  const minFreq = 20;
  const maxFreq = 20000;
  const minLog = Math.log(minFreq);
  const maxLog = Math.log(maxFreq);
  const scale = (maxLog - minLog) / 100;
  
  return Math.round(Math.exp(minLog + scale * percent));
};