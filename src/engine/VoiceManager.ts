import { IVoiceManager, MIDINoteNumber, Velocity, Seconds, ParameterUpdateMessage } from './types';
import { Voice } from './Voice';
import { PartialEngine } from './PartialEngine';

/**
 * Manages a pool of subtractive and additive voices, handles note allocation,
 * parameter updates, and processes audio blocks.
 */
export class VoiceManager implements IVoiceManager {
  private voices: Voice[] = [];
  private partials: PartialEngine[] = [];

  /**
   * @param numVoices Number of subtractive voices to allocate.
   */
  constructor(numVoices: number = 8) {
    for (let i = 0; i < numVoices; i++) {
      this.voices.push(new Voice(`voice-${i}`));
    }
    console.log(`VoiceManager created with ${numVoices} subtractive voices`);
  }

  noteOn(note: MIDINoteNumber, velocity: Velocity, time?: Seconds): void {
    console.log(`VoiceManager noteOn: note=${note}, velocity=${velocity}, time=${time}`);
    // TODO: find a free voice and call its noteOn()
  }

  noteOff(note: MIDINoteNumber, time?: Seconds): void {
    console.log(`VoiceManager noteOff: note=${note}, time=${time}`);
    // TODO: trigger release on the assigned voice
  }

  allNotesOff(time?: Seconds): void {
    console.log(`VoiceManager allNotesOff: time=${time}`);
    this.voices.forEach((v) => v.noteOff(time));
    this.partials.forEach((p) => p.noteOff(time));
  }

  applyParameterUpdates(updates: ParameterUpdateMessage[]): void {
    console.log('VoiceManager applyParameterUpdates', updates);
    // TODO: route updates into voices or global settings
  }

  processQuantum(
    mainOutputBuffers: Float32Array[][],
    audioParams: Record<string, Float32Array | number>,
    sampleRate: number
  ): void {
    console.log(`VoiceManager processQuantum: sampleRate=${sampleRate}`);
    // TODO: iterate active voices and call renderQuantum to fill mainOutputBuffers
  }
}
