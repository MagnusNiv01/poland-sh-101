import { type PolandSh101Patch, defaultPatch } from '../../synth/patch';
import type { WorkletMessage } from '../types';
import { AdsrEnvelope } from './dsp/Envelope';
import { ResonantLowPassFilter } from './dsp/Filter';
import { Lfo } from './dsp/Lfo';
import { clampPulseWidth, PulseOscillator, SawOscillator, SubOscillator } from './dsp/Oscillator';
import { Smoother } from './dsp/Smoother';

declare const sampleRate: number;
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
}
declare function registerProcessor(name: string, processorCtor: typeof AudioWorkletProcessor): void;

class PolandSh101Processor extends AudioWorkletProcessor {
  private patch: PolandSh101Patch = { ...defaultPatch };
  private readonly saw = new SawOscillator();
  private readonly pulse = new PulseOscillator();
  private readonly sub = new SubOscillator();
  private readonly envelope = new AdsrEnvelope();
  private readonly filter = new ResonantLowPassFilter();
  private readonly lfo = new Lfo();
  private readonly frequency = new Smoother(sampleRate, 0.01, 110);
  private readonly cutoff = new Smoother(sampleRate, 0.015, 1200);
  private readonly pulseWidth = new Smoother(sampleRate, 0.01, 0.5);
  private gate = false;
  private noteFrequency = 110;
  private noteVelocity = 0;
  private currentNote = -1;
  private pitchBend = 0;
  private noiseState = 22222;
  private lfoAgeSeconds = 0;

  constructor() {
    super();
    this.port.onmessage = (event: MessageEvent<WorkletMessage>) => this.handleMessage(event.data);
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const output = outputs[0];
    const left = output[0];
    const right = output[1] ?? left;
    const patch = this.patch;

    for (let i = 0; i < left.length; i += 1) {
      if (this.gate) {
        this.lfoAgeSeconds += 1 / sampleRate;
      }

      const env = this.envelope.next(
        sampleRate,
        patch.envAttack,
        patch.envDecay,
        patch.envSustain,
        patch.envRelease,
      );
      const lfoDelayGain = patch.lfoDelay <= 0 ? 1 : Math.min(1, this.lfoAgeSeconds / patch.lfoDelay);
      const lfoValue = this.lfo.next(patch.lfoRate, patch.lfoWaveform, sampleRate) * lfoDelayGain;
      const bendSemitones = this.pitchBend * patch.pitchBendAmount;
      const pitchLfoSemitones = lfoValue * patch.lfoPitchAmount;
      const frequencyTarget = this.noteFrequency * 2 ** ((bendSemitones + pitchLfoSemitones) / 12);
      this.frequency.setTarget(frequencyTarget * this.rangeMultiplier(patch.vcoRange));
      const frequency = this.frequency.next();

      const pwmMod =
        patch.pwmSource === 'lfo'
          ? lfoValue * patch.lfoPulseWidthAmount
          : patch.pwmSource === 'envelope'
            ? (env * 2 - 1) * patch.pwmAmount
            : 0;
      this.pulseWidth.setTarget(clampPulseWidth(patch.pulseWidth + pwmMod));
      const pulseWidth = this.pulseWidth.next();

      const saw = this.saw.next(frequency, sampleRate) * patch.sawLevel;
      const pulse = this.pulse.next(frequency, sampleRate, pulseWidth) * patch.pulseLevel;
      const subDivisor = patch.subMode === 'oneOctaveDown' ? 2 : 4;
      const subNarrow = patch.subMode === 'twoOctavesDownNarrow';
      const sub = this.sub.next(frequency, sampleRate, subDivisor, subNarrow) * patch.subLevel;
      const noise = this.whiteNoise() * patch.noiseLevel;
      const mixed = (saw + pulse + sub + noise) * 0.32;

      const cutoffBase = this.cutoffFromControl(patch.filterCutoff);
      const keyTrack = Math.max(0, frequency - 130) * patch.filterKeyboardTracking * 8;
      const envCutoff = env * patch.filterEnvelopeAmount * 6200;
      const lfoCutoff = lfoValue * (patch.filterLfoAmount + patch.lfoFilterAmount) * 3600;
      this.cutoff.setTarget(cutoffBase + keyTrack + envCutoff + lfoCutoff);
      const filtered = this.filter.process(mixed, this.cutoff.next(), patch.filterResonance, sampleRate);
      const amp = patch.vcaMode === 'gate' ? (this.gate ? 1 : 0) : env;
      const shaped = this.softClip(filtered * amp * patch.masterVolume * this.noteVelocity * 1.8);

      left[i] = shaped;
      right[i] = shaped;
    }

    return true;
  }

  private handleMessage(message: WorkletMessage): void {
    if (message.type === 'patch') {
      this.patch = { ...message.patch };
      this.frequency.setTime(sampleRate, Math.max(0.002, this.patch.portamentoTime));
      return;
    }
    if (message.type === 'noteOn') {
      this.currentNote = message.note;
      this.noteFrequency = message.frequency;
      this.noteVelocity = message.velocity;
      this.gate = true;
      this.lfoAgeSeconds = 0;
      this.frequency.setTime(sampleRate, Math.max(0.002, this.patch.portamentoTime));
      if (this.patch.portamentoTime <= 0.002) {
        this.frequency.reset(message.frequency * this.rangeMultiplier(this.patch.vcoRange));
      }
      this.frequency.setTarget(message.frequency);
      this.envelope.gateOn();
      return;
    }
    if (message.type === 'noteOff') {
      if (message.note === this.currentNote) {
        this.gate = false;
        this.envelope.gateOff();
      }
      return;
    }
    if (message.type === 'pitchBend') {
      this.pitchBend = Math.max(-1, Math.min(1, message.value));
      return;
    }
    if (message.type === 'allNotesOff') {
      this.gate = false;
      this.currentNote = -1;
      this.envelope.gateOff();
    }
  }

  private rangeMultiplier(range: PolandSh101Patch['vcoRange']): number {
    if (range === '16') {
      return 0.5;
    }
    if (range === '4') {
      return 2;
    }
    if (range === '2') {
      return 4;
    }
    return 1;
  }

  private cutoffFromControl(value: number): number {
    return 30 * 2 ** (value * 9.4);
  }

  private whiteNoise(): number {
    this.noiseState = (this.noiseState * 1664525 + 1013904223) | 0;
    return ((this.noiseState >>> 0) / 2147483647) - 1;
  }

  private softClip(value: number): number {
    return Math.tanh(value);
  }
}

registerProcessor('poland-sh-101-processor', PolandSh101Processor);
