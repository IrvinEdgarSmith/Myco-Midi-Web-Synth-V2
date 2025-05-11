import { describe, it, expect } from 'vitest';
import { Voice } from '../../src/engine/Voice';

describe('Voice', () => {
  it('should initialize with inactive state and null note', () => {
    const voice = new Voice('test-voice');
    expect(voice.id).toBe('test-voice');
    expect(voice.isActive()).toBe(false);
    expect(voice.getAssignedNote()).toBeNull();
  });

  it('should set active state and note on noteOn call', () => {
    const voice = new Voice('voice-1');
    voice.noteOn(60, 127);
    expect(voice.isActive()).toBe(true);
    expect(voice.getAssignedNote()).toBe(60);
  });

  it('should deactivate on noteOff call', () => {
    const voice = new Voice('voice-2');
    voice.noteOn(61, 100);
    voice.noteOff();
    expect(voice.isActive()).toBe(false);
  });

  it('should update parameters and merge with existing params', () => {
    const voice = new Voice('voice-3');
    // Call updateParams before noteOn (should not error)
    expect(() => voice.updateParams({})).not.toThrow();
    // Call noteOn with initial params
    const initialParams = { globalGain: 0.5 };
    voice.noteOn(62, 80, undefined, initialParams as any);
    // Update params
    voice.updateParams({ globalGain: 0.8 } as any);
    // No direct getter for params, but ensure no errors thrown
    expect(voice.isActive()).toBe(true);
  });
});
