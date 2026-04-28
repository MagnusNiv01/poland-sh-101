import type { ExternalAudioDevice } from '../ExternalAudioDevice';
import { clamp, defaultChorusSettings, type ChorusSettings } from '../types';

export class ChorusDevice implements ExternalAudioDevice<'chorus'> {
  readonly id = 'chorus' as const;
  readonly name = 'Chorus';
  readonly input: GainNode;
  readonly output: GainNode;

  private readonly bypassGain: GainNode;
  private readonly dryGain: GainNode;
  private readonly wetGain: GainNode;
  private readonly wetInput: GainNode;
  private readonly leftDelay: DelayNode;
  private readonly rightDelay: DelayNode;
  private readonly leftFeedback: GainNode;
  private readonly rightFeedback: GainNode;
  private readonly leftPanner: StereoPannerNode;
  private readonly rightPanner: StereoPannerNode;
  private readonly lfo: OscillatorNode;
  private readonly leftDepth: GainNode;
  private readonly rightDepth: GainNode;
  private settings: ChorusSettings = { ...defaultChorusSettings };

  constructor(private readonly context: AudioContext) {
    this.input = this.context.createGain();
    this.output = this.context.createGain();
    this.bypassGain = this.context.createGain();
    this.dryGain = this.context.createGain();
    this.wetGain = this.context.createGain();
    this.wetInput = this.context.createGain();
    this.leftDelay = this.context.createDelay(0.08);
    this.rightDelay = this.context.createDelay(0.08);
    this.leftFeedback = this.context.createGain();
    this.rightFeedback = this.context.createGain();
    this.leftPanner = this.context.createStereoPanner();
    this.rightPanner = this.context.createStereoPanner();
    this.lfo = this.context.createOscillator();
    this.leftDepth = this.context.createGain();
    this.rightDepth = this.context.createGain();

    this.input.connect(this.bypassGain).connect(this.output);
    this.input.connect(this.dryGain).connect(this.output);
    this.input.connect(this.wetInput);
    this.wetInput.connect(this.leftDelay);
    this.wetInput.connect(this.rightDelay);
    this.leftDelay.connect(this.leftPanner).connect(this.wetGain);
    this.rightDelay.connect(this.rightPanner).connect(this.wetGain);
    this.wetGain.connect(this.output);
    this.leftDelay.connect(this.leftFeedback).connect(this.leftDelay);
    this.rightDelay.connect(this.rightFeedback).connect(this.rightDelay);

    this.lfo.connect(this.leftDepth).connect(this.leftDelay.delayTime);
    this.lfo.connect(this.rightDepth).connect(this.rightDelay.delayTime);
    this.lfo.start();
    this.applySettings();
  }

  getSettings(): ChorusSettings {
    return { ...this.settings };
  }

  updateSettings(settings: Partial<ChorusSettings>): void {
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
    this.lfo.stop();
    this.input.disconnect();
    this.output.disconnect();
    this.bypassGain.disconnect();
    this.dryGain.disconnect();
    this.wetGain.disconnect();
    this.wetInput.disconnect();
    this.leftDelay.disconnect();
    this.rightDelay.disconnect();
    this.leftFeedback.disconnect();
    this.rightFeedback.disconnect();
    this.leftPanner.disconnect();
    this.rightPanner.disconnect();
    this.leftDepth.disconnect();
    this.rightDepth.disconnect();
  }

  private applySettings(): void {
    const now = this.context.currentTime;
    const mix = clamp(this.settings.mix, 0, 1);
    const feedback = clamp(this.settings.feedback, 0, 0.65);
    const delayTime = clamp(this.settings.delayTime, 0.006, 0.045);
    const depth = Math.min(clamp(this.settings.depth, 0, 0.018), delayTime * 0.65);
    const stereoWidth = clamp(this.settings.stereoWidth, 0, 1);

    this.bypassGain.gain.setTargetAtTime(this.settings.enabled ? 0 : 1, now, 0.01);
    this.dryGain.gain.setTargetAtTime(this.settings.enabled ? 1 - mix * 0.65 : 0, now, 0.01);
    this.wetGain.gain.setTargetAtTime(this.settings.enabled ? mix : 0, now, 0.01);
    this.leftDelay.delayTime.setTargetAtTime(delayTime, now, 0.01);
    this.rightDelay.delayTime.setTargetAtTime(delayTime * 1.18, now, 0.01);
    this.leftFeedback.gain.setTargetAtTime(feedback, now, 0.015);
    this.rightFeedback.gain.setTargetAtTime(feedback, now, 0.015);
    this.leftDepth.gain.setTargetAtTime(depth, now, 0.02);
    this.rightDepth.gain.setTargetAtTime(-depth, now, 0.02);
    this.leftPanner.pan.setTargetAtTime(-stereoWidth, now, 0.02);
    this.rightPanner.pan.setTargetAtTime(stereoWidth, now, 0.02);
    this.lfo.frequency.setTargetAtTime(clamp(this.settings.rate, 0.05, 8), now, 0.02);
  }
}
