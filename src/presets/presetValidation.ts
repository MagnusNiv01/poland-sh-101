import type { ExportedPresetFile, StoredPreset, StoredPresetCollection, StudioSnapshot } from './types';

export const PRESET_COLLECTION_VERSION = 1;
export const STUDIO_SNAPSHOT_VERSION = 1;
export const PRESET_EXPORT_FILE_VERSION = 1;

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function validateStoredPresetCollection(value: unknown): StoredPresetCollection {
  if (!isRecord(value) || value.version !== PRESET_COLLECTION_VERSION || !Array.isArray(value.presets)) {
    return { version: PRESET_COLLECTION_VERSION, presets: [] };
  }

  return {
    version: PRESET_COLLECTION_VERSION,
    presets: value.presets.flatMap((preset) => {
      const valid = validateStoredPreset(preset);
      return valid ? [valid] : [];
    }),
  };
}

function validateStoredPreset(value: unknown): StoredPreset | null {
  if (!isRecord(value)) {
    return null;
  }
  if (typeof value.id !== 'string' || typeof value.name !== 'string') {
    return null;
  }
  if (typeof value.createdAt !== 'string' || typeof value.updatedAt !== 'string') {
    return null;
  }
  const snapshot = validateStudioSnapshot(value.snapshot);
  if (!snapshot) {
    return null;
  }
  return {
    id: value.id,
    name: value.name,
    createdAt: value.createdAt,
    updatedAt: value.updatedAt,
    source: value.source === 'factory' ? 'factory' : 'user',
    snapshot,
  };
}

export function validateStudioSnapshot(value: unknown): StudioSnapshot | null {
  if (!isRecord(value) || value.version !== STUDIO_SNAPSHOT_VERSION) {
    return null;
  }
  if (typeof value.activeInstrumentId !== 'string' || !isRecord(value.instruments) || !isRecord(value.devices)) {
    return null;
  }
  return {
    version: STUDIO_SNAPSHOT_VERSION,
    activeInstrumentId: value.activeInstrumentId,
    instruments: validateInstrumentStates(value.instruments),
    devices: validateDeviceStates(value.devices),
  };
}

export function validateExportedPresetFile(value: unknown): ExportedPresetFile | null {
  if (!isRecord(value) || value.fileType !== 'poland-sh101-presets' || value.version !== PRESET_EXPORT_FILE_VERSION) {
    return null;
  }
  if (typeof value.exportedAt !== 'string' || !Array.isArray(value.factoryPresets) || !Array.isArray(value.userPresets)) {
    return null;
  }
  return {
    fileType: 'poland-sh101-presets',
    version: PRESET_EXPORT_FILE_VERSION,
    exportedAt: value.exportedAt,
    factoryPresets: value.factoryPresets.flatMap((preset) => {
      const valid = validateStoredPreset(preset);
      return valid ? [{ ...valid, source: 'factory' as const }] : [];
    }),
    userPresets: value.userPresets.flatMap((preset) => {
      const valid = validateStoredPreset(preset);
      return valid ? [{ ...valid, source: 'user' as const }] : [];
    }),
  };
}

function validateInstrumentStates(value: Record<string, unknown>): StudioSnapshot['instruments'] {
  const instruments: StudioSnapshot['instruments'] = {};
  for (const [id, state] of Object.entries(value)) {
    if (!isRecord(state) || typeof state.instrumentType !== 'string' || typeof state.stateVersion !== 'number') {
      continue;
    }
    instruments[id] = {
      instrumentType: state.instrumentType,
      stateVersion: state.stateVersion,
      patch: state.patch,
    };
  }
  return instruments;
}

function validateDeviceStates(value: Record<string, unknown>): StudioSnapshot['devices'] {
  const devices: StudioSnapshot['devices'] = {};
  for (const [id, state] of Object.entries(value)) {
    if (!isRecord(state) || typeof state.deviceType !== 'string' || typeof state.stateVersion !== 'number') {
      continue;
    }
    devices[id] = {
      deviceType: state.deviceType,
      stateVersion: state.stateVersion,
      settings: state.settings,
    };
  }
  return devices;
}
