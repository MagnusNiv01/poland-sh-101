import { loadPresetCollection, savePresetCollection } from './presetStorage';
import type { StoredPreset, StoredPresetCollection, StudioSnapshot } from './types';

export class PresetManager {
  private collection: StoredPresetCollection = loadPresetCollection();

  listPresets(): StoredPreset[] {
    return [...this.collection.presets].sort((a, b) => a.name.localeCompare(b.name));
  }

  getPreset(id: string): StoredPreset | undefined {
    return this.collection.presets.find((preset) => preset.id === id);
  }

  createPreset(name: string, snapshot: StudioSnapshot): StoredPreset {
    const now = new Date().toISOString();
    const preset: StoredPreset = {
      id: createPresetId(),
      name: name.trim(),
      createdAt: now,
      updatedAt: now,
      snapshot,
    };
    this.collection = {
      ...this.collection,
      presets: [...this.collection.presets, preset],
    };
    this.persist();
    return preset;
  }

  savePreset(id: string, snapshot: StudioSnapshot): StoredPreset | undefined {
    const existing = this.getPreset(id);
    if (!existing) {
      return undefined;
    }
    const updated: StoredPreset = {
      ...existing,
      updatedAt: new Date().toISOString(),
      snapshot,
    };
    this.collection = {
      ...this.collection,
      presets: this.collection.presets.map((preset) => (preset.id === id ? updated : preset)),
    };
    this.persist();
    return updated;
  }

  deletePreset(id: string): void {
    this.collection = {
      ...this.collection,
      presets: this.collection.presets.filter((preset) => preset.id !== id),
    };
    this.persist();
  }

  private persist(): void {
    savePresetCollection(this.collection);
  }
}

function createPresetId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `preset-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
}
