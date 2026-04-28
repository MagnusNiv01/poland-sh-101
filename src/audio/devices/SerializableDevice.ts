export interface SerializableDevice<TSettings = unknown> {
  readonly id: string;
  readonly name: string;
  readonly deviceType: string;
  readonly stateVersion: number;
  readonly includeInPresets: boolean;

  getSettings(): TSettings;
  updateSettings(settings: Partial<TSettings>): void;
  getSerializableState?(): TSettings;
  applySerializableState?(state: unknown): void;
}
