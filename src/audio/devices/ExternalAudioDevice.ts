import type { ExternalDeviceId, ExternalDeviceSettingsMap } from './types';
import type { SerializableDevice } from './SerializableDevice';

export interface ExternalAudioDevice<TId extends ExternalDeviceId = ExternalDeviceId>
  extends SerializableDevice<ExternalDeviceSettingsMap[TId]> {
  readonly id: TId;
  readonly name: string;
  readonly input: AudioNode;
  readonly output: AudioNode;

  getSettings(): ExternalDeviceSettingsMap[TId];
  updateSettings(settings: Partial<ExternalDeviceSettingsMap[TId]>): void;
  setEnabled(enabled: boolean): void;
  connect(destination: AudioNode): AudioNode;
  disconnect(): void;
  dispose(): void;
}
