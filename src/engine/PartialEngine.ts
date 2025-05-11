import { IVoice, MIDINoteNumber, Velocity, Seconds, VoiceParams } from './types';

/**
 * A stub implementation for additive synthesis handling multiple partials.
 * Implements IVoice to be managed by VoiceManager.
 */
export class PartialEngine implements IVoice {
  public readonly id: string;
  private assignedNote: MIDINoteNumber | null = null;
  private active: boolean = false;
  private params: VoiceParams | null = null;

  constructor(id: string) {
    this.id = id;
    console.log(`PartialEngine ${id} created`);
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
    console.log(`PartialEngine ${this.id} noteOn: note=${note}, velocity=${velocity}, time=${time}`, initialParams);
    // TODO: initialize partial playback parameters
  }

  noteOff(time?: Seconds): void {
    console.log(`PartialEngine ${this.id} noteOff: time=${time}`);
    this.active = false;
  }

  updateParams(params: Partial<VoiceParams>, time?: Seconds): void {
    console.log(`PartialEngine ${this.id} updateParams: time=${time}`, params);
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
    console.log(`PartialEngine ${this.id} renderQuantum: sampleRate=${sampleRate}, baseFreq=${baseFrequency}`);
    // TODO: generate and mix partials into outputBuffer
  }

  isActive(): boolean {
    return this.active;
  }

  getAssignedNote(): MIDINoteNumber | null {
    return this.assignedNote;
  }
}
