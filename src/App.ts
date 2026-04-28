import { keyToNote } from './input/computerKeyboard';
import { SynthController } from './audio/SynthController';
import { clonePatch, defaultPatch } from './synth/patch';
import { Keyboard } from './ui/components/Keyboard';
import { PerformancePanel } from './ui/components/PerformancePanel';
import { SynthPanel } from './ui/components/SynthPanel';

export class App {
  private readonly root: HTMLElement;
  private readonly controller = new SynthController(defaultPatch);
  private patch = clonePatch(defaultPatch);
  private keyboard: Keyboard | null = null;
  private synthPanel: SynthPanel | null = null;
  private performancePanel: PerformancePanel | null = null;
  private readonly pressedComputerKeys = new Map<string, number>();
  private readonly activeNotes = new Set<number>();

  constructor(root: HTMLElement) {
    this.root = root;
  }

  render(): void {
    const shell = document.createElement('main');
    shell.className = 'app-shell';

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
    this.root.replaceChildren(shell);
    this.bindComputerKeyboard();
    this.bindFirstStart(shell);
  }

  private bindFirstStart(element: HTMLElement): void {
    const start = () => void this.controller.start();
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
      this.pressedComputerKeys.clear();
      this.activeNotes.clear();
      this.controller.allNotesOff();
      this.keyboard?.setActiveNotes(this.activeNotes);
    });
  }

  private async noteOn(note: number): Promise<void> {
    this.activeNotes.add(note);
    this.keyboard?.setActiveNotes(this.activeNotes);
    await this.controller.noteOn(note);
  }

  private noteOff(note: number): void {
    this.activeNotes.delete(note);
    this.keyboard?.setActiveNotes(this.activeNotes);
    this.controller.noteOff(note);
  }

  private updatePatch(patch: typeof this.patch): void {
    this.patch = clonePatch(patch);
    this.synthPanel?.updatePatch(this.patch);
    this.performancePanel?.updatePatch(this.patch);
    this.controller.updatePatch(this.patch);
  }
}
