import type { WorkletMessage } from './types';
import workletUrl from './worklet/polandSh101Processor.ts?worker&url';

export class AudioEngine {
  private context: AudioContext | null = null;
  private node: AudioWorkletNode | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    this.context = new AudioContext();
    await this.context.audioWorklet.addModule(workletUrl);

    this.node = new AudioWorkletNode(this.context, 'poland-sh-101-processor', {
      numberOfInputs: 0,
      numberOfOutputs: 1,
      outputChannelCount: [2],
    });
    this.node.connect(this.context.destination);
    this.initialized = true;
  }

  async resume(): Promise<void> {
    await this.initialize();
    if (this.context && this.context.state !== 'running') {
      await this.context.resume();
    }
  }

  post(message: WorkletMessage): void {
    this.node?.port.postMessage(message);
  }
}
