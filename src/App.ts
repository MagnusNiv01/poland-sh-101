import { keyToNote } from './input/computerKeyboard';
import { MidiInput } from './input/midi/MidiInput';
import { SynthController } from './audio/SynthController';
import {
  defaultChorusSettings,
  defaultEchoSettings,
  defaultFlangerSettings,
  defaultReverbSettings,
  type ExternalDeviceId,
  type ExternalDeviceSettingsMap,
} from './audio/devices/types';
import { PresetManager } from './presets/PresetManager';
import type { StudioSnapshot } from './presets/types';
import { STUDIO_SNAPSHOT_VERSION, isRecord } from './presets/presetValidation';
import { clonePatch, defaultPatch } from './synth/patch';
import { Keyboard } from './ui/components/Keyboard';
import { DeviceRack } from './ui/components/devices/DeviceRack';
import { MidiStatus } from './ui/components/MidiStatus';
import { PerformancePanel } from './ui/components/PerformancePanel';
import { SynthPanel } from './ui/components/SynthPanel';

export class App {
  private readonly root: HTMLElement;
  private readonly controller = new SynthController(defaultPatch);
  private readonly presetManager = new PresetManager();
  private patch = clonePatch(defaultPatch);
  private deviceSettings: ExternalDeviceSettingsMap = cloneDeviceSettings(defaultDeviceSettings);
  private keyboard: Keyboard | null = null;
  private midiInput: MidiInput | null = null;
  private midiStatus: MidiStatus | null = null;
  private synthPanel: SynthPanel | null = null;
  private performancePanel: PerformancePanel | null = null;
  private deviceRack: DeviceRack | null = null;
  private readonly pressedComputerKeys = new Map<string, number>();
  private readonly activeNotes = new Set<number>();

  constructor(root: HTMLElement) {
    this.root = root;
  }

  render(): void {
    const shell = document.createElement('main');
    shell.className = 'app-shell';
    this.midiStatus = new MidiStatus();
    this.midiInput = new MidiInput({
      onNoteOn: (note, velocity) => void this.noteOn(note, velocity),
      onNoteOff: (note) => this.noteOff(note),
      onPitchBend: (value) => this.controller.pitchBend(value),
      // TODO: Route MIDI CC1 into a dedicated modulation target when a typed mod-wheel parameter exists.
      onModWheel: (value) => this.updatePatch({ ...this.patch, benderLfoModAmount: value * 12 }),
      onAllNotesOff: () => this.clearActiveNotes(),
      onStatus: (status) => this.midiStatus?.update(status),
    });
    this.deviceRack = new DeviceRack({
      presetManager: this.presetManager,
      createSnapshot: () => this.createStudioSnapshot(),
      applySnapshot: (snapshot) => this.applyStudioSnapshot(snapshot),
      onDeviceChange: (id, settings) => this.updateDeviceSettings(id, settings),
    });

    this.synthPanel = new SynthPanel({
      patch: this.patch,
      onPatchChange: (patch) => {
        this.updatePatch(patch);
      },
      onPitchBend: (value) => this.controller.pitchBend(value),
    });

    this.performancePanel = new PerformancePanel({
      patch: this.patch,
      onPatchChange: (patch) => this.updatePatch(patch),
      onPitchBend: (value) => this.controller.pitchBend(value),
    });

    this.keyboard = new Keyboard({
      startNote: 41,
      keyCount: 32,
      activeNotes: this.activeNotes,
      onNoteOn: (note) => void this.noteOn(note),
      onNoteOff: (note) => this.noteOff(note),
    });

    const keyboardPanel = document.createElement('section');
    keyboardPanel.className = 'keyboard-panel';
    keyboardPanel.append(this.performancePanel.element, this.keyboard.element);

    shell.append(this.synthPanel.element, keyboardPanel);
    this.root.replaceChildren(shell, this.midiStatus.element, this.deviceRack.element);
    this.bindComputerKeyboard();
    this.bindFirstStart(shell);
  }

  private bindFirstStart(element: HTMLElement): void {
    const start = () => {
      void this.controller.start();
      void this.midiInput?.initialize();
    };
    element.addEventListener('pointerdown', start, { once: true });
    window.addEventListener('keydown', start, { once: true });
  }

  private bindComputerKeyboard(): void {
    window.addEventListener('keydown', (event) => {
      if (event.repeat || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const note = keyToNote(event.key, 48);
      if (note === undefined || this.pressedComputerKeys.has(event.key.toLowerCase())) {
        return;
      }
      event.preventDefault();
      this.pressedComputerKeys.set(event.key.toLowerCase(), note);
      void this.noteOn(note);
    });

    window.addEventListener('keyup', (event) => {
      const key = event.key.toLowerCase();
      const note = this.pressedComputerKeys.get(key);
      if (note === undefined) {
        return;
      }
      event.preventDefault();
      this.pressedComputerKeys.delete(key);
      this.noteOff(note);
    });

    window.addEventListener('blur', () => {
      this.midiInput?.allNotesOff();
      this.clearActiveNotes();
    });
  }

  private async noteOn(note: number, velocity = 1): Promise<void> {
    this.activeNotes.add(note);
    this.keyboard?.setActiveNotes(this.activeNotes);
    await this.controller.noteOn(note, velocity);
  }

  private noteOff(note: number): void {
    this.activeNotes.delete(note);
    this.keyboard?.setActiveNotes(this.activeNotes);
    this.controller.noteOff(note);
  }

  private clearActiveNotes(): void {
    this.pressedComputerKeys.clear();
    this.activeNotes.clear();
    this.controller.allNotesOff();
    this.keyboard?.setActiveNotes(this.activeNotes);
  }

  private updatePatch(patch: typeof this.patch): void {
    this.patch = clonePatch(patch);
    this.synthPanel?.updatePatch(this.patch);
    this.performancePanel?.updatePatch(this.patch);
    this.controller.updatePatch(this.patch);
  }

  private updateDeviceSettings<TId extends ExternalDeviceId>(
    id: TId,
    settings: Partial<ExternalDeviceSettingsMap[TId]>,
  ): void {
    this.deviceSettings = {
      ...this.deviceSettings,
      [id]: {
        ...this.deviceSettings[id],
        ...settings,
      },
    };
    this.controller.updateDeviceSettings(id, settings);
  }

  private createStudioSnapshot(): StudioSnapshot {
    const devices: StudioSnapshot['devices'] = {};
    for (const id of Object.keys(this.deviceSettings) as ExternalDeviceId[]) {
      devices[id] = {
        deviceType: id,
        stateVersion: 1,
        settings: { ...this.deviceSettings[id] },
      };
    }
    for (const device of this.controller.getSerializableDevices()) {
      if (!device.includeInPresets) {
        continue;
      }
      devices[device.id] = {
        deviceType: device.deviceType,
        stateVersion: device.stateVersion,
        settings: device.getSerializableState?.() ?? device.getSettings(),
      };
    }

    return {
      version: STUDIO_SNAPSHOT_VERSION,
      activeInstrumentId: 'poland-sh101',
      instruments: {
        'poland-sh101': {
          instrumentType: 'poland-sh101',
          stateVersion: 1,
          patch: clonePatch(this.patch),
        },
      },
      devices,
    };
  }

  private applyStudioSnapshot(snapshot: StudioSnapshot): void {
    this.midiInput?.allNotesOff();
    this.clearActiveNotes();

    const sh101State = snapshot.instruments['poland-sh101'];
    if (sh101State?.instrumentType === 'poland-sh101') {
      this.updatePatch(sanitizePatch(sh101State.patch));
    }

    for (const id of Object.keys(this.deviceSettings) as ExternalDeviceId[]) {
      const state = snapshot.devices[id];
      if (!state) {
        continue;
      }
      const settings = sanitizeDeviceSettings(id, state.settings);
      this.deviceSettings = {
        ...this.deviceSettings,
        [id]: settings,
      };
      this.controller.updateDeviceSettings(id, settings);
      this.deviceRack?.updateDeviceSettings(id, settings);
    }
    for (const device of this.controller.getSerializableDevices()) {
      if (device.id in this.deviceSettings) {
        continue;
      }
      const state = snapshot.devices[device.id];
      if (state) {
        device.applySerializableState?.(state.settings);
      }
    }
  }
}

const defaultDeviceSettings: ExternalDeviceSettingsMap = {
  chorus: { ...defaultChorusSettings },
  flanger: { ...defaultFlangerSettings },
  echo: { ...defaultEchoSettings },
  reverb: { ...defaultReverbSettings },
};

function cloneDeviceSettings(settings: ExternalDeviceSettingsMap): ExternalDeviceSettingsMap {
  return {
    chorus: { ...settings.chorus },
    flanger: { ...settings.flanger },
    echo: { ...settings.echo },
    reverb: { ...settings.reverb },
  };
}

function sanitizePatch(value: unknown): typeof defaultPatch {
  if (!isRecord(value)) {
    return clonePatch(defaultPatch);
  }
  const patch = clonePatch(defaultPatch);
  for (const key of Object.keys(defaultPatch) as Array<keyof typeof defaultPatch>) {
    const current = value[key];
    const defaultValue = defaultPatch[key];
    if (typeof current === typeof defaultValue) {
      (patch[key] as typeof current) = current;
    }
  }
  if (patch.voiceMode !== 'mono' && patch.voiceMode !== 'poly') {
    patch.voiceMode = defaultPatch.voiceMode;
  }
  if (!Number.isFinite(patch.maxVoices) || patch.maxVoices < 1) {
    patch.maxVoices = defaultPatch.maxVoices;
  }
  return patch;
}

function sanitizeDeviceSettings<TId extends ExternalDeviceId>(
  id: TId,
  value: unknown,
): ExternalDeviceSettingsMap[TId] {
  const defaults = defaultDeviceSettings[id];
  if (!isRecord(value)) {
    return { ...defaults };
  }
  const settings = { ...defaults };
  for (const key of Object.keys(defaults) as Array<keyof typeof defaults>) {
    const current = value[key as string];
    const defaultValue = defaults[key];
    if (typeof current === typeof defaultValue) {
      (settings[key] as typeof current) = current;
    }
  }
  return settings;
}
