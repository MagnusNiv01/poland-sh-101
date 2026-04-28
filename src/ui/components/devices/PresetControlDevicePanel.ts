import type { PresetManager } from '../../../presets/PresetManager';
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
      this.updateDisplay();
    });

    const buttons = document.createElement('div');
    buttons.className = 'preset-buttons';
    buttons.append(
      this.createButton('NEW', () => this.createNewPreset()),
      this.createButton('SAVE', () => this.savePreset()),
      this.createButton('LOAD', () => this.loadPreset()),
      this.createButton('DELETE', () => this.deletePreset()),
    );

    const body = document.createElement('div');
    body.className = 'preset-control-body';
    body.append(this.select, buttons);

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
    if (!this.selectedPresetId) {
      this.createNewPreset();
      return;
    }
    const updated = this.options.manager.savePreset(this.selectedPresetId, this.options.createSnapshot());
    if (updated) {
      this.selectedPresetId = updated.id;
    }
    this.refreshPresetList();
  }

  private loadPreset(): void {
    const preset = this.getSelectedPreset();
    if (!preset) {
      return;
    }
    this.options.applySnapshot(preset.snapshot);
    this.selectedPresetId = preset.id;
    this.refreshPresetList();
  }

  private deletePreset(): void {
    const preset = this.getSelectedPreset();
    if (!preset || !window.confirm(`Delete preset "${preset.name}"?`)) {
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
    const presets = this.options.manager.listPresets();
    this.select.replaceChildren();

    const empty = document.createElement('option');
    empty.value = '';
    empty.textContent = presets.length > 0 ? 'Select preset' : 'No presets';
    this.select.append(empty);

    for (const preset of presets) {
      const option = document.createElement('option');
      option.value = preset.id;
      option.textContent = preset.name;
      this.select.append(option);
    }

    if (this.selectedPresetId && presets.some((preset) => preset.id === this.selectedPresetId)) {
      this.select.value = this.selectedPresetId;
    } else {
      this.selectedPresetId = '';
      this.select.value = '';
    }
    this.updateDisplay();
  }

  private updateDisplay(): void {
    this.display.textContent = this.getSelectedPreset()?.name ?? 'INIT';
  }
}
