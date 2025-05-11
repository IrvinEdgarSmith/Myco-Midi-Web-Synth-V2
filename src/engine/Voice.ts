import { IVoice, MIDINoteNumber, Velocity, Seconds, VoiceParams } from './types';

/**
 * A stub implementation of a single subtractive synthesis voice.
 * Implements the IVoice interface. Methods are placeholders to
 * be fleshed out with actual DSP and Web Audio logic under AudioWorklet.
 */
export class Voice implements IVoice {
  public readonly id: string;
  private assignedNote: MIDINoteNumber | null = null;
  private active: boolean = false;
  private params: VoiceParams | null = null;

  constructor(id: string) {
    this.id = id;
    console.log(`Voice ${id} created`);
  }

  noteOn(
    note: MIDINoteNumber,
    velocity: Velocity,
    time?: Seconds,
    initialParams?: Partial<VoiceParams>
  ): void {
    this.assignedNote = note;
    this.active = true;
    this.params = initialParams || null;
    console.log(`Voice ${this.id} noteOn: note=${note}, velocity=${velocity}, time=${time}`, initialParams);
    // TODO: initialize DSP/gain/envelopes here
  }

  noteOff(time?: Seconds): void {
    console.log(`Voice ${this.id} noteOff: time=${time}`);
    // TODO: trigger release phase
    this.active = false;
  }

  updateParams(params: Partial<VoiceParams>, time?: Seconds): void {
    console.log(`Voice ${this.id} updateParams: time=${time}`, params);
    // TODO: apply parameter changes with smoothing
    if (this.params) {
      this.params = { ...this.params, ...params };
    }
  }

  renderQuantum(
    outputBuffer: Float32Array[],
    sampleRate: number,
    baseFrequency: number,
    globalParams?: any
  ): void {
    console.log(`Voice ${this.id} renderQuantum: sampleRate=${sampleRate}, baseFreq=${baseFrequency}`);
    // TODO: fill outputBuffer with generated samples
  }

  isActive(): boolean {
    return this.active;
  }

  getAssignedNote(): MIDINoteNumber | null {
    return this.assignedNote;
  }
}
