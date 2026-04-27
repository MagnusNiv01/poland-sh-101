import type { PolandSh101Patch } from '../synth/patch';

export type NoteOnMessage = {
  type: 'noteOn';
  note: number;
  frequency: number;
  velocity: number;
};

export type NoteOffMessage = {
  type: 'noteOff';
  note: number;
};

export type PatchMessage = {
  type: 'patch';
  patch: PolandSh101Patch;
};

export type PitchBendMessage = {
  type: 'pitchBend';
  value: number;
};

export type AllNotesOffMessage = {
  type: 'allNotesOff';
};

export type WorkletMessage =
  | NoteOnMessage
  | NoteOffMessage
  | PatchMessage
  | PitchBendMessage
  | AllNotesOffMessage;
