import type { ExternalAudioDevice } from './ExternalAudioDevice';
import type { SerializableDevice } from './SerializableDevice';
import type { ExternalDeviceId, ExternalDeviceSettingsMap } from './types';

export class ExternalDeviceChain {
  readonly input: GainNode;
  readonly output: GainNode;
  private readonly devices: ExternalAudioDevice[] = [];

  constructor(private readonly context: AudioContext) {
    this.input = this.context.createGain();
    this.output = this.context.createGain();
    this.rebuildRouting();
  }

  addDevice(device: ExternalAudioDevice): void {
    this.devices.push(device);
    this.rebuildRouting();
  }

  getDevice<TId extends ExternalDeviceId>(id: TId): ExternalAudioDevice<TId> | undefined {
    return this.devices.find((device) => device.id === id) as ExternalAudioDevice<TId> | undefined;
  }

  getSerializableDevices(): SerializableDevice[] {
    return [...this.devices].filter((device) => device.includeInPresets);
  }

  updateDeviceSettings<TId extends ExternalDeviceId>(
    id: TId,
    settings: Partial<ExternalDeviceSettingsMap[TId]>,
  ): void {
    this.getDevice(id)?.updateSettings(settings);
  }

  connect(destination: AudioNode): AudioNode {
    return this.output.connect(destination);
  }

  disconnect(): void {
    this.output.disconnect();
  }

  dispose(): void {
    this.input.disconnect();
    this.output.disconnect();
    for (const device of this.devices) {
      device.dispose();
    }
    this.devices.length = 0;
  }

  private rebuildRouting(): void {
    this.input.disconnect();
    for (const device of this.devices) {
      device.disconnect();
    }

    let current: AudioNode = this.input;
    for (const device of this.devices) {
      current.connect(device.input);
      current = device.output;
    }
    current.connect(this.output);
  }
}
