import React, { useEffect, useRef } from 'react';

interface FilterAudioPreviewProps {
  filterType: string;
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
      
      // Set filter properties based on props
      filter.type = filterType.toLowerCase() as BiquadFilterType;
      filter.frequency.value = cutoff;
      filter.Q.value = resonance * 20; // Scale resonance
      
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
  }, [isPlaying, filterType]);
  
  // Update filter parameters when they change
  useEffect(() => {
    const filter = filterRef.current;
    if (!filter) return;
    
    // Update filter parameters
    filter.frequency.value = cutoff;
    filter.Q.value = resonance * 20; // Scale resonance
    
    // Map filter type
    const filterTypeMap: { [key: string]: BiquadFilterType } = {
      'LowPass': 'lowpass',
      'HighPass': 'highpass',
      'BandPass': 'bandpass',
      'Notch': 'notch'
    };
    
    // Set the filter type
    filter.type = filterTypeMap[filterType] || 'lowpass';
  }, [cutoff, resonance, filterType]);
  
  // No actual UI is rendered
  return null;
};

export default FilterAudioPreview;
