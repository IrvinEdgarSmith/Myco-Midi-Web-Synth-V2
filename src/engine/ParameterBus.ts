import { IParameterBus, ParameterUpdateMessage } from './types';

// TODO: Consider a more robust ring buffer implementation for production,
// potentially using SharedArrayBuffer if the target environment supports it robustly
// and the complexity is justified. For now, a simple array-based queue
// will serve for initial development and testing.

/**
 * A simple parameter bus for sending messages from the main thread to the audio thread.
 * This implementation uses a basic array as a queue.
 *
 * @implements {IParameterBus}
 */
export class ParameterBus implements IParameterBus {
  private messageQueue: ParameterUpdateMessage[] = [];
  private maxQueueSize: number;

  /**
   * Creates an instance of ParameterBus.
   * @param {number} [maxQueueSize=1024] - The maximum number of messages the queue can hold.
   */
  constructor(maxQueueSize: number = 1024) {
    this.maxQueueSize = maxQueueSize;
    console.log('ParameterBus initialized.');
  }

  /**
   * Enqueues a parameter update message for the audio thread.
   * @implements {IParameterBus.enqueueUpdate}
   * @param {ParameterUpdateMessage} message - The message to enqueue.
   */
  enqueueUpdate(message: ParameterUpdateMessage): void {
    if (this.messageQueue.length < this.maxQueueSize) {
      this.messageQueue.push(message);
    } else {
      console.warn('ParameterBus: Queue full, update dropped.', message);
    }
  }

  /**
   * Dequeues all pending parameter update messages.
   * @implements {IParameterBus.dequeueAllUpdates}
   * @returns {ParameterUpdateMessage[]} An array of messages.
   */
  dequeueAllUpdates(): ParameterUpdateMessage[] {
    const messages = this.messageQueue.length ? [...this.messageQueue] : [];
    this.messageQueue = [];
    return messages;
  }

  /**
   * Clears all messages from the queue.
   */
  clear(): void {
    this.messageQueue = [];
    console.log('ParameterBus: Queue cleared.');
  }

  /**
   * Gets the current number of messages in the queue.
   * @returns {number} The number of messages.
   */
  getQueueSize(): number {
    return this.messageQueue.length;
  }
}
