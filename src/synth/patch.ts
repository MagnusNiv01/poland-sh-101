export type VcoRange = '16' | '8' | '4' | '2';
export type PwmSource = 'manual' | 'lfo' | 'envelope';
export type SubMode = 'oneOctaveDown' | 'twoOctavesDown' | 'twoOctavesDownNarrow';
export type VcaMode = 'gate' | 'envelope';
export type LfoWaveform = 'sine' | 'triangle' | 'saw' | 'square' | 'random' | 'noise';
export type VoiceMode = 'mono' | 'poly';

export type PolandSh101Patch = {
  masterVolume: number;
  vcoRange: VcoRange;
  sawLevel: number;
  pulseLevel: number;
  subLevel: number;
  noiseLevel: number;
  pulseWidth: number;
  pwmSource: PwmSource;
  pwmAmount: number;
  subMode: SubMode;
  filterCutoff: number;
  filterResonance: number;
  filterEnvelopeAmount: number;
  filterLfoAmount: number;
  filterKeyboardTracking: number;
  vcaMode: VcaMode;
  vcaLevel: number;
  envAttack: number;
  envDecay: number;
  envSustain: number;
  envRelease: number;
  lfoRate: number;
  lfoDelay: number;
  lfoWaveform: LfoWaveform;
  lfoPitchAmount: number;
  lfoFilterAmount: number;
  lfoPulseWidthAmount: number;
  benderLfoModAmount: number;
  portamentoTime: number;
  pitchBendAmount: number;
  transpose: number;
  voiceMode: VoiceMode;
  maxVoices: number;
};

export const defaultPatch: PolandSh101Patch = {
  masterVolume: 0.55,
  vcoRange: '8',
  sawLevel: 0.75,
  pulseLevel: 0.45,
  subLevel: 0.35,
  noiseLevel: 0,
  pulseWidth: 0.5,
  pwmSource: 'manual',
  pwmAmount: 0.15,
  subMode: 'oneOctaveDown',
  filterCutoff: 0.58,
  filterResonance: 0.2,
  filterEnvelopeAmount: 0.35,
  filterLfoAmount: 0,
  filterKeyboardTracking: 0.28,
  vcaMode: 'envelope',
  vcaLevel: 0.85,
  envAttack: 0.008,
  envDecay: 0.22,
  envSustain: 0.55,
  envRelease: 0.18,
  lfoRate: 4.5,
  lfoDelay: 0,
  lfoWaveform: 'triangle',
  lfoPitchAmount: 0,
  lfoFilterAmount: 0.15,
  lfoPulseWidthAmount: 0.15,
  benderLfoModAmount: 0,
  portamentoTime: 0,
  pitchBendAmount: 2,
  transpose: 0,
  voiceMode: 'mono',
  maxVoices: 4,
};

export function clonePatch(patch: PolandSh101Patch): PolandSh101Patch {
  return { ...patch };
}
