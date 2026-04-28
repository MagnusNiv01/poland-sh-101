import { loadPresetCollection, savePresetCollection } from './presetStorage';
import { factoryPresets } from './factoryPresets';
import type { StoredPreset, StoredPresetCollection, StudioSnapshot } from './types';

export class PresetManager {
  private collection: StoredPresetCollection = loadPresetCollection();

  listPresets(): StoredPreset[] {
    return [
      ...factoryPresets,
      ...this.collection.presets.map((preset) => ({ ...preset, source: 'user' as const })),
    ];
  }

  listFactoryPresets(): StoredPreset[] {
    return [...factoryPresets];
  }

  listUserPresets(): StoredPreset[] {
    return this.collection.presets.map((preset) => ({ ...preset, source: 'user' as const }));
  }

  getPreset(id: string): StoredPreset | undefined {
    return this.listPresets().find((preset) => preset.id === id);
  }

  isFactoryPreset(id: string): boolean {
    return factoryPresets.some((preset) => preset.id === id);
  }

  createPreset(name: string, snapshot: StudioSnapshot): StoredPreset {
    const now = new Date().toISOString();
    const preset: StoredPreset = {
      id: createPresetId(),
      name: name.trim(),
      source: 'user',
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
    if (this.isFactoryPreset(id)) {
      return undefined;
    }
    const existing = this.getPreset(id);
    if (!existing || existing.source === 'factory') {
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
    if (this.isFactoryPreset(id)) {
      return;
    }
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
