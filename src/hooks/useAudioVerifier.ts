import { useEffect } from 'react';

/**
 * A hook that plays a brief, quiet tone when audio playback starts
 * to verify that the audio system is working properly
 */
export const useAudioVerifier = (isPlaying: boolean): void => {
  useEffect(() => {
    if (isPlaying) {
      // Create a simple verification tone that plays for just 100ms
      // This helps confirm the audio system is actually working
      try {
        const verifierContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const verifierOsc = verifierContext.createOscillator();
        const verifierGain = verifierContext.createGain();
        
        // Set to a high frequency that won't interfere much with main audio
        verifierOsc.frequency.value = 5000;
        
        // Very quiet, just for verification
        verifierGain.gain.value = 0.02;
        
        // Connect and start
        verifierOsc.connect(verifierGain);
        verifierGain.connect(verifierContext.destination);
        verifierOsc.start();
        
        // Stop after 100ms
        setTimeout(() => {
          verifierOsc.stop();
          setTimeout(() => {
            verifierContext.close();
          }, 100);
        }, 100);
        
        console.log('Audio verification tone played');
      } catch (e) {
        console.error('Audio verification failed:', e);
      }
    }
  }, [isPlaying]);
};

export default useAudioVerifier;