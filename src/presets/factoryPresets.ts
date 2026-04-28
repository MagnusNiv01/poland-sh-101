import {
  defaultChorusSettings,
  defaultEchoSettings,
  defaultFlangerSettings,
  defaultReverbSettings,
  type ExternalDeviceSettingsMap,
} from '../audio/devices/types';
import { defaultPatch, type PolandSh101Patch } from '../synth/patch';
import type { StoredPreset, StudioSnapshot } from './types';
import { STUDIO_SNAPSHOT_VERSION } from './presetValidation';

const factoryTimestamp = '2026-04-28T00:00:00.000Z';

export const factoryPresets: StoredPreset[] = [
  createFactoryPreset('factory-init-101', 'INIT 101', {
    patch: {
      sawLevel: 0.75,
      pulseLevel: 0,
      subLevel: 0,
      noiseLevel: 0,
      filterCutoff: 0.82,
      filterResonance: 0.08,
      filterEnvelopeAmount: 0,
      envAttack: 0.005,
      envDecay: 0.18,
      envSustain: 0.85,
      envRelease: 0.12,
    },
  }),
  createFactoryPreset('factory-sub-bass', 'SUB BASS', {
    patch: {
      vcoRange: '16',
      sawLevel: 0.15,
      pulseLevel: 0.2,
      subLevel: 0.9,
      pulseWidth: 0.48,
      filterCutoff: 0.38,
      filterResonance: 0.18,
      filterEnvelopeAmount: 0.28,
      envAttack: 0.003,
      envDecay: 0.16,
      envSustain: 0.72,
      envRelease: 0.08,
      masterVolume: 0.5,
    },
  }),
  createFactoryPreset('factory-magnus-bass', 'MAGNUS BASS', {
    patch: {
      masterVolume: 0.5,
      vcoRange: '16',
      sawLevel: 1,
      pulseLevel: 0.76,
      subLevel: 0.75,
      noiseLevel: 0,
      pulseWidth: 0.65,
      pwmSource: 'manual',
      pwmAmount: 0.29,
      subMode: 'oneOctaveDown',
      filterCutoff: 0.711,
      filterResonance: 0.059,
      filterEnvelopeAmount: 0.934,
      filterLfoAmount: 0.521,
      filterKeyboardTracking: 0.75,
      vcaMode: 'envelope',
      vcaLevel: 0.34,
      envAttack: 0.006,
      envDecay: 0.24,
      envSustain: 0.34,
      envRelease: 0.12,
      lfoRate: 4.5,
      lfoDelay: 1.01,
      lfoWaveform: 'sine',
      lfoPitchAmount: 0,
      lfoFilterAmount: 0,
      lfoPulseWidthAmount: 0.29,
      benderLfoModAmount: 0,
      portamentoTime: 0,
      pitchBendAmount: 2,
      transpose: 0,
    },
    devices: {
      chorus: {
        enabled: true,
        rate: 0.05,
        depth: 0.004,
        mix: 0.35,
        feedback: 0.12,
        delayTime: 0.018,
        stereoWidth: 0.7,
      },
      flanger: {
        enabled: true,
        rate: 0.25,
        depth: 0.45,
        mix: 0.35,
        feedback: 0.35,
        delayTime: 0.004,
        stereoWidth: 0.6,
        phase: 90,
        polarity: 'positive',
      },
      echo: {
        enabled: false,
        time: 0.22,
        feedback: 0.12,
        mix: 0.06,
        tone: 0.68,
        stereoSpread: 0.02,
        pingPong: true,
        syncEnabled: false,
      },
      reverb: {
        enabled: true,
        mix: 0.25,
        decay: 2.5,
        preDelay: 0.02,
        tone: 0.6,
        size: 0.7,
        damping: 0.45,
      },
    },
  }),
  createFactoryPreset('factory-pwm-lead', 'PWM LEAD', {
    patch: {
      sawLevel: 0,
      pulseLevel: 0.85,
      subLevel: 0.08,
      pulseWidth: 0.48,
      pwmSource: 'lfo',
      pwmAmount: 0.25,
      lfoPulseWidthAmount: 0.28,
      lfoRate: 1.1,
      filterCutoff: 0.6,
      filterResonance: 0.22,
      envAttack: 0.01,
      envDecay: 0.28,
      envSustain: 0.64,
      envRelease: 0.18,
    },
    devices: {
      chorus: { enabled: true, rate: 0.55, depth: 0.005, mix: 0.25, feedback: 0.08, stereoWidth: 0.75 },
    },
  }),
  createFactoryPreset('factory-reso-pluck', 'RESO PLUCK', {
    patch: {
      sawLevel: 0.65,
      pulseLevel: 0,
      subLevel: 0.35,
      filterCutoff: 0.35,
      filterResonance: 0.52,
      filterEnvelopeAmount: 0.82,
      envAttack: 0.002,
      envDecay: 0.24,
      envSustain: 0.06,
      envRelease: 0.16,
    },
    devices: {
      reverb: { enabled: true, mix: 0.14, decay: 1.6, preDelay: 0.015, tone: 0.55, size: 0.45, damping: 0.55 },
    },
  }),
  createFactoryPreset('factory-noise-hat', 'NOISE HAT', {
    patch: {
      sawLevel: 0,
      pulseLevel: 0,
      subLevel: 0,
      noiseLevel: 0.85,
      filterCutoff: 0.9,
      filterResonance: 0.12,
      filterEnvelopeAmount: 0.08,
      vcaMode: 'envelope',
      envAttack: 0.001,
      envDecay: 0.035,
      envSustain: 0,
      envRelease: 0.035,
      masterVolume: 0.45,
    },
  }),
  createFactoryPreset('factory-laser-zap', 'LASER ZAP', {
    patch: {
      vcoRange: '2',
      sawLevel: 0.45,
      pulseLevel: 0.3,
      subLevel: 0,
      filterCutoff: 0.48,
      filterResonance: 0.82,
      filterEnvelopeAmount: 0.92,
      lfoPitchAmount: 2.5,
      lfoRate: 8.5,
      envAttack: 0.001,
      envDecay: 0.12,
      envSustain: 0,
      envRelease: 0.08,
      masterVolume: 0.42,
    },
    devices: {
      echo: { enabled: true, time: 0.13, feedback: 0.24, mix: 0.18, tone: 0.76, stereoSpread: 0.06 },
    },
  }),
  createFactoryPreset('factory-dark-drone', 'DARK DRONE', {
    patch: {
      vcoRange: '16',
      sawLevel: 0.55,
      pulseLevel: 0.45,
      subLevel: 0.55,
      filterCutoff: 0.25,
      filterResonance: 0.28,
      filterEnvelopeAmount: 0.18,
      envAttack: 0.75,
      envDecay: 1.2,
      envSustain: 0.78,
      envRelease: 1.2,
      lfoFilterAmount: 0.18,
      lfoRate: 0.22,
      masterVolume: 0.44,
    },
    devices: {
      chorus: { enabled: true, rate: 0.32, depth: 0.006, mix: 0.34, feedback: 0.12, stereoWidth: 0.9 },
      reverb: { enabled: true, mix: 0.32, decay: 4.2, preDelay: 0.025, tone: 0.42, size: 0.82, damping: 0.62 },
    },
  }),
  createFactoryPreset('factory-space-echo-lead', 'SPACE ECHO LEAD', {
    patch: {
      sawLevel: 0.72,
      pulseLevel: 0.28,
      subLevel: 0.08,
      filterCutoff: 0.72,
      filterResonance: 0.24,
      filterEnvelopeAmount: 0.28,
      envAttack: 0.012,
      envDecay: 0.32,
      envSustain: 0.58,
      envRelease: 0.34,
    },
    devices: {
      echo: { enabled: true, time: 0.34, feedback: 0.42, mix: 0.28, tone: 0.72, stereoSpread: 0.12 },
      reverb: { enabled: true, mix: 0.18, decay: 2.6, preDelay: 0.018, tone: 0.66, size: 0.68, damping: 0.48 },
    },
  }),
  createFactoryPreset('factory-organish-square', 'ORGANISH SQUARE', {
    patch: {
      sawLevel: 0,
      pulseLevel: 0.72,
      subLevel: 0.4,
      pulseWidth: 0.5,
      filterCutoff: 0.7,
      filterResonance: 0.08,
      filterEnvelopeAmount: 0.06,
      envAttack: 0.06,
      envDecay: 0.22,
      envSustain: 0.82,
      envRelease: 0.28,
      masterVolume: 0.5,
    },
    devices: {
      chorus: { enabled: true, rate: 0.42, depth: 0.004, mix: 0.3, feedback: 0.06, stereoWidth: 0.62 },
    },
  }),
];

function createFactoryPreset(
  id: string,
  name: string,
  options: {
    patch: Partial<PolandSh101Patch>;
    devices?: Partial<{ [TId in keyof ExternalDeviceSettingsMap]: Partial<ExternalDeviceSettingsMap[TId]> }>;
  },
): StoredPreset {
  return {
    id,
    name,
    source: 'factory',
    createdAt: factoryTimestamp,
    updatedAt: factoryTimestamp,
    snapshot: createSnapshot(options.patch, options.devices ?? {}),
  };
}

function createSnapshot(
  patch: Partial<PolandSh101Patch>,
  devices: Partial<{ [TId in keyof ExternalDeviceSettingsMap]: Partial<ExternalDeviceSettingsMap[TId]> }>,
): StudioSnapshot {
  const deviceSettings: ExternalDeviceSettingsMap = {
    chorus: { ...defaultChorusSettings, ...devices.chorus },
    flanger: { ...defaultFlangerSettings, ...devices.flanger },
    echo: { ...defaultEchoSettings, ...devices.echo },
    reverb: { ...defaultReverbSettings, ...devices.reverb },
  };

  return {
    version: STUDIO_SNAPSHOT_VERSION,
    activeInstrumentId: 'poland-sh101',
    instruments: {
      'poland-sh101': {
        instrumentType: 'poland-sh101',
        stateVersion: 1,
        patch: { ...defaultPatch, ...patch },
      },
    },
    devices: {
      chorus: { deviceType: 'chorus', stateVersion: 1, settings: deviceSettings.chorus },
      flanger: { deviceType: 'flanger', stateVersion: 1, settings: deviceSettings.flanger },
      echo: { deviceType: 'echo', stateVersion: 1, settings: deviceSettings.echo },
      reverb: { deviceType: 'reverb', stateVersion: 1, settings: deviceSettings.reverb },
    },
  };
}
