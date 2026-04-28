import { parseMidiMessage } from './midiMessageParser';
import type { MidiInputHandlers, MidiStatus } from './midiTypes';

type MidiAccess = {
  inputs: Map<string, MidiInputPort>;
  onstatechange: ((event: Event) => void) | null;
};

type MidiInputPort = {
  id: string;
  name?: string | null;
  state?: string;
  onmidimessage: ((event: MidiMessageEventLike) => void) | null;
};

type MidiMessageEventLike = {
  data: Uint8Array;
};

type NavigatorWithMidi = Navigator & {
  requestMIDIAccess?: () => Promise<MidiAccess>;
};

export class MidiInput {
  private access: MidiAccess | null = null;
  private readonly connectedInputIds = new Set<string>();
  private readonly sustainedNotes = new Set<number>();
  private sustainDown = false;
  private initialized = false;

  constructor(private readonly handlers: MidiInputHandlers) {}

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }
    this.initialized = true;

    const requestMIDIAccess = (navigator as NavigatorWithMidi).requestMIDIAccess;
    if (!requestMIDIAccess) {
      this.emitStatus({ state: 'unsupported', label: 'MIDI unsupported' });
      return;
    }

    try {
      this.access = await requestMIDIAccess.call(navigator);
      this.access.onstatechange = () => this.refreshInputs();
      this.refreshInputs();
    } catch {
      this.emitStatus({ state: 'permission-denied', label: 'MIDI permission denied' });
    }
  }

  allNotesOff(): void {
    this.sustainedNotes.clear();
    this.sustainDown = false;
  }

  private refreshInputs(): void {
    if (!this.access) {
      return;
    }

    const activeInputs = [...this.access.inputs.values()].filter((input) => input.state !== 'disconnected');
    const activeIds = new Set(activeInputs.map((input) => input.id));

    for (const id of this.connectedInputIds) {
      if (!activeIds.has(id)) {
        this.connectedInputIds.delete(id);
        this.handlers.onPitchBend(0);
        this.allNotesOff();
        this.handlers.onAllNotesOff();
      }
    }

    for (const input of activeInputs) {
      if (!this.connectedInputIds.has(input.id)) {
        this.connectedInputIds.add(input.id);
        input.onmidimessage = (event) => this.handleMessage(event);
      }
    }

    if (activeInputs.length === 0) {
      this.emitStatus({ state: 'no-inputs', label: 'No MIDI input connected' });
      return;
    }

    this.emitStatus({
      state: 'connected',
      label: `MIDI connected: ${activeInputs.map((input) => input.name || 'Unnamed input').join(', ')}`,
      inputNames: activeInputs.map((input) => input.name || 'Unnamed input'),
      lastActivityAt: null,
    });
  }

  private handleMessage(event: MidiMessageEventLike): void {
    const message = parseMidiMessage(event.data);
    if (!message) {
      return;
    }

    if (message.type === 'noteOn') {
      this.sustainedNotes.delete(message.note);
      this.handlers.onNoteOn(message.note, message.velocity);
      this.emitActivity();
      return;
    }

    if (message.type === 'noteOff') {
      if (this.sustainDown) {
        this.sustainedNotes.add(message.note);
      } else {
        this.handlers.onNoteOff(message.note);
      }
      this.emitActivity();
      return;
    }

    if (message.type === 'pitchBend') {
      this.handlers.onPitchBend(message.value);
      this.emitActivity();
      return;
    }

    if (message.type === 'controlChange') {
      if (message.controller === 1) {
        this.handlers.onModWheel(message.normalizedValue);
      }
      if (message.controller === 64) {
        this.handleSustain(message.value >= 64);
      }
      this.emitActivity();
    }
  }

  private handleSustain(down: boolean): void {
    if (this.sustainDown === down) {
      return;
    }
    this.sustainDown = down;
    if (!down) {
      for (const note of this.sustainedNotes) {
        this.handlers.onNoteOff(note);
      }
      this.sustainedNotes.clear();
    }
  }

  private emitActivity(): void {
    if (!this.access) {
      return;
    }
    const inputNames = [...this.access.inputs.values()]
      .filter((input) => input.state !== 'disconnected')
      .map((input) => input.name || 'Unnamed input');
    this.emitStatus({
      state: inputNames.length > 0 ? 'connected' : 'no-inputs',
      label: inputNames.length > 0 ? `MIDI connected: ${inputNames.join(', ')}` : 'No MIDI input connected',
      inputNames,
      lastActivityAt: Date.now(),
    } as MidiStatus);
  }

  private emitStatus(status: MidiStatus): void {
    this.handlers.onStatus(status);
  }
}
