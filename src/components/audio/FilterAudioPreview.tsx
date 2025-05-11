import React, { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import type { OscillatorType } from '../../engine/types';

// Define the allowed filter type labels and a mapping to Web Audio filter types
type FilterTypeLabel = 'LowPass' | 'HighPass' | 'BandPass' | 'Notch';
const FILTER_TYPE_MAP: Record<FilterTypeLabel, BiquadFilterType> = {
  LowPass: 'lowpass',
  HighPass: 'highpass',
  BandPass: 'bandpass',
  Notch: 'notch'
};

// Export the interface for the component ref
export interface FilterAudioPreviewHandle {
  resumeAudioContext: () => Promise<void>;
}

interface FilterAudioPreviewProps {
  filterType: FilterTypeLabel;
  cutoff: number;
  resonance: number;
  isPlaying: boolean;
  waveform?: OscillatorType;
  frequency?: number;
}

const FilterAudioPreview = forwardRef<FilterAudioPreviewHandle, FilterAudioPreviewProps>(({
  filterType,
  cutoff,
  resonance,
  isPlaying,
  waveform = 'sawtooth',
  frequency = 220
}, ref) => {
  // Audio context reference
  const audioContextRef = useRef<AudioContext | null>(null);
  // References for audio nodes
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  
  // Expose methods to parent components via ref
  useImperativeHandle(ref, () => ({
    resumeAudioContext: async () => {
      if (audioContextRef.current && audioContextRef.current.state !== 'running') {
        await audioContextRef.current.resume();
      }
    }
  }));
  
  // Initialize the audio context when component mounts
  useEffect(() => {
    // Only create it once
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    return () => {
      // Clean up when component unmounts
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);
  
  // Handle audio playback/stop
  useEffect(() => {
    const audioContext = audioContextRef.current;
    if (!audioContext) return;
    
    if (isPlaying) {
      // Create the audio nodes
      const oscillator = audioContext.createOscillator();
      const filter = audioContext.createBiquadFilter();
      const gain = audioContext.createGain();
        // Set oscillator properties
      oscillator.type = waveform; // Use the waveform type from props
      oscillator.frequency.value = frequency; // Use the frequency from props
      
      // Set gain to avoid clipping
      gain.gain.value = 0.2;
      
      // Connect the audio nodes
      oscillator.connect(filter);
      filter.connect(gain);
      gain.connect(audioContext.destination);
      
      // Start the oscillator
      oscillator.start();
      
      // Store references
      oscillatorRef.current = oscillator;
      filterRef.current = filter;
      gainRef.current = gain;
      
      return () => {
        // Stop and disconnect when effect changes or isPlaying becomes false
        oscillator.stop();
        oscillator.disconnect();
        filter.disconnect();
        gain.disconnect();
      };
    }
  }, [isPlaying]);
  
  // Update filter parameters when they change
  useEffect(() => {
    const filter = filterRef.current;
    if (!filter) return;
    
    // Update filter parameters
    filter.frequency.value = cutoff;
    filter.Q.value = resonance * 20; // Scale resonance
    
    // Set the filter type
    filter.type = FILTER_TYPE_MAP[filterType] || 'lowpass';
  }, [cutoff, resonance, filterType]);
    // No actual UI is rendered
  return null;
});

export default FilterAudioPreview;
