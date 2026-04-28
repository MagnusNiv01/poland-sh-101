import type { WorkletMessage } from './types';
import { ChorusDevice } from './devices/chorus/ChorusDevice';
import { EchoDevice } from './devices/echo/EchoDevice';
import { ExternalDeviceChain } from './devices/ExternalDeviceChain';
import { FlangerDevice } from './devices/flanger/FlangerDevice';
import { ReverbDevice } from './devices/reverb/ReverbDevice';
import type { ExternalDeviceId, ExternalDeviceSettingsMap } from './devices/types';
import workletUrl from './worklet/polandSh101Processor.ts?worker&url';

export class AudioEngine {
  private context: AudioContext | null = null;
  private node: AudioWorkletNode | null = null;
  private deviceChain: ExternalDeviceChain | null = null;
  private readonly pendingDeviceSettings: Partial<{
    [TId in ExternalDeviceId]: Partial<ExternalDeviceSettingsMap[TId]>;
  }> = {};
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
    this.deviceChain = new ExternalDeviceChain(this.context);
    this.deviceChain.addDevice(new ChorusDevice(this.context));
    this.deviceChain.addDevice(new FlangerDevice(this.context));
    this.deviceChain.addDevice(new EchoDevice(this.context));
    this.deviceChain.addDevice(new ReverbDevice(this.context));
    this.applyPendingDeviceSettings();
    this.node.connect(this.deviceChain.input);
    this.deviceChain.connect(this.context.destination);
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

  updateDeviceSettings<TId extends ExternalDeviceId>(
    id: TId,
    settings: Partial<ExternalDeviceSettingsMap[TId]>,
  ): void {
    this.pendingDeviceSettings[id] = {
      ...this.pendingDeviceSettings[id],
      ...settings,
    };
    this.deviceChain?.updateDeviceSettings(id, settings);
  }

  private applyPendingDeviceSettings(): void {
    for (const id of Object.keys(this.pendingDeviceSettings) as ExternalDeviceId[]) {
      const settings = this.pendingDeviceSettings[id];
      if (settings) {
        this.deviceChain?.updateDeviceSettings(id, settings);
      }
    }
  }
}
