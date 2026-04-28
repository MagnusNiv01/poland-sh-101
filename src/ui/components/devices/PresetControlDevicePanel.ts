import type { PresetManager } from '../../../presets/PresetManager';
import { downloadPresetExport, readPresetExport } from '../../../presets/presetImportExport';
import type { StoredPreset, StudioSnapshot } from '../../../presets/types';

type PresetControlDevicePanelOptions = {
  manager: PresetManager;
  createSnapshot: () => StudioSnapshot;
  applySnapshot: (snapshot: StudioSnapshot) => void;
};

export class PresetControlDevicePanel {
  readonly element: HTMLElement;
  private selectedPresetId = '';
  private readonly display: HTMLElement;
  private readonly select: HTMLSelectElement;
  private readonly fileInput: HTMLInputElement;
  private readonly deleteButton: HTMLButtonElement;

  constructor(private readonly options: PresetControlDevicePanelOptions) {
    this.element = document.createElement('section');
    this.element.className = 'device-shell preset-control-device';

    const header = document.createElement('header');
    header.className = 'device-header preset-control-header';
    const title = document.createElement('h2');
    title.textContent = 'PRESET CONTROL';
    this.display = document.createElement('div');
    this.display.className = 'preset-display';
    header.append(title, this.display);

    this.select = document.createElement('select');
    this.select.className = 'preset-select';
    this.select.addEventListener('change', () => {
      this.selectedPresetId = this.select.value;
      this.loadSelectedPreset();
    });
    this.fileInput = document.createElement('input');
    this.fileInput.type = 'file';
    this.fileInput.accept = 'application/json,.json';
    this.fileInput.className = 'preset-file-input';
    this.fileInput.addEventListener('change', () => void this.importPresets());

    const buttons = document.createElement('div');
    buttons.className = 'preset-buttons';
    const newButton = this.createButton('NEW', () => this.createNewPreset());
    const saveButton = this.createButton('SAVE', () => this.savePreset());
    const importButton = this.createButton('IMPORT', () => this.fileInput.click());
    const exportButton = this.createButton('EXPORT', () => this.exportPresets());
    this.deleteButton = this.createButton('DELETE', () => this.deletePreset());
    buttons.append(newButton, saveButton, importButton, exportButton, this.deleteButton);

    const body = document.createElement('div');
    body.className = 'preset-control-body';
    body.append(this.select, buttons, this.fileInput);

    this.element.append(header, body);
    this.refreshPresetList();
  }

  private createButton(label: string, onClick: () => void): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'preset-button';
    button.textContent = label;
    button.addEventListener('click', onClick);
    return button;
  }

  private createNewPreset(): void {
    const name = this.requestPresetName();
    if (!name) {
      return;
    }
    const preset = this.options.manager.createPreset(name, this.options.createSnapshot());
    this.selectedPresetId = preset.id;
    this.refreshPresetList();
  }

  private savePreset(): void {
    if (!this.selectedPresetId || this.options.manager.isFactoryPreset(this.selectedPresetId)) {
      this.createNewPreset();
      return;
    }
    const updated = this.options.manager.savePreset(this.selectedPresetId, this.options.createSnapshot());
    if (updated) {
      this.selectedPresetId = updated.id;
    }
    this.refreshPresetList();
  }

  private loadSelectedPreset(): void {
    const preset = this.getSelectedPreset();
    if (!preset) {
      this.refreshPresetList();
      return;
    }
    this.options.applySnapshot(preset.snapshot);
    this.selectedPresetId = preset.id;
    this.refreshPresetList();
  }

  private exportPresets(): void {
    downloadPresetExport(this.options.manager.createExportFile());
  }

  private async importPresets(): Promise<void> {
    const file = this.fileInput.files?.[0];
    this.fileInput.value = '';
    if (!file) {
      return;
    }

    try {
      const imported = await readPresetExport(file);
      const importedCount = this.options.manager.importUserPresets(imported.userPresets);
      this.refreshPresetList();
      window.alert(`Imported ${importedCount} user preset${importedCount === 1 ? '' : 's'}.`);
    } catch (error) {
      window.alert(error instanceof Error ? error.message : 'Preset import failed.');
    }
  }

  private deletePreset(): void {
    const preset = this.getSelectedPreset();
    if (!preset || preset.source === 'factory' || !window.confirm(`Delete preset "${preset.name}"?`)) {
      return;
    }
    this.options.manager.deletePreset(preset.id);
    this.selectedPresetId = '';
    this.refreshPresetList();
  }

  private requestPresetName(): string | null {
    const name = window.prompt('Preset name');
    const trimmed = name?.trim() ?? '';
    return trimmed.length > 0 ? trimmed : null;
  }

  private getSelectedPreset(): StoredPreset | undefined {
    return this.selectedPresetId ? this.options.manager.getPreset(this.selectedPresetId) : undefined;
  }

  private refreshPresetList(): void {
    const factoryPresets = this.options.manager.listFactoryPresets();
    const userPresets = this.options.manager.listUserPresets();
    const presets = [...factoryPresets, ...userPresets];
    this.select.replaceChildren();

    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = 'Select preset';
    this.select.append(empty);

    this.appendPresetGroup('FACTORY', factoryPresets);
    this.appendPresetGroup('USER', userPresets);

    if (this.selectedPresetId && presets.some((preset) => preset.id === this.selectedPresetId)) {
      this.select.value = this.selectedPresetId;
    } else {
      this.selectedPresetId = '';
      this.select.value = '';
    }
    this.updateDisplay();
    this.deleteButton.disabled = this.selectedPresetId === '' || this.options.manager.isFactoryPreset(this.selectedPresetId);
  }

  private appendPresetGroup(label: string, presets: StoredPreset[]): void {
    if (presets.length === 0) {
      return;
    }
    const group = document.createElement('optgroup');
    group.label = label;
    for (const preset of presets) {
      const option = document.createElement('option');
      option.value = preset.id;
      option.textContent = `${preset.source === 'factory' ? 'F - ' : 'USER: '}${preset.name}`;
      group.append(option);
    }
    this.select.append(group);
  }

  private updateDisplay(): void {
    const preset = this.getSelectedPreset();
    this.display.textContent = preset ? `${preset.source === 'factory' ? 'F - ' : ''}${preset.name}` : 'INIT';
  }
}
