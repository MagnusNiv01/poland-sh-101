import { type PolandSh101Patch, defaultPatch } from '../../synth/patch';
import type { WorkletMessage } from '../types';
import { Lfo } from './dsp/Lfo';
import { NoiseGenerator } from './dsp/Noise';
import { Smoother } from './dsp/Smoother';
import { SynthVoice } from './dsp/SynthVoice';

declare const sampleRate: number;
declare class AudioWorkletProcessor {
  readonly port: MessagePort;
  process(inputs: Float32Array[][], outputs: Float32Array[][], parameters: Record<string, Float32Array>): boolean;
}
declare function registerProcessor(name: string, processorCtor: typeof AudioWorkletProcessor): void;

const MAX_POLY_VOICES = 4;

class PolandSh101Processor extends AudioWorkletProcessor {
  private patch: PolandSh101Patch = { ...defaultPatch };
  private readonly voices: SynthVoice[] = [
    new SynthVoice(sampleRate),
    new SynthVoice(sampleRate),
    new SynthVoice(sampleRate),
    new SynthVoice(sampleRate),
  ];
  private readonly lfo = new Lfo();
  private readonly noise = new NoiseGenerator();
  private readonly cutoff = new Smoother(sampleRate, 0.015, 1200);
  private readonly resonance = new Smoother(sampleRate, 0.02, defaultPatch.filterResonance);
  private readonly sawLevel = new Smoother(sampleRate, 0.008, defaultPatch.sawLevel);
  private readonly pulseLevel = new Smoother(sampleRate, 0.008, defaultPatch.pulseLevel);
  private readonly subLevel = new Smoother(sampleRate, 0.008, defaultPatch.subLevel);
  private readonly noiseLevel = new Smoother(sampleRate, 0.008, defaultPatch.noiseLevel);
  private readonly masterVolume = new Smoother(sampleRate, 0.012, defaultPatch.masterVolume);
  private readonly vcaLevel = new Smoother(sampleRate, 0.012, defaultPatch.vcaLevel);
  private readonly filterEnvAmount = new Smoother(sampleRate, 0.02, defaultPatch.filterEnvelopeAmount);
  private readonly filterLfoAmount = new Smoother(sampleRate, 0.02, defaultPatch.filterLfoAmount);
  private readonly filterKeyTracking = new Smoother(sampleRate, 0.02, defaultPatch.filterKeyboardTracking);
  private readonly pwmAmount = new Smoother(sampleRate, 0.015, defaultPatch.pwmAmount);
  private readonly lfoPulseWidthAmount = new Smoother(sampleRate, 0.015, defaultPatch.lfoPulseWidthAmount);
  private readonly lfoPitchAmount = new Smoother(sampleRate, 0.02, defaultPatch.lfoPitchAmount);
  private readonly lfoFilterBenderAmount = new Smoother(sampleRate, 0.02, defaultPatch.lfoFilterAmount);
  private readonly benderLfoModAmount = new Smoother(sampleRate, 0.02, defaultPatch.benderLfoModAmount);
  private readonly pitchBendValue = new Smoother(sampleRate, 0.008, 0);
  private readonly pitchBendAmount = new Smoother(sampleRate, 0.02, defaultPatch.pitchBendAmount);
  private lfoAgeSeconds = 0;
  private allocationAge = 0;

  constructor() {
    super();
    this.port.onmessage = (event: MessageEvent<WorkletMessage>) => this.handleMessage(event.data);
  }

  process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
    const output = outputs[0];
    const left = output[0];
    const right = output[1] ?? left;
    const patch = this.patch;
    this.updateSmoothTargets(patch);

    for (let i = 0; i < left.length; i += 1) {
      if (this.hasGateOnVoices()) {
        this.lfoAgeSeconds += 1 / sampleRate;
      }

      const lfoDelayGain = patch.lfoDelay <= 0 ? 1 : Math.min(1, this.lfoAgeSeconds / patch.lfoDelay);
      const lfoValue = this.lfo.next(patch.lfoRate, patch.lfoWaveform, sampleRate) * lfoDelayGain;
      const bendSemitones = this.pitchBendValue.next() * this.pitchBendAmount.next();
      const pitchLfoSemitones = lfoValue * (this.lfoPitchAmount.next() + this.benderLfoModAmount.next());
      const cutoffBase = this.cutoffFromControl(patch.filterCutoff);
      this.cutoff.setTarget(cutoffBase);
      const smoothedCutoffBase = this.cutoff.next();
      const rangeMultiplier = this.rangeMultiplier(patch.vcoRange);
      const sawLevel = this.sawLevel.next();
      const pulseLevel = this.pulseLevel.next();
      const subLevel = this.subLevel.next();
      const noiseSample = this.noise.nextWhite() * this.noiseLevel.next();
      const resonance = this.resonance.next();
      const filterEnvAmount = this.filterEnvAmount.next();
      const filterLfoAmount = this.filterLfoAmount.next();
      const filterLfoBenderAmount = this.lfoFilterBenderAmount.next();
      const filterKeyTracking = this.filterKeyTracking.next();
      const pwmAmount = this.pwmAmount.next();
      const lfoPulseWidthAmount = this.lfoPulseWidthAmount.next();
      const vcaLevel = this.vcaLevel.next();
      const masterVolume = this.masterVolume.next();
      const activeVoiceLimit = this.activeVoiceLimit(patch);
      let mixedVoices = 0;

      for (let voiceIndex = 0; voiceIndex < activeVoiceLimit; voiceIndex += 1) {
        mixedVoices += this.voices[voiceIndex].next(
          patch,
          sampleRate,
          lfoValue,
          bendSemitones,
          pitchLfoSemitones,
          rangeMultiplier,
          sawLevel,
          pulseLevel,
          subLevel,
          noiseSample,
          smoothedCutoffBase,
          resonance,
          filterEnvAmount,
          filterLfoAmount,
          filterLfoBenderAmount,
          filterKeyTracking,
          pwmAmount,
          lfoPulseWidthAmount,
          vcaLevel,
        );
      }

      const voiceGain = this.isPolyMode(patch) ? 0.52 : 1;
      const shaped = this.softClip(mixedVoices * voiceGain * masterVolume);

      left[i] = shaped;
      right[i] = shaped;
    }

    return true;
  }

  private handleMessage(message: WorkletMessage): void {
    if (message.type === 'patch') {
      this.patch = { ...message.patch };
      if (!this.isPolyMode(this.patch)) {
        for (let index = 1; index < this.voices.length; index += 1) {
          this.voices[index].kill();
        }
      }
      return;
    }
    if (message.type === 'noteOn') {
      const wasIdle = !this.hasActiveVoices();
      if (wasIdle) {
        this.lfoAgeSeconds = 0;
      }
      if (this.isPolyMode(this.patch)) {
        this.allocatePolyVoice(message.note, message.frequency, message.velocity);
      } else {
        this.startMonoVoice(message.note, message.frequency, message.velocity);
      }
      return;
    }
    if (message.type === 'noteOff') {
      this.releaseNote(message.note);
      return;
    }
    if (message.type === 'pitchBend') {
      this.pitchBendValue.setTarget(Math.max(-1, Math.min(1, message.value)));
      return;
    }
    if (message.type === 'allNotesOff') {
      this.killAllVoices();
    }
  }

  private startMonoVoice(note: number, frequency: number, velocity: number): void {
    for (let index = 1; index < this.voices.length; index += 1) {
      this.voices[index].kill();
    }
    const portamentoTime = Math.max(0, this.patch.portamentoTime);
    this.voices[0].noteOn(
      note,
      frequency,
      velocity,
      sampleRate,
      portamentoTime,
      portamentoTime <= 0.002,
      this.nextAllocationAge(),
      this.rangeMultiplier(this.patch.vcoRange),
    );
  }

  private allocatePolyVoice(note: number, frequency: number, velocity: number): void {
    const voice = this.findPolyVoice();
    voice.noteOn(
      note,
      frequency,
      velocity,
      sampleRate,
      0,
      true,
      this.nextAllocationAge(),
      this.rangeMultiplier(this.patch.vcoRange),
    );
  }

  private findPolyVoice(): SynthVoice {
    const limit = this.activeVoiceLimit(this.patch);
    for (let index = 0; index < limit; index += 1) {
      if (!this.voices[index].isActive()) {
        return this.voices[index];
      }
    }

    let oldestIndex = 0;
    let oldestAge = this.voices[0].getAge();
    for (let index = 1; index < limit; index += 1) {
      const voiceAge = this.voices[index].getAge();
      if (voiceAge < oldestAge) {
        oldestAge = voiceAge;
        oldestIndex = index;
      }
    }
    return this.voices[oldestIndex];
  }

  private releaseNote(note: number): void {
    const limit = this.activeVoiceLimit(this.patch);
    for (let index = 0; index < limit; index += 1) {
      if (this.voices[index].getNote() === note) {
        this.voices[index].noteOff();
      }
    }
  }

  private killAllVoices(): void {
    for (let index = 0; index < this.voices.length; index += 1) {
      this.voices[index].kill();
    }
  }

  private hasActiveVoices(): boolean {
    for (let index = 0; index < this.voices.length; index += 1) {
      if (this.voices[index].isActive()) {
        return true;
      }
    }
    return false;
  }

  private hasGateOnVoices(): boolean {
    for (let index = 0; index < this.voices.length; index += 1) {
      if (this.voices[index].isGateOn()) {
        return true;
      }
    }
    return false;
  }

  private nextAllocationAge(): number {
    this.allocationAge += 1;
    if (this.allocationAge > 1000000000) {
      this.allocationAge = 1;
    }
    return this.allocationAge;
  }

  private isPolyMode(patch: PolandSh101Patch): boolean {
    return patch.voiceMode === 'poly';
  }

  private activeVoiceLimit(patch: PolandSh101Patch): number {
    if (!this.isPolyMode(patch)) {
      return 1;
    }
    return Math.max(1, Math.min(MAX_POLY_VOICES, Math.floor(patch.maxVoices || MAX_POLY_VOICES)));
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

  private softClip(value: number): number {
    return Math.tanh(value);
  }

  private updateSmoothTargets(patch: PolandSh101Patch): void {
    this.sawLevel.setTarget(patch.sawLevel);
    this.pulseLevel.setTarget(patch.pulseLevel);
    this.subLevel.setTarget(patch.subLevel);
    this.noiseLevel.setTarget(patch.noiseLevel);
    this.masterVolume.setTarget(patch.masterVolume);
    this.vcaLevel.setTarget(patch.vcaLevel);
    this.resonance.setTarget(patch.filterResonance);
    this.filterEnvAmount.setTarget(patch.filterEnvelopeAmount);
    this.filterLfoAmount.setTarget(patch.filterLfoAmount);
    this.filterKeyTracking.setTarget(patch.filterKeyboardTracking);
    this.pwmAmount.setTarget(patch.pwmAmount);
    this.lfoPulseWidthAmount.setTarget(patch.lfoPulseWidthAmount);
    this.lfoPitchAmount.setTarget(patch.lfoPitchAmount);
    this.lfoFilterBenderAmount.setTarget(patch.lfoFilterAmount);
    this.benderLfoModAmount.setTarget(patch.benderLfoModAmount);
    this.pitchBendAmount.setTarget(patch.pitchBendAmount);
  }
}

registerProcessor('poland-sh-101-processor', PolandSh101Processor);
