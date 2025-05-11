import { useState, useRef } from 'react';
import type { FilterAudioPreviewHandle } from '../components/audio/FilterAudioPreview';

interface UseFilterPreviewResult {
  isPlaying: boolean;
  audioPreviewRef: React.RefObject<FilterAudioPreviewHandle>;
  buttonRef: React.RefObject<HTMLButtonElement>;
  togglePlayback: () => Promise<void>;
}

/**
 * Hook for managing filter audio preview playback
 */
export const useFilterPreview = (): UseFilterPreviewResult => {
  // State and refs
  const [isPlaying, setIsPlaying] = useState(false);
  const audioPreviewRef = useRef<FilterAudioPreviewHandle>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // Handler to toggle playback and ensure AudioContext is resumed  
  const togglePlayback = async (): Promise<void> => {
    console.log('useFilterPreview: togglePlayback called, current isPlaying:', isPlaying);
    
    // Immediately try to resume AudioContext on direct user interaction
    // This is critical for browsers that require user gesture to start audio
    try {
      let audioCtx = (window as any).myAudioContext;
      if (!audioCtx) {
        // Create a new AudioContext if one doesn't exist yet
        audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
        (window as any).myAudioContext = audioCtx;
        console.log('useFilterPreview: Created new AudioContext, state:', audioCtx.state);
      }
      
      console.log('useFilterPreview: Direct interaction - attempting immediate resume:', audioCtx.state);
      await audioCtx.resume();
      console.log('useFilterPreview: After immediate resume:', audioCtx.state);
    } catch (e) {
      console.error('useFilterPreview: Direct resume failed:', e);
    }
    
    // Toggle the playing state
    const newPlayingState = !isPlaying;
    
    try {
      // If starting playback, first ensure AudioContext is resumed
      if (newPlayingState && audioPreviewRef.current) {
        console.log('useFilterPreview: Attempting to resume AudioContext');
        await audioPreviewRef.current.resumeAudioContext();
        console.log('useFilterPreview: AudioContext resumed successfully');
      }
      
      // Update the state after AudioContext is successfully resumed
      console.log('useFilterPreview: Setting isPlaying to', newPlayingState);
      setIsPlaying(newPlayingState);
      
      // Ensure the button is properly styled by forcing a focus
      if (buttonRef.current) {
        buttonRef.current.blur();
        buttonRef.current.focus();
      }
    } catch (error) {
      console.error('useFilterPreview: Error toggling playback:', error);
    }
  };

  return {
    isPlaying,
    audioPreviewRef,
    buttonRef,
    togglePlayback
  };
};

export default useFilterPreview;
