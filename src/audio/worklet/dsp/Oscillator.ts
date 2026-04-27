export class SawOscillator {
  private phase = 0;

  next(frequency: number, sampleRate: number): number {
    const phaseIncrement = frequency / sampleRate;
    const phase = this.phase;
    let value = phase * 2 - 1;
    value -= polyBlep(phase, phaseIncrement);

    this.phase += phaseIncrement;
    if (this.phase >= 1) {
      this.phase -= Math.floor(this.phase);
    }
    return value;
  }
}

export class PulseOscillator {
  private phase = 0;

  next(frequency: number, sampleRate: number, pulseWidth: number): number {
    const phaseIncrement = frequency / sampleRate;
    const width = clampPulseWidth(pulseWidth);
    const phase = this.phase;
    let value = phase < width ? 1 : -1;

    value += polyBlep(phase, phaseIncrement);
    let fallingEdgePhase = phase - width;
    if (fallingEdgePhase < 0) {
      fallingEdgePhase += 1;
    }
    value -= polyBlep(fallingEdgePhase, phaseIncrement);

    this.phase += phaseIncrement;
    if (this.phase >= 1) {
      this.phase -= Math.floor(this.phase);
    }
    return value;
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

function polyBlep(phase: number, phaseIncrement: number): number {
  if (phase < phaseIncrement) {
    const t = phase / phaseIncrement;
    return t + t - t * t - 1;
  }
  if (phase > 1 - phaseIncrement) {
    const t = (phase - 1) / phaseIncrement;
    return t * t + t + t + 1;
  }
  return 0;
}
