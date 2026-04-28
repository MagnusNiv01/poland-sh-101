export type MidiParsedMessage =
  | {
      type: 'noteOn';
      note: number;
      velocity: number;
      channel: number;
    }
  | {
      type: 'noteOff';
      note: number;
      channel: number;
    }
  | {
      type: 'pitchBend';
      value: number;
      channel: number;
    }
  | {
      type: 'controlChange';
      controller: number;
      value: number;
      normalizedValue: number;
      channel: number;
    };

export type MidiStatus =
  | {
      state: 'unsupported' | 'permission-denied' | 'no-inputs';
      label: string;
    }
  | {
      state: 'connected';
      label: string;
      inputNames: string[];
      lastActivityAt: number | null;
    };

export type MidiInputHandlers = {
  onNoteOn(note: number, velocity: number): void;
  onNoteOff(note: number): void;
  onPitchBend(value: number): void;
  onModWheel(value: number): void;
  onAllNotesOff(): void;
  onStatus(status: MidiStatus): void;
};
