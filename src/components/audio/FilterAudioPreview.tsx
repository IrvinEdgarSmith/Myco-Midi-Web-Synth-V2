import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';
import type { OscillatorType } from '../../engine/types';

// Define the allowed filter type labels and a mapping to Web Audio filter types
// Map UI filter labels to Web Audio filter types
const FILTER_TYPE_MAP: Record<string, BiquadFilterType> = {
  LowPass: 'lowpass',
  HighPass: 'highpass',
  BandPass: 'bandpass',
  Notch: 'notch'
};

// Define the ref handle type that will be exposed to parent components
export interface FilterAudioPreviewHandle {
  resumeAudioContext: () => Promise<void>;
}

interface FilterAudioPreviewProps {
  filterType: string;
  cutoff: number;
  resonance: number;
  isPlaying: boolean;
  waveform?: OscillatorType;       // e.g., 'sine', 'square', 'sawtooth', 'triangle'
  frequency?: number;              // Base oscillator frequency in Hz
}

const FilterAudioPreview = forwardRef<FilterAudioPreviewHandle, FilterAudioPreviewProps>(({
  filterType,
  cutoff,
  resonance,
  isPlaying,
  waveform = 'sawtooth',
  frequency = 220,
}, ref) => {
  // Audio context reference
  const audioContextRef = useRef<AudioContext | null>(null);
  // References for audio nodes
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
    // Expose methods to parent component via ref
  useImperativeHandle(ref, () => ({
    resumeAudioContext: async () => {
      if (!audioContextRef.current) {
        console.log('FilterAudioPreview: Creating new AudioContext for resume');
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }

      if (audioContextRef.current.state !== 'running') {
        console.log('FilterAudioPreview: manually resuming AudioContext, current state:', audioContextRef.current.state);
        try {
          await audioContextRef.current.resume();
          console.log('FilterAudioPreview: AudioContext state after resume:', audioContextRef.current.state);
        } catch (error) {
          console.error('FilterAudioPreview: Failed to resume AudioContext:', error);
          throw error; // Re-throw to allow caller to handle error
        }
      } else {
        console.log('FilterAudioPreview: AudioContext already running');
      }
    }
  }));
    // Initialize the audio context when component mounts
  useEffect(() => {
    // Only create it once
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Store the audio context in the window object for debugging
      (window as any).myAudioContext = audioContextRef.current;
      console.log('FilterAudioPreview: AudioContext created, state:', audioContextRef.current.state);
    }
    
    return () => {
      // Clean up when component unmounts
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        console.log('FilterAudioPreview: Closing AudioContext on unmount');
        audioContextRef.current.close();
        audioContextRef.current = null;
        (window as any).myAudioContext = null;
      }
    };
  }, []);
    // Handle audio playback/stop
  useEffect(() => {
    console.log('FilterAudioPreview: isPlaying effect triggered ->', isPlaying);
    
    // Clean up function to stop and disconnect audio nodes
    const cleanupAudio = () => {
      const oscillator = oscillatorRef.current;
      const filter = filterRef.current;
      const gain = gainRef.current;
      
      if (oscillator) {
        console.log('FilterAudioPreview: stopping oscillator');
        try {
          oscillator.stop();
          oscillator.disconnect();
        } catch (e) {
          console.warn('FilterAudioPreview: Error stopping oscillator:', e);
        }
        oscillatorRef.current = null;
      }
      
      if (filter) {
        filter.disconnect();
        filterRef.current = null;
      }
      
      if (gain) {
        gain.disconnect();
        gainRef.current = null;
      }
      console.log('FilterAudioPreview: nodes disconnected');
    };
    
    // Don't proceed if isPlaying is false - just clean up any existing nodes
    if (!isPlaying) {
      cleanupAudio();
      return;
    }
    
    // Get or create the audio context
    if (!audioContextRef.current) {
      console.log('FilterAudioPreview: creating new AudioContext');
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    
    const audioContext = audioContextRef.current;
    console.log('FilterAudioPreview: audioContext state before setup:', audioContext.state);
    
    // We need to ensure the context is running before starting audio
    const setupAudio = async () => {
      try {
        // Resume the audio context if needed
        if (audioContext.state !== 'running') {
          console.log('FilterAudioPreview: Resuming AudioContext before starting nodes');
          await audioContext.resume();
          console.log('FilterAudioPreview: AudioContext state after resume:', audioContext.state);
        }
        
        // Clean up any existing nodes first
        cleanupAudio();
        
        console.log('FilterAudioPreview: starting nodes with', { 
          waveform, frequency, filterType, cutoff, resonance 
        });
        
        // Set initial filter parameters based on props
        const filterNode = audioContext.createBiquadFilter();
        filterNode.type = FILTER_TYPE_MAP[filterType] ?? 'lowpass';
        filterNode.frequency.value = cutoff;
        filterNode.Q.value = resonance * 20;

        // Create the audio nodes
        const oscillator = audioContext.createOscillator();
        const gain = audioContext.createGain();
        
        // Set oscillator properties
        oscillator.type = waveform;
        oscillator.frequency.value = frequency;
        
        // Set gain to avoid clipping
        gain.gain.value = 0.2;
        
        // Connect the audio nodes
        oscillator.connect(filterNode);
        filterNode.connect(gain);
        gain.connect(audioContext.destination);
        
        // Store references
        oscillatorRef.current = oscillator;
        filterRef.current = filterNode;
        gainRef.current = gain;
        
        // Start the oscillator AFTER all connections are made
        oscillator.start();
        console.log('FilterAudioPreview: oscillator started successfully');
      } catch (error) {
        console.error('FilterAudioPreview: Error setting up audio:', error);
        // Clean up any partially created nodes
        cleanupAudio();
      }
    };
    
    // Setup audio nodes
    setupAudio();
    
    // Return cleanup function for when component unmounts or isPlaying changes
    return cleanupAudio;
  }, [isPlaying, filterType, cutoff, resonance, waveform, frequency]);
  // Update filter parameters when they change
  useEffect(() => {
    const filter = filterRef.current;
    if (!filter || !isPlaying) return;
    
    console.log('FilterAudioPreview: Updating filter parameters:', { cutoff, resonance, filterType });
    
    // Update filter parameters
    filter.frequency.setValueAtTime(cutoff, audioContextRef.current?.currentTime || 0);
    filter.Q.setValueAtTime(resonance * 20, audioContextRef.current?.currentTime || 0); // Scale resonance
    
    // Set the filter type - Fallback to 'lowpass' if unknown
    filter.type = FILTER_TYPE_MAP[filterType] ?? 'lowpass';
  }, [cutoff, resonance, filterType, isPlaying]);
  
  // Update oscillator parameters when they change
  useEffect(() => {
    const oscillator = oscillatorRef.current;
    if (!oscillator || !isPlaying) return; // Only update if playing and oscillator exists
    
    // Update oscillator parameters
    // Check if the value actually changed to avoid unnecessary re-assignments
    if (oscillator.frequency.value !== frequency) {
      console.log(`FilterAudioPreview: updating oscillator frequency to ${frequency}`);
      oscillator.frequency.setValueAtTime(frequency, audioContextRef.current?.currentTime || 0);
    }
    if (oscillator.type !== waveform) {
      console.log(`FilterAudioPreview: updating oscillator waveform to ${waveform}`);
      oscillator.type = waveform;
    }
  }, [frequency, waveform, isPlaying]); // Add isPlaying to dependencies

  // No actual UI is rendered
  return null;
});

export default FilterAudioPreview;
