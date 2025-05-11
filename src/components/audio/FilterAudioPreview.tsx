import React, { useEffect, useRef } from 'react';

// Define the allowed filter type labels and a mapping to Web Audio filter types
type FilterTypeLabel = 'LowPass' | 'HighPass' | 'BandPass' | 'Notch';
const FILTER_TYPE_MAP: Record<FilterTypeLabel, BiquadFilterType> = {
  LowPass: 'lowpass',
  HighPass: 'highpass',
  BandPass: 'bandpass',
  Notch: 'notch'
};

interface FilterAudioPreviewProps {
  filterType: FilterTypeLabel;
  cutoff: number;
  resonance: number;
  isPlaying: boolean;
}

const FilterAudioPreview: React.FC<FilterAudioPreviewProps> = ({
  filterType,
  cutoff,
  resonance,
  isPlaying
}) => {
  // Audio context reference
  const audioContextRef = useRef<AudioContext | null>(null);
  // References for audio nodes
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  
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
      oscillator.type = 'sawtooth'; // Rich harmonic content to hear filter effect
      oscillator.frequency.value = 220; // A3
      
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
};

export default FilterAudioPreview;
