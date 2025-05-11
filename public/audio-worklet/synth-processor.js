// public/audio-worklet/synth-processor.js

// A basic AudioWorkletProcessor stub that will later integrate ParameterBus and VoiceManager.
class SynthProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    // Queue for parameter updates received from the main thread
    this.parameterQueue = [];
    this.port.onmessage = (event) => {
      this.parameterQueue.push(event.data);
    };

    // TODO: import and instantiate ParameterBus and VoiceManager
    console.log('SynthProcessor initialized');
  }

  /**
   * @param {Float32Array[][]} inputs - Unused
   * @param {Float32Array[][]} outputs - [channel][frame]
   * @param {Record<string, Float32Array>} parameters - AudioParam streams
   * @returns {boolean} Keep processor alive
   */
  process(inputs, outputs, parameters) {
    const outputBuffers = outputs[0];

    // 1. Dequeue all pending parameter updates
    const updates = this.parameterQueue.splice(0);
    // TODO: applyParameterUpdates(updates) on voiceManager

    // 2. Render audio for each voice into outputBuffers
    // TODO: voiceManager.processQuantum(outputBuffers, parameters, sampleRate);

    return true; // keep the processor running
  }
}

registerProcessor('synth-processor', SynthProcessor);
