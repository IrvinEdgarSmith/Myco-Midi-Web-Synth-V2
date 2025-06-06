import React, { useRef, useEffect, useState } from 'react';
import './FilterResponse.css';

interface FilterResponseProps {
  filterType: string;
  cutoff: number;
  resonance: number;
  width?: number;
  height?: number;
}

const FilterResponse: React.FC<FilterResponseProps> = ({ 
  filterType, 
  cutoff, 
  resonance, 
  width = 500, // Default width
  height = 150  // Default height
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [animationFrame, setAnimationFrame] = useState<number | null>(null);
  
  // Function to draw the filter response visualization
  const drawFilterResponse = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Get dimensions based on container
    const containerWidth = containerRef.current?.clientWidth || width;
    // Use container width but cap it at a reasonable maximum
    const canvasWidth = Math.min(containerWidth, 800); 
    
    // Set canvas dimensions
    canvas.width = canvasWidth;
    canvas.height = height;
    
    // Cleanup on unmount
    return () => {
      resizeObserver.disconnect();
      if (animationFrame !== null) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, []);
  
  // Start/stop animation based on resonance
  useEffect(() => {
    if (resonance > 0.7) {
      // Start animation for high resonance
      let frame: number;
      const animate = () => {
        frame = requestAnimationFrame(animate);
        setAnimationFrame(frame);
        // Animation will cause the canvas to be redrawn
      };
      
      frame = requestAnimationFrame(animate);
      setAnimationFrame(frame);
      
      return () => {
        if (frame) cancelAnimationFrame(frame);
      };
    } else {
      // Stop animation if it's running
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
        setAnimationFrame(null);
      }
    }
  }, [resonance]);

  // Draw the filter response curve
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      console.error("Filter response canvas not found");
      return;
    }
    
    // Set the canvas dimensions to the calculated values
    canvas.width = actualWidth;
    canvas.height = actualHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error("Could not get 2d context for filter response canvas");
      return;
    }
    
    // Clear the canvas
    ctx.clearRect(0, 0, actualWidth, actualHeight);
    
    // Set up curve drawing styles
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#AEEA00'; // Accent color
    
    // Draw frequency spectrum axis (log scale)
    const drawFrequencyAxis = () => {
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
      ctx.lineWidth = 1;
      ctx.moveTo(0, actualHeight - 10);
      ctx.lineTo(actualWidth, actualHeight - 10);
      ctx.stroke();
      
      // Determine frequency markers based on cutoff
      // This makes the visualization more relevant to the current cutoff value
      let frequencies;
      if (cutoff < 200) {
        frequencies = [50, 100, 500];
      } else if (cutoff < 1000) {
        frequencies = [100, 500, 2000];
      } else if (cutoff < 5000) {
        frequencies = [500, 1000, 5000];
      } else {
        frequencies = [1000, 5000, 15000];
      }
      
      frequencies.forEach(freq => {
        const x = mapFreqToX(freq);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.fillText(freq < 1000 ? `${freq}` : `${freq/1000}k`, x - 10, actualHeight - 1);
        ctx.beginPath();
        ctx.moveTo(x, actualHeight - 15);
        ctx.lineTo(x, actualHeight - 5);
        ctx.stroke();
      });
      
      // Add cutoff frequency indicator
      const cutoffX = mapFreqToX(cutoff);
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(174, 234, 0, 0.7)'; // Accent color with transparency
      ctx.lineWidth = 1;
      ctx.setLineDash([3, 3]);
      ctx.moveTo(cutoffX, 0);
      ctx.lineTo(cutoffX, actualHeight - 10);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Add cutoff frequency label
      ctx.fillStyle = '#AEEA00';
      const cutoffLabel = cutoff < 1000 ? `${cutoff.toFixed(0)}Hz` : `${(cutoff/1000).toFixed(1)}kHz`;
      const labelWidth = ctx.measureText(cutoffLabel).width;
      
      // Position label to avoid going outside canvas
      let labelX = cutoffX - labelWidth / 2;
      labelX = Math.max(2, Math.min(actualWidth - labelWidth - 2, labelX));
      
      ctx.fillText(cutoffLabel, labelX, 12);
    };
    
    // Helper function to map frequency to x-coordinate (log scale)
    const mapFreqToX = (freq: number): number => {
      const minFreq = 20;
      const maxFreq = 20000;
      const minLog = Math.log10(minFreq);
      const maxLog = Math.log10(maxFreq);
      const scale = actualWidth / (maxLog - minLog);
      
      return (Math.log10(freq) - minLog) * scale;
    };
    
    // Map cutoff to x position
    const cutoffX = mapFreqToX(cutoff);
    
    // Function to draw the filter curve
    const drawFilterCurve = () => {
      // Draw a subtle gradient background under the curve based on filter type
      const gradient = ctx.createLinearGradient(0, 0, 0, actualHeight);
      gradient.addColorStop(0, 'rgba(174, 234, 0, 0.1)');
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = gradient;
      
      // Path for filling
      ctx.beginPath();
      
      // Draw curve based on filter type
      const resonancePeak = Math.max(10, 20 + resonance * 40); // Height of resonance peak
      
      if (filterType === 'LowPass') {
        // Draw low pass filter curve
        ctx.moveTo(0, 10);
        ctx.lineTo(cutoffX - 10, 10);
        
        // Resonance peak
        ctx.quadraticCurveTo(cutoffX, actualHeight - resonancePeak, cutoffX + 5, actualHeight - 10);
        
        // Roll-off slope
        ctx.quadraticCurveTo(cutoffX + actualWidth * 0.2, actualHeight - 10, actualWidth, actualHeight - 10);
        
        // Close the path for filling
        ctx.lineTo(actualWidth, actualHeight);
        ctx.lineTo(0, actualHeight);
        ctx.fill();
        
        // Draw the curve line on top
        ctx.beginPath();
        ctx.strokeStyle = '#AEEA00';
        ctx.lineWidth = 2;
        ctx.moveTo(0, 10);
        ctx.lineTo(cutoffX - 10, 10);
        ctx.quadraticCurveTo(cutoffX, actualHeight - resonancePeak, cutoffX + 5, actualHeight - 10);
        ctx.quadraticCurveTo(cutoffX + actualWidth * 0.2, actualHeight - 10, actualWidth, actualHeight - 10);
      } 
      else if (filterType === 'HighPass') {
        // Draw high pass filter curve
        ctx.moveTo(actualWidth, 10);
        ctx.lineTo(cutoffX + 10, 10);
        
        // Resonance peak
        ctx.quadraticCurveTo(cutoffX, actualHeight - resonancePeak, cutoffX - 5, actualHeight - 10);
        
        // Roll-off slope
        ctx.quadraticCurveTo(cutoffX - actualWidth * 0.2, actualHeight - 10, 0, actualHeight - 10);
        
        // Close the path for filling
        ctx.lineTo(0, actualHeight);
        ctx.lineTo(actualWidth, actualHeight);
        ctx.fill();
        
        // Draw the curve line on top
        ctx.beginPath();
        ctx.strokeStyle = '#AEEA00';
        ctx.lineWidth = 2;
        ctx.moveTo(actualWidth, 10);
        ctx.lineTo(cutoffX + 10, 10);
        ctx.quadraticCurveTo(cutoffX, actualHeight - resonancePeak, cutoffX - 5, actualHeight - 10);
        ctx.quadraticCurveTo(cutoffX - actualWidth * 0.2, actualHeight - 10, 0, actualHeight - 10);
      }
      else if (filterType === 'BandPass') {
        // Draw band pass filter curve
        ctx.moveTo(0, actualHeight - 10);
        
        // Left slope
        ctx.quadraticCurveTo(cutoffX - actualWidth * 0.1, actualHeight - 10, cutoffX - 10, actualHeight - resonancePeak * 0.7);
        
        // Resonance peak
        ctx.quadraticCurveTo(cutoffX - 5, actualHeight - resonancePeak, cutoffX, actualHeight - resonancePeak);
        ctx.quadraticCurveTo(cutoffX + 5, actualHeight - resonancePeak, cutoffX + 10, actualHeight - resonancePeak * 0.7);
        
        // Right slope
        ctx.quadraticCurveTo(cutoffX + actualWidth * 0.1, actualHeight - 10, actualWidth, actualHeight - 10);
        
        // Close the path for filling
        ctx.lineTo(actualWidth, actualHeight);
        ctx.lineTo(0, actualHeight);
        ctx.fill();
        
        // Draw the curve line on top
        ctx.beginPath();
        ctx.strokeStyle = '#AEEA00';
        ctx.lineWidth = 2;
        ctx.moveTo(0, actualHeight - 10);
        ctx.quadraticCurveTo(cutoffX - actualWidth * 0.1, actualHeight - 10, cutoffX - 10, actualHeight - resonancePeak * 0.7);
        ctx.quadraticCurveTo(cutoffX - 5, actualHeight - resonancePeak, cutoffX, actualHeight - resonancePeak);
        ctx.quadraticCurveTo(cutoffX + 5, actualHeight - resonancePeak, cutoffX + 10, actualHeight - resonancePeak * 0.7);
        ctx.quadraticCurveTo(cutoffX + actualWidth * 0.1, actualHeight - 10, actualWidth, actualHeight - 10);
      }
      else if (filterType === 'Notch') {
        // Draw notch filter curve
        ctx.moveTo(0, 10);
        
        // Left flat section
        ctx.lineTo(cutoffX - actualWidth * 0.1, 10);
        
        // Left slope
        ctx.quadraticCurveTo(cutoffX - actualWidth * 0.05, 10, cutoffX - 10, actualHeight - 10);
        
        // Right slope
        ctx.quadraticCurveTo(cutoffX + 10, actualHeight - 10, cutoffX + actualWidth * 0.05, 10);
        
        // Right flat section
        ctx.lineTo(actualWidth, 10);
        
        // Close the path for filling
        ctx.lineTo(actualWidth, actualHeight);
        ctx.lineTo(0, actualHeight);
        ctx.fill();
        
        // Draw the curve line on top
        ctx.beginPath();
        ctx.strokeStyle = '#AEEA00';
        ctx.lineWidth = 2;
        ctx.moveTo(0, 10);
        ctx.lineTo(cutoffX - actualWidth * 0.1, 10);
        ctx.quadraticCurveTo(cutoffX - actualWidth * 0.05, 10, cutoffX - 10, actualHeight - 10);
        ctx.quadraticCurveTo(cutoffX + 10, actualHeight - 10, cutoffX + actualWidth * 0.05, 10);
        ctx.lineTo(actualWidth, 10);
      }
      
      ctx.stroke();
      
      // Draw resonance glow effect when resonance is high
      if (resonance > 0.5) {
        const glowIntensity = (resonance - 0.5) * 2; // Scale from 0 to 1 for resonance 0.5-1.0
        ctx.beginPath();
        ctx.arc(cutoffX, actualHeight - resonancePeak, 5 + resonance * 10, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(174, 234, 0, ${glowIntensity * 0.5})`;
        ctx.fill();
        
        if (resonance > 0.8) {
          // Add a subtle pulsing effect for high resonance
          const pulseSize = 8 + Math.sin(Date.now() / 200) * 4;
          ctx.beginPath();
          ctx.arc(cutoffX, actualHeight - resonancePeak, pulseSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(174, 234, 0, ${glowIntensity * 0.3})`;
          ctx.fill();
        }
      }
    };
    
    // Draw the background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, actualWidth, actualHeight);
    
    // Draw grid
    drawFrequencyAxis();
    
    // Draw the filter curve
    drawFilterCurve();
    
    // Debug info - can be removed after verification
    console.log(`Rendering filter response: ${filterType}, cutoff: ${cutoff}, res: ${resonance}, canvas: ${actualWidth}x${actualHeight}`);
    
  }, [filterType, cutoff, resonance, actualWidth, actualHeight, animationFrame]); // Use actualWidth/Height

  return (
    <div className={`filter-response ${resonance > 0.7 ? 'high-resonance' : ''}`} ref={containerRef}>
      <canvas 
        ref={canvasRef} 
        width={actualWidth} 
        height={actualHeight}
        className="filter-response-canvas"
        style={{ 
          // Force the canvas to display properly and fix positioning issues
          width: '100%', 
          height: '150px', 
          display: 'block',
          left: '0',
          position: 'relative'
        }}
      />
      <div className="filter-response-tooltip">
        {filterType} Filter Response
      </div>
    </div>
  );
};

export default FilterResponse;
