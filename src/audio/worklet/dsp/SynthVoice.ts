import type { PolandSh101Patch } from '../../../synth/patch';
import { AdsrEnvelope } from './Envelope';
import { ResonantLowPassFilter } from './Filter';
import { clampPulseWidth, PulseOscillator, SawOscillator, SubOscillator } from './Oscillator';
import { Smoother } from './Smoother';

export class SynthVoice {
  private readonly saw = new SawOscillator();
  private readonly pulse = new PulseOscillator();
  private readonly sub = new SubOscillator();
  private readonly envelope = new AdsrEnvelope();
  private readonly filter = new ResonantLowPassFilter();
  private readonly frequency: Smoother;
  private readonly pulseWidth: Smoother;
  private note = -1;
  private noteFrequency = 110;
  private velocity = 0;
  private gate = false;
  private active = false;
  private age = 0;

  constructor(sampleRate: number) {
    this.frequency = new Smoother(sampleRate, 0.01, 110);
    this.pulseWidth = new Smoother(sampleRate, 0.01, 0.5);
  }

  noteOn(
    note: number,
    frequency: number,
    velocity: number,
    sampleRate: number,
    portamentoTime: number,
    resetFrequency: boolean,
    age: number,
    rangeMultiplier: number,
  ): void {
    this.note = note;
    this.noteFrequency = frequency;
    this.velocity = Math.max(0, Math.min(1, velocity));
    this.gate = true;
    this.active = true;
    this.age = age;
    this.frequency.setTime(sampleRate, Math.max(0.002, portamentoTime));
    if (resetFrequency) {
      this.frequency.reset(frequency * rangeMultiplier);
    }
    this.frequency.setTarget(frequency * rangeMultiplier);
    this.envelope.gateOn();
  }

  noteOff(): void {
    this.gate = false;
    this.envelope.gateOff();
  }

  kill(): void {
    this.note = -1;
    this.noteFrequency = 110;
    this.velocity = 0;
    this.gate = false;
    this.active = false;
    this.envelope.reset();
    this.filter.reset();
    this.frequency.reset(110);
    this.pulseWidth.reset(0.5);
  }

  isActive(): boolean {
    return this.active;
  }

  isGateOn(): boolean {
    return this.gate;
  }

  getNote(): number {
    return this.note;
  }

  getAge(): number {
    return this.age;
  }

  next(
    patch: PolandSh101Patch,
    sampleRate: number,
    lfoValue: number,
    bendSemitones: number,
    pitchLfoSemitones: number,
    rangeMultiplier: number,
    sawLevel: number,
    pulseLevel: number,
    subLevel: number,
    noiseSample: number,
    cutoffBase: number,
    resonance: number,
    filterEnvAmount: number,
    filterLfoAmount: number,
    filterLfoBenderAmount: number,
    filterKeyTracking: number,
    pwmAmount: number,
    lfoPulseWidthAmount: number,
    vcaLevel: number,
  ): number {
    if (!this.active) {
      return 0;
    }

    const env = this.envelope.next(
      sampleRate,
      patch.envAttack,
      patch.envDecay,
      patch.envSustain,
      patch.envRelease,
    );

    if (!this.gate && !this.envelope.isActive()) {
      this.active = false;
      this.note = -1;
      return 0;
    }

    const frequencyTarget = this.noteFrequency * rangeMultiplier * 2 ** ((bendSemitones + pitchLfoSemitones) / 12);
    this.frequency.setTarget(frequencyTarget);
    const frequency = this.frequency.next();

    const pwmMod =
      patch.pwmSource === 'lfo'
        ? lfoValue * lfoPulseWidthAmount
        : patch.pwmSource === 'envelope'
          ? (env * 2 - 1) * pwmAmount
          : 0;
    this.pulseWidth.setTarget(clampPulseWidth(patch.pulseWidth + pwmMod));
    const pulseWidth = this.pulseWidth.next();

    const saw = this.saw.next(frequency, sampleRate) * sawLevel;
    const pulse = this.pulse.next(frequency, sampleRate, pulseWidth) * pulseLevel;
    const subDivisor = patch.subMode === 'oneOctaveDown' ? 2 : 4;
    const subNarrow = patch.subMode === 'twoOctavesDownNarrow';
    const sub = this.sub.next(frequency, sampleRate, subDivisor, subNarrow) * subLevel;
    const mixed = softClip((saw + pulse + sub + noiseSample) * 0.32);

    const keyTrack = Math.max(0, frequency - 130) * filterKeyTracking * 8;
    const envCutoff = env * filterEnvAmount * 6200;
    const lfoCutoff = lfoValue * (filterLfoAmount + filterLfoBenderAmount) * 3600;
    const filtered = this.filter.process(mixed, cutoffBase + keyTrack + envCutoff + lfoCutoff, resonance, sampleRate);
    const amp = patch.vcaMode === 'gate' ? (this.gate ? 1 : 0) : env;
    return softClip(filtered * amp * vcaLevel * this.velocity * 1.9);
  }
}

function softClip(value: number): number {
  return Math.tanh(value);
}
