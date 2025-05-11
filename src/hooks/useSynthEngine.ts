import { useEffect, useRef } from 'react';
import { ParameterUpdateMessage, Seconds } from '../engine/types';

/**
 * Hook to initialize and interact with the Synth AudioWorklet engine.
 * Provides methods to play/stop notes and update parameters.
 */
export function useSynthEngine() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const workletNodeRef = useRef<AudioWorkletNode | null>(null);

  useEffect(() => {
    // Initialize AudioContext and load the AudioWorklet module
    const context = new (window.AudioContext || (window as any).webkitAudioContext)();
    audioContextRef.current = context;

    let node: AudioWorkletNode;
    (async () => {
      try {
        await context.audioWorklet.addModule('/audio-worklet/synth-processor.js');
        node = new AudioWorkletNode(context, 'synth-processor');
        node.connect(context.destination);
        workletNodeRef.current = node;
        console.log('useSynthEngine: SynthProcessor initialized');
      } catch (err) {
        console.error('useSynthEngine: Failed to initialize AudioWorklet', err);
      }
    })();

    return () => {
      // Clean up on unmount
      if (workletNodeRef.current) {
        workletNodeRef.current.disconnect();
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  /**
   * Play a MIDI note with given velocity at optional time.
   */
  function playNote(
    note: number,
    velocity: number,
    time?: Seconds
  ) {
    const msg: ParameterUpdateMessage = {
      path: 'noteOn',
      value: { note, velocity },
      targetTime: time
    };
    console.log('useSynthEngine.playNote:', msg);
    workletNodeRef.current?.port.postMessage(msg);
  }

  /**
   * Stop a MIDI note at optional time.
   */
  function stopNote(
    note: number,
    time?: Seconds
  ) {
    const msg: ParameterUpdateMessage = {
      path: 'noteOff',
      value: note,
      targetTime: time
    };
    console.log('useSynthEngine.stopNote:', msg);
    workletNodeRef.current?.port.postMessage(msg);
  }

  /**
   * Update a synthesis parameter (e.g., filter cutoff, resonance).
   */
  function setParam(
    path: string,
    value: any,
    targetTime?: Seconds
  ) {
    const msg: ParameterUpdateMessage = { path, value, targetTime };
    console.log('useSynthEngine.setParam:', msg);
    workletNodeRef.current?.port.postMessage(msg);
  }

  return { playNote, stopNote, setParam };
}
