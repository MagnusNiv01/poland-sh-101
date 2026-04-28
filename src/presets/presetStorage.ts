import type { StoredPresetCollection } from './types';
import { PRESET_COLLECTION_VERSION, validateStoredPresetCollection } from './presetValidation';

const storageKey = 'poland-sh101.presets.v1';

export function loadPresetCollection(): StoredPresetCollection {
  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) {
      return emptyCollection();
    }
    return validateStoredPresetCollection(JSON.parse(raw));
  } catch {
    return emptyCollection();
  }
}

export function savePresetCollection(collection: StoredPresetCollection): void {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(collection));
  } catch {
    // Preset writes are best-effort; audio and UI should keep working if storage is unavailable.
  }
}

function emptyCollection(): StoredPresetCollection {
  return { version: PRESET_COLLECTION_VERSION, presets: [] };
}
