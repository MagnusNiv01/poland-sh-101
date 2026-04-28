import type { ExternalAudioDevice } from '../ExternalAudioDevice';
import { clamp, defaultReverbSettings, type ReverbSettings } from '../types';

export class ReverbDevice implements ExternalAudioDevice<'reverb'> {
  readonly id = 'reverb' as const;
  readonly name = 'Reverb';
  readonly deviceType = 'reverb';
  readonly stateVersion = 1;
  readonly includeInPresets = true;
  readonly input: GainNode;
  readonly output: GainNode;

  private readonly bypassGain: GainNode;
  private readonly dryGain: GainNode;
  private readonly wetGain: GainNode;
  private readonly preDelay: DelayNode;
  private readonly convolver: ConvolverNode;
  private readonly toneFilter: BiquadFilterNode;
  private settings: ReverbSettings = { ...defaultReverbSettings };
  private impulseSignature = '';

  constructor(private readonly context: AudioContext) {
    this.input = this.context.createGain();
    this.output = this.context.createGain();
    this.bypassGain = this.context.createGain();
    this.dryGain = this.context.createGain();
    this.wetGain = this.context.createGain();
    this.preDelay = this.context.createDelay(0.25);
    this.convolver = this.context.createConvolver();
    this.toneFilter = this.context.createBiquadFilter();

    this.toneFilter.type = 'lowpass';
    this.input.connect(this.bypassGain).connect(this.output);
    this.input.connect(this.dryGain).connect(this.output);
    this.input.connect(this.preDelay).connect(this.convolver).connect(this.toneFilter).connect(this.wetGain).connect(this.output);
    this.applySettings(true);
  }

  getSettings(): ReverbSettings {
    return { ...this.settings };
  }

  getSerializableState(): ReverbSettings {
    return this.getSettings();
  }

  applySerializableState(state: unknown): void {
    if (state && typeof state === 'object') {
      this.updateSettings(state as Partial<ReverbSettings>);
    }
  }

  updateSettings(settings: Partial<ReverbSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.applySettings();
  }

  setEnabled(enabled: boolean): void {
    this.updateSettings({ enabled });
  }

  connect(destination: AudioNode): AudioNode {
    return this.output.connect(destination);
  }

  disconnect(): void {
    this.output.disconnect();
  }

  dispose(): void {
    this.input.disconnect();
    this.output.disconnect();
    this.bypassGain.disconnect();
    this.dryGain.disconnect();
    this.wetGain.disconnect();
    this.preDelay.disconnect();
    this.convolver.disconnect();
    this.toneFilter.disconnect();
  }

  private applySettings(forceImpulse = false): void {
    const now = this.context.currentTime;
    const mix = clamp(this.settings.mix, 0, 1);
    const preDelay = clamp(this.settings.preDelay, 0, 0.2);
    const tone = clamp(this.settings.tone, 0, 1);

    this.bypassGain.gain.setTargetAtTime(this.settings.enabled ? 0 : 1, now, 0.015);
    this.dryGain.gain.setTargetAtTime(this.settings.enabled ? 1 - mix * 0.55 : 0, now, 0.015);
    this.wetGain.gain.setTargetAtTime(this.settings.enabled ? mix : 0, now, 0.02);
    this.preDelay.delayTime.setTargetAtTime(preDelay, now, 0.02);
    this.toneFilter.frequency.setTargetAtTime(900 + tone * 9000, now, 0.02);

    this.updateImpulseIfNeeded(forceImpulse);
  }

  private updateImpulseIfNeeded(forceImpulse: boolean): void {
    const decay = clamp(this.settings.decay, 0.1, 10);
    const size = clamp(this.settings.size, 0, 1);
    const damping = clamp(this.settings.damping, 0, 1);
    const tone = clamp(this.settings.tone, 0, 1);
    const signature = `${decay.toFixed(2)}:${size.toFixed(2)}:${damping.toFixed(2)}:${tone.toFixed(2)}`;

    if (!forceImpulse && signature === this.impulseSignature) {
      return;
    }

    this.impulseSignature = signature;
    this.convolver.buffer = this.createImpulseResponse(decay, size, damping, tone);
  }

  private createImpulseResponse(decay: number, size: number, damping: number, tone: number): AudioBuffer {
    const sampleRate = this.context.sampleRate;
    const lengthSeconds = clamp(decay * (0.45 + size * 0.75), 0.12, 6);
    const length = Math.max(1, Math.floor(sampleRate * lengthSeconds));
    const buffer = this.context.createBuffer(2, length, sampleRate);
    const left = buffer.getChannelData(0);
    const right = buffer.getChannelData(1);
    const dampingAmount = 0.08 + damping * 0.35;
    const brightness = 0.35 + tone * 0.65;
    let leftLow = 0;
    let rightLow = 0;

    for (let i = 0; i < length; i += 1) {
      const progress = i / length;
      const envelope = Math.pow(1 - progress, 2.2 + damping * 1.6) * Math.exp(-progress * 4.5 / decay);
      const spread = 1 - progress * 0.35;
      const leftNoise = Math.random() * 2 - 1;
      const rightNoise = Math.random() * 2 - 1;

      // A one-pole low-pass inside the impulse makes darker damping without extra runtime nodes.
      leftLow += (leftNoise - leftLow) * dampingAmount;
      rightLow += (rightNoise - rightLow) * dampingAmount;
      left[i] = ((leftNoise * brightness + leftLow * (1 - brightness)) * envelope * spread) / 1.8;
      right[i] = ((rightNoise * brightness + rightLow * (1 - brightness)) * envelope) / 1.8;
    }

    return buffer;
  }
}
