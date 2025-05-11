// ============================================================================
// FILE: src/engine/types.ts
// ============================================================================
// DESCRIPTION: Core type definitions and interfaces for the audio engine.
// This includes basic units, DSP parameter structures, and interfaces
// for voice management, parameter communication, and synthesis modules.
// ============================================================================

// ----------------------------------------------------------------------------
// Basic Numeric and Utility Types
// ----------------------------------------------------------------------------

/** A MIDI note number, typically ranging from 0 to 127. */
export type MIDINoteNumber = number;

/** MIDI velocity, typically ranging from 0 to 127. */
export type Velocity = number;

/** Time in seconds. */
export type Seconds = number;

/** Frequency in Hertz. */
export type Hertz = number;

/** Gain or level in decibels. */
export type Decibels = number;

/** A value normalized to the range [0, 1]. */
export type NormalizedRange = number;

/** A percentage value, typically ranging from 0 to 100. */
export type Percentage = number;

/** Beats per minute. */
export type BPM = number;

// ----------------------------------------------------------------------------
// DSP Parameter Structures
// ----------------------------------------------------------------------------

/** Parameters for an envelope generator. */
export interface EnvelopeParams {
  attack: Seconds;  // Time to reach peak level
  decay: Seconds;   // Time to fall from peak to sustain level
  sustain: NormalizedRange; // Level maintained while note is held (0-1)
  release: Seconds; // Time to fall from sustain level to zero after note off
}

/** Supported filter types for BiquadFilterNode and custom filters. */
export type FilterType =
  | 'lowpass'
  | 'highpass'
  | 'bandpass'
  | 'notch'
  | 'allpass'
  | 'peaking'
  | 'lowshelf'
  | 'highshelf';

/** Parameters for a filter module. */
export interface FilterParams {
  type: FilterType;
  frequency: Hertz; // Cutoff or center frequency
  q: number;        // Quality factor (resonance for LP/HP, bandwidth for BP/Notch)
  gain?: Decibels;   // Gain for peaking, lowshelf, highshelf filters
  bypass?: boolean;  // Optional bypass flag
}

/** Supported oscillator waveforms. */
export type OscillatorType =
  | 'sine'
  | 'square'
  | 'sawtooth'
  | 'triangle'
  | 'custom'; // For wavetable synthesis

/** Parameters for an oscillator module. */
export interface OscillatorParams {
  type: OscillatorType;
  waveTable?: Float32Array; // For 'custom' type
  octaveOffset?: number;    // e.g., -2, -1, 0, 1, 2 octaves
  detuneCent?: number;      // Fine-tuning in cents (100 cents = 1 semitone)
  phaseOffset?: NormalizedRange; // Initial phase (0-1 represents 0 to 2*PI)
  pulseWidth?: NormalizedRange;  // For 'square' (pulse) wave, 0-1
  gain?: NormalizedRange;        // Individual oscillator gain/amplitude (0-1)
}

/** Parameters for an LFO (Low-Frequency Oscillator). */
export interface LFOParams {
  shape: OscillatorType; // Waveform of the LFO
  rateHz: Hertz;         // LFO speed in cycles per second
  depth: NormalizedRange;// Modulation intensity (0-1)
  syncToBPM?: boolean;   // Whether LFO rate is synced to host tempo
  tempoSyncMultiplier?: number; // e.g., 0.25 (1/16th), 1 (1/4th), 4 (whole note)
  phaseOffset?: NormalizedRange; // Initial phase of LFO
  targetParams?: string[]; // Paths to parameters this LFO should modulate
}

// ----------------------------------------------------------------------------
// Voice-Level Parameter Structures
// ----------------------------------------------------------------------------

/** Alias for envelope parameters specifically for amplitude. */
export type AmpEnvelopeParams = EnvelopeParams;

/** Envelope parameters for modulating a filter, including modulation amount. */
export interface FilterEnvelopeParams extends EnvelopeParams {
  amount: NormalizedRange; // How much the envelope affects the filter (0-1, can be bipolar if needed)
}

/** Parameters for a subtractive synthesis voice. */
export interface SubtractiveVoiceParams {
  oscillators: OscillatorParams[];
  mixer: {
    gains: NormalizedRange[]; // Gain for each oscillator
    pans?: NormalizedRange[];  // Pan for each oscillator (0=left, 0.5=center, 1=right)
  };
  filter: FilterParams;
  ampEnvelope: AmpEnvelopeParams;
  filterEnvelope?: FilterEnvelopeParams;
  lfos?: LFOParams[];
  globalGain?: NormalizedRange; // Overall gain for the voice
  pitchBendRangeSemitones?: number; // Semitones for max pitch bend
  portamentoTime?: Seconds; // Glide time between notes
}

/** Parameters for a single partial in additive synthesis. */
export interface PartialParams {
  frequencyRatio: number; // Ratio to the fundamental frequency (e.g., 1, 2, 3.5)
  amplitude: NormalizedRange; // Amplitude of this partial (0-1)
  phase?: NormalizedRange;    // Initial phase of this partial (0-1)
  envelope?: EnvelopeParams;  // Optional individual envelope for this partial
  detuneCent?: number;      // Fine-tuning for this partial
}

/** Parameters for an additive synthesis voice. */
export interface AdditiveVoiceParams {
  partials: PartialParams[];
  ampEnvelope: AmpEnvelopeParams; // Global amplitude envelope for the sum of partials
  globalGain?: NormalizedRange;
  pitchBendRangeSemitones?: number;
  portamentoTime?: Seconds;
}

/** Union type for any voice parameter structure. */
export type VoiceParams = SubtractiveVoiceParams | AdditiveVoiceParams;

// ----------------------------------------------------------------------------
// Engine Core Interfaces
// ----------------------------------------------------------------------------

/** Describes a parameter update message passed between UI and audio thread. */
export interface ParameterUpdateMessage {
  path: string; // Dot-notation path to the parameter (e.g., "osc.0.type", "filter.cutoff")
  value: any;   // The new value for the parameter
  targetTime?: Seconds; // Absolute AudioContext time for scheduled changes
}

/**
 * Interface for a Parameter Bus, responsible for thread-safe communication
 * of parameter changes from the main thread (UI) to the audio thread.
 */
export interface IParameterBus {
  /** Enqueues a parameter update to be processed by the audio thread. */
  enqueueUpdate(update: ParameterUpdateMessage): void;

  /** Dequeues all pending parameter updates. Called by the audio thread. */
  dequeueAllUpdates(): ParameterUpdateMessage[];
}

/**
 * Interface for a single synthesis voice. A voice is responsible for
 * generating sound for a single note.
 */
export interface IVoice {
  readonly id: string; // Unique identifier for the voice instance

  /**
   * Initializes and starts the voice for a given MIDI note and velocity.
   * @param note MIDI note number.
   * @param velocity MIDI velocity.
   * @param time Optional AudioContext time to start.
   * @param initialParams Optional parameters to apply specifically for this note-on event.
   */
  noteOn(
    note: MIDINoteNumber,
    velocity: Velocity,
    time?: Seconds,
    initialParams?: Partial<VoiceParams>
  ): void;

  /**
   * Begins the release phase of the voice.
   * @param time Optional AudioContext time to start release.
   */
  noteOff(time?: Seconds): void;

  /**
   * Updates parameters of an active voice.
   * @param params A partial object of parameters to update.
   * @param time Optional AudioContext time for scheduled update.
   */
  updateParams(params: Partial<VoiceParams>, time?: Seconds): void;

  /**
   * Renders the next block of audio samples for this voice.
   * This method is typically called by the VoiceManager within an AudioWorklet.
   * @param outputBuffer Stereo output buffer (e.g., [Float32Array, Float32Array]) to fill.
   * @param sampleRate The current sample rate in Hertz.
   * @param baseFrequency The fundamental frequency for the current note, after pitch bend/portamento.
   * @param globalParams Optional global parameters affecting all voices (e.g., master volume).
   */
  renderQuantum(
    outputBuffer: Float32Array[],
    sampleRate: Hertz,
    baseFrequency: Hertz,
    globalParams?: any
  ): void;

  /** Returns true if the voice is currently active (playing or in release phase). */
  isActive(): boolean;

  /** Returns the MIDI note number this voice is currently assigned to, or null. */
  getAssignedNote(): MIDINoteNumber | null;

  /**
   * If the voice uses internal Web Audio API nodes for its output,
   * this method returns the output node. Otherwise, returns null.
   * Useful if not rendering directly to a buffer in an AudioWorklet.
   */
  getOutputNode?(): AudioNode | null;

  /** Connects the voice's output (if using Web Audio nodes). */
  connect?(destination: AudioNode | AudioParam): void;

  /** Disconnects the voice's output. */
  disconnect?(): void;
}

/**
 * Interface for a Voice Manager, responsible for allocating, managing,
 * and processing a pool of IVoice instances.
 */
export interface IVoiceManager {
  /**
   * Assigns a voice to a new note or re-triggers an existing one.
   * @param note MIDI note number.
   * @param velocity MIDI velocity.
   * @param time Optional AudioContext time.
   */
  noteOn(note: MIDINoteNumber, velocity: Velocity, time?: Seconds): void;

  /**
   * Triggers the release phase for a specific note.
   * @param note MIDI note number.
   * @param time Optional AudioContext time.
   */
  noteOff(note: MIDINoteNumber, time?: Seconds): void;

  /** Triggers the release phase for all active voices (panic). */
  allNotesOff(time?: Seconds): void;

  /**
   * Applies parameter updates from the ParameterBus to relevant voices
   * or global settings.
   * @param updates An array of parameter update messages.
   */
  applyParameterUpdates(updates: ParameterUpdateMessage[]): void;

  /**
   * Main audio processing method, typically called by an AudioWorkletProcessor.
   * It manages active voices, calls their renderQuantum, mixes their output,
   * and applies any global effects.
   * @param mainOutputBuffers The main stereo output buffers from the AudioWorklet.
   * @param audioParams Smoothed parameter values from AudioParams registered in the worklet.
   * @param sampleRate The current sample rate.
   */
  processQuantum(
    mainOutputBuffers: Float32Array[][], // Typically [channel0Data, channel1Data]
    audioParams: Record<string, Float32Array | number>, // Smoothed values from AudioWorklet
    sampleRate: Hertz
  ): void;

  /**
   * If the voice manager has a global output node (e.g., for master effects
   * implemented with Web Audio nodes), this returns it. Otherwise, null.
   */
  getOutputNode?(): AudioNode | null;

  /** Connects the voice manager's master output. */
  connect?(destination: AudioNode | AudioParam): void;

  /** Disconnects the voice manager's master output. */
  disconnect?(): void;
}

// TODO: Consider interfaces for modulation matrix, effects, etc. as engine grows.

console.log('src/engine/types.ts loaded'); // For verification during development
