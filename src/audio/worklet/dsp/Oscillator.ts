export class SawOscillator {
  private phase = 0;

  next(frequency: number, sampleRate: number): number {
    this.phase += frequency / sampleRate;
    if (this.phase >= 1) {
      this.phase -= Math.floor(this.phase);
    }
    return this.phase * 2 - 1;
  }
}

export class PulseOscillator {
  private phase = 0;

  next(frequency: number, sampleRate: number, pulseWidth: number): number {
    this.phase += frequency / sampleRate;
    if (this.phase >= 1) {
      this.phase -= Math.floor(this.phase);
    }
    return this.phase < clampPulseWidth(pulseWidth) ? 1 : -1;
  }
}

export class SubOscillator {
  private phase = 0;

  next(frequency: number, sampleRate: number, divisor: number, narrow: boolean): number {
    this.phase += frequency / (sampleRate * divisor);
    if (this.phase >= 1) {
      this.phase -= Math.floor(this.phase);
    }
    const width = narrow ? 0.25 : 0.5;
    return this.phase < width ? 1 : -1;
  }
}

export function clampPulseWidth(value: number): number {
  return Math.min(0.95, Math.max(0.05, value));
}
