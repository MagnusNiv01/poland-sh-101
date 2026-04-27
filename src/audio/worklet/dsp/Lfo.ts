import type { LfoWaveform } from '../../../synth/patch';

export class Lfo {
  private phase = 0;
  private randomValue = 0;
  private noiseState = 1;

  next(rate: number, waveform: LfoWaveform, sampleRate: number): number {
    const previousPhase = this.phase;
    this.phase += Math.max(0.01, rate) / sampleRate;
    if (this.phase >= 1) {
      this.phase -= Math.floor(this.phase);
    }

    if (waveform === 'sine') {
      return Math.sin(this.phase * Math.PI * 2);
    }
    if (waveform === 'triangle') {
      return 1 - 4 * Math.abs(Math.round(this.phase - 0.25) - (this.phase - 0.25));
    }
    if (waveform === 'saw') {
      return this.phase * 2 - 1;
    }
    if (waveform === 'square') {
      return this.phase < 0.5 ? 1 : -1;
    }
    if (waveform === 'random') {
      if (this.phase < previousPhase) {
        this.randomValue = this.random() * 2 - 1;
      }
      return this.randomValue;
    }
    return this.random() * 2 - 1;
  }

  private random(): number {
    this.noiseState = (this.noiseState * 1664525 + 1013904223) | 0;
    return ((this.noiseState >>> 0) / 4294967295);
  }
}
