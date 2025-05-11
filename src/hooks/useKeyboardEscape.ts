import { useEffect } from 'react';

interface UseKeyboardEscapeOptions {
  isActive: boolean;
  onEscape: () => void;
}

/**
 * Hook that listens for the Escape key and calls the provided callback when pressed
 */
export const useKeyboardEscape = ({ isActive, onEscape }: UseKeyboardEscapeOptions): void => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Stop audio preview on Escape key
      if (e.key === 'Escape' && isActive) {
        onEscape();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isActive, onEscape]);
};

export default useKeyboardEscape;
