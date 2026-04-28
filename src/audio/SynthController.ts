import { noteToFrequency } from '../input/computerKeyboard';
import { clonePatch, type PolandSh101Patch } from '../synth/patch';
import type { ExternalDeviceId, ExternalDeviceSettingsMap } from './devices/types';
import { AudioEngine } from './AudioEngine';

export class SynthController {
  private readonly audio = new AudioEngine();
  private patch: PolandSh101Patch;
  private activeNotes = new Set<number>();

  constructor(initialPatch: PolandSh101Patch) {
    this.patch = clonePatch(initialPatch);
  }

  async start(): Promise<void> {
    await this.audio.resume();
    this.audio.post({ type: 'patch', patch: this.patch });
  }

  updatePatch(nextPatch: PolandSh101Patch): void {
    this.patch = clonePatch(nextPatch);
    this.audio.post({ type: 'patch', patch: this.patch });
  }

  async noteOn(note: number, velocity = 1): Promise<void> {
    await this.start();
    const transposed = note + this.patch.transpose;
    this.activeNotes.add(note);
    this.audio.post({
      type: 'noteOn',
      note,
      frequency: noteToFrequency(transposed),
      velocity,
    });
  }

  noteOff(note: number): void {
    this.activeNotes.delete(note);
    this.audio.post({ type: 'noteOff', note });
  }

  pitchBend(value: number): void {
    this.audio.post({ type: 'pitchBend', value });
  }

  updateDeviceSettings<TId extends ExternalDeviceId>(
    id: TId,
    settings: Partial<ExternalDeviceSettingsMap[TId]>,
  ): void {
    this.audio.updateDeviceSettings(id, settings);
  }

  allNotesOff(): void {
    this.activeNotes.clear();
    this.audio.post({ type: 'allNotesOff' });
  }

  getActiveNotes(): Set<number> {
    return new Set(this.activeNotes);
  }
}
