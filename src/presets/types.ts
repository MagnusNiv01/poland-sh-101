export type SerializableInstrumentState = {
  instrumentType: string;
  stateVersion: number;
  patch: unknown;
};

export type SerializableDeviceState = {
  deviceType: string;
  stateVersion: number;
  settings: unknown;
};

export type StudioSnapshot = {
  version: number;
  activeInstrumentId: string;
  instruments: Record<string, SerializableInstrumentState>;
  devices: Record<string, SerializableDeviceState>;
};

export type StoredPreset = {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  source?: 'factory' | 'user';
  snapshot: StudioSnapshot;
};

export type StoredPresetCollection = {
  version: number;
  presets: StoredPreset[];
};

export type ExportedPresetFile = {
  fileType: 'poland-sh101-presets';
  version: number;
  exportedAt: string;
  factoryPresets: StoredPreset[];
  userPresets: StoredPreset[];
};
