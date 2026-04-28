export type ExternalDeviceId = 'chorus' | 'flanger' | 'echo' | 'reverb';

export type ChorusSettings = {
  enabled: boolean;
  rate: number;
  depth: number;
  mix: number;
  feedback: number;
  delayTime: number;
  stereoWidth: number;
};

export type FlangerPolarity = 'positive' | 'negative';

export type FlangerSettings = {
  enabled: boolean;
  rate: number;
  depth: number;
  mix: number;
  feedback: number;
  delayTime: number;
  stereoWidth: number;
  phase: number;
  polarity: FlangerPolarity;
};

export type EchoSettings = {
  enabled: boolean;
  time: number;
  feedback: number;
  mix: number;
  tone: number;
  stereoSpread: number;
  pingPong: boolean;
  syncEnabled: boolean;
};

export type ReverbSettings = {
  enabled: boolean;
  mix: number;
  decay: number;
  preDelay: number;
  tone: number;
  size: number;
  damping: number;
};

export type ExternalDeviceSettingsMap = {
  chorus: ChorusSettings;
  flanger: FlangerSettings;
  echo: EchoSettings;
  reverb: ReverbSettings;
};

export type ExternalDeviceSettings = ChorusSettings | FlangerSettings | EchoSettings | ReverbSettings;

export const defaultChorusSettings: ChorusSettings = {
  enabled: false,
  rate: 0.65,
  depth: 0.004,
  mix: 0.35,
  feedback: 0.12,
  delayTime: 0.018,
  stereoWidth: 0.7,
};

export const defaultFlangerSettings: FlangerSettings = {
  enabled: false,
  rate: 0.25,
  depth: 0.45,
  mix: 0.35,
  feedback: 0.35,
  delayTime: 0.004,
  stereoWidth: 0.6,
  phase: 90,
  polarity: 'positive',
};

export const defaultEchoSettings: EchoSettings = {
  enabled: false,
  time: 0.32,
  feedback: 0.32,
  mix: 0.28,
  tone: 0.62,
  stereoSpread: 0.08,
  pingPong: true,
  syncEnabled: false,
};

export const defaultReverbSettings: ReverbSettings = {
  enabled: false,
  mix: 0.25,
  decay: 2.5,
  preDelay: 0.02,
  tone: 0.6,
  size: 0.7,
  damping: 0.45,
};

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
