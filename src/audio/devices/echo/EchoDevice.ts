import type { ExternalAudioDevice } from '../ExternalAudioDevice';
import { clamp, defaultEchoSettings, type EchoSettings } from '../types';

export class EchoDevice implements ExternalAudioDevice<'echo'> {
  readonly id = 'echo' as const;
  readonly name = 'Echo';
  readonly input: GainNode;
  readonly output: GainNode;

  private readonly bypassGain: GainNode;
  private readonly dryGain: GainNode;
  private readonly wetGain: GainNode;
  private readonly leftDelay: DelayNode;
  private readonly rightDelay: DelayNode;
  private readonly leftTone: BiquadFilterNode;
  private readonly rightTone: BiquadFilterNode;
  private readonly leftDirectFeedback: GainNode;
  private readonly rightDirectFeedback: GainNode;
  private readonly leftCrossFeedback: GainNode;
  private readonly rightCrossFeedback: GainNode;
  private readonly leftPanner: StereoPannerNode;
  private readonly rightPanner: StereoPannerNode;
  private settings: EchoSettings = { ...defaultEchoSettings };

  constructor(private readonly context: AudioContext) {
    this.input = this.context.createGain();
    this.output = this.context.createGain();
    this.bypassGain = this.context.createGain();
    this.dryGain = this.context.createGain();
    this.wetGain = this.context.createGain();
    this.leftDelay = this.context.createDelay(2);
    this.rightDelay = this.context.createDelay(2);
    this.leftTone = this.context.createBiquadFilter();
    this.rightTone = this.context.createBiquadFilter();
    this.leftDirectFeedback = this.context.createGain();
    this.rightDirectFeedback = this.context.createGain();
    this.leftCrossFeedback = this.context.createGain();
    this.rightCrossFeedback = this.context.createGain();
    this.leftPanner = this.context.createStereoPanner();
    this.rightPanner = this.context.createStereoPanner();

    this.leftTone.type = 'lowpass';
    this.rightTone.type = 'lowpass';

    this.input.connect(this.bypassGain).connect(this.output);
    this.input.connect(this.dryGain).connect(this.output);
    this.input.connect(this.leftDelay);
    this.input.connect(this.rightDelay);

    this.leftDelay.connect(this.leftTone);
    this.rightDelay.connect(this.rightTone);
    this.leftTone.connect(this.leftPanner).connect(this.wetGain);
    this.rightTone.connect(this.rightPanner).connect(this.wetGain);
    this.wetGain.connect(this.output);

    this.leftTone.connect(this.leftDirectFeedback).connect(this.leftDelay);
    this.rightTone.connect(this.rightDirectFeedback).connect(this.rightDelay);
    this.leftTone.connect(this.leftCrossFeedback).connect(this.rightDelay);
    this.rightTone.connect(this.rightCrossFeedback).connect(this.leftDelay);
    this.applySettings();
  }

  getSettings(): EchoSettings {
    return { ...this.settings };
  }

  updateSettings(settings: Partial<EchoSettings>): void {
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
    this.leftDelay.disconnect();
    this.rightDelay.disconnect();
    this.leftTone.disconnect();
    this.rightTone.disconnect();
    this.leftDirectFeedback.disconnect();
    this.rightDirectFeedback.disconnect();
    this.leftCrossFeedback.disconnect();
    this.rightCrossFeedback.disconnect();
    this.leftPanner.disconnect();
    this.rightPanner.disconnect();
  }

  private applySettings(): void {
    const now = this.context.currentTime;
    const mix = clamp(this.settings.mix, 0, 1);
    const feedback = clamp(this.settings.feedback, 0, 0.85);
    const time = clamp(this.settings.time, 0.03, 1.5);
    const spread = clamp(this.settings.stereoSpread, 0, 0.35);
    const toneFrequency = 700 + clamp(this.settings.tone, 0, 1) * 9000;
    const directFeedback = this.settings.pingPong ? 0 : feedback;
    const crossFeedback = this.settings.pingPong ? feedback : 0;

    // Placeholder setting: syncEnabled is stored for future tempo sync but does not affect time yet.
    this.bypassGain.gain.setTargetAtTime(this.settings.enabled ? 0 : 1, now, 0.01);
    this.dryGain.gain.setTargetAtTime(this.settings.enabled ? 1 - mix * 0.45 : 0, now, 0.01);
    this.wetGain.gain.setTargetAtTime(this.settings.enabled ? mix : 0, now, 0.015);
    this.leftDelay.delayTime.setTargetAtTime(time, now, 0.02);
    this.rightDelay.delayTime.setTargetAtTime(clamp(time + spread, 0.03, 1.5), now, 0.02);
    this.leftTone.frequency.setTargetAtTime(toneFrequency, now, 0.02);
    this.rightTone.frequency.setTargetAtTime(toneFrequency, now, 0.02);
    this.leftDirectFeedback.gain.setTargetAtTime(directFeedback, now, 0.02);
    this.rightDirectFeedback.gain.setTargetAtTime(directFeedback, now, 0.02);
    this.leftCrossFeedback.gain.setTargetAtTime(crossFeedback, now, 0.02);
    this.rightCrossFeedback.gain.setTargetAtTime(crossFeedback, now, 0.02);
    this.leftPanner.pan.setTargetAtTime(-0.45, now, 0.02);
    this.rightPanner.pan.setTargetAtTime(0.45, now, 0.02);
  }
}
