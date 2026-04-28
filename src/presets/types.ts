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
  snapshot: StudioSnapshot;
};

export type StoredPresetCollection = {
  version: number;
  presets: StoredPreset[];
};
