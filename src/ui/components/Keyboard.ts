import { noteToFrequency } from '../../input/computerKeyboard';

type KeyboardOptions = {
  startNote: number;
  keyCount: number;
  activeNotes: Set<number>;
  onNoteOn: (note: number) => void;
  onNoteOff: (note: number) => void;
};

const whiteSemitones = new Set([0, 2, 4, 5, 7, 9, 11]);
const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

type KeyboardKeyModel = {
  note: number;
  semitone: number;
  label: string;
  isWhite: boolean;
  whiteIndex: number;
  blackLeftPercent: number;
};

export class Keyboard {
  readonly element: HTMLElement;
  private readonly options: KeyboardOptions;
  private readonly keys = new Map<number, HTMLButtonElement>();
  private pointerNote: number | null = null;
  private whiteKeyCount = 0;

  constructor(options: KeyboardOptions) {
    this.options = options;
    this.element = document.createElement('div');
    this.element.className = 'keyboard';
    this.render();
  }

  setActiveNotes(notes: Set<number>): void {
    for (const [note, key] of this.keys) {
      key.classList.toggle('is-active', notes.has(note));
    }
  }

  private render(): void {
    const keys = this.createKeyModel();
    const whiteLayer = document.createElement('div');
    const blackLayer = document.createElement('div');
    whiteLayer.className = 'keyboard-layer white-key-layer';
    blackLayer.className = 'keyboard-layer black-key-layer';
    whiteLayer.style.setProperty('--white-key-count', String(this.whiteKeyCount));
    blackLayer.style.setProperty('--white-key-count', String(this.whiteKeyCount));

    for (const keyModel of keys) {
      const key = this.createKeyButton(keyModel);

      if (keyModel.isWhite) {
        key.style.setProperty('--white-index', String(keyModel.whiteIndex));
        whiteLayer.append(key);
      } else {
        key.style.setProperty('--black-left', `${keyModel.blackLeftPercent}%`);
        blackLayer.append(key);
      }

      this.keys.set(keyModel.note, key);
    }

    this.element.append(whiteLayer, blackLayer);
    this.setActiveNotes(this.options.activeNotes);
  }

  private createKeyModel(): KeyboardKeyModel[] {
    const keys: KeyboardKeyModel[] = [];
    let whiteIndex = 0;

    for (let offset = 0; offset < this.options.keyCount; offset += 1) {
      const note = this.options.startNote + offset;
      const semitone = note % 12;
      const isWhite = whiteSemitones.has(semitone);
      const keyWhiteIndex = whiteIndex;

      keys.push({
        note,
        semitone,
        label: noteNames[semitone],
        isWhite,
        whiteIndex: keyWhiteIndex,
        blackLeftPercent: 0,
      });

      if (isWhite) {
        whiteIndex += 1;
      }
    }

    this.whiteKeyCount = whiteIndex;

    for (const key of keys) {
      if (!key.isWhite) {
        key.blackLeftPercent = (key.whiteIndex / this.whiteKeyCount) * 100;
      }
    }

    return keys;
  }

  private createKeyButton(keyModel: KeyboardKeyModel): HTMLButtonElement {
    const key = document.createElement('button');
    key.type = 'button';
    key.className = keyModel.isWhite ? 'piano-key white-key' : 'piano-key black-key';
    key.dataset.note = String(keyModel.note);
    key.title = `${keyModel.label} ${Math.round(noteToFrequency(keyModel.note))} Hz`;
    key.textContent = keyModel.isWhite ? keyModel.label : '';

    key.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      key.setPointerCapture(event.pointerId);
      this.pointerNote = keyModel.note;
      this.options.onNoteOn(keyModel.note);
    });
    key.addEventListener('pointerup', () => this.releasePointerNote());
    key.addEventListener('pointercancel', () => this.releasePointerNote());
    key.addEventListener('lostpointercapture', () => this.releasePointerNote());

    return key;
  }

  private releasePointerNote(): void {
    if (this.pointerNote !== null) {
      this.options.onNoteOff(this.pointerNote);
      this.pointerNote = null;
    }
  }
}
