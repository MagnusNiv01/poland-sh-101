export class PolyBlepSawOscillator {
  private phase = 0;

  next(frequency: number, sampleRate: number): number {
    const phaseIncrement = normalizedPhaseIncrement(frequency, sampleRate);
    const phase = this.phase;
    let value = phase * 2 - 1;

    // PolyBLEP subtracts a small correction at the discontinuity to reduce aliasing.
    value -= polyBlep(phase, phaseIncrement);

    this.phase = wrapPhase(this.phase + phaseIncrement);
    return value;
  }
}

export class PolyBlepPulseOscillator {
  private phase = 0;

  next(frequency: number, sampleRate: number, pulseWidth: number): number {
    const phaseIncrement = normalizedPhaseIncrement(frequency, sampleRate);
    const width = clampPulseWidth(pulseWidth);
    const phase = this.phase;
    let value = phase < width ? 1 : -1;

    // Correct both edges of the pulse so PWM stays smoother in high registers.
    value += polyBlep(phase, phaseIncrement);
    let fallingEdgePhase = phase - width;
    if (fallingEdgePhase < 0) {
      fallingEdgePhase += 1;
    }
    value -= polyBlep(fallingEdgePhase, phaseIncrement);

    this.phase = wrapPhase(this.phase + phaseIncrement);
    return value;
  }
}

export class PolyBlepSubOscillator {
  private phase = 0;

  next(frequency: number, sampleRate: number, divisor: number, narrow: boolean): number {
    const phaseIncrement = normalizedPhaseIncrement(frequency / Math.max(1, divisor), sampleRate);
    const width = narrow ? 0.25 : 0.5;
    const phase = this.phase;
    let value = phase < width ? 1 : -1;

    value += polyBlep(phase, phaseIncrement);
    let fallingEdgePhase = phase - width;
    if (fallingEdgePhase < 0) {
      fallingEdgePhase += 1;
    }
    value -= polyBlep(fallingEdgePhase, phaseIncrement);

    this.phase = wrapPhase(this.phase + phaseIncrement);
    return value;
  }
}

export const SawOscillator = PolyBlepSawOscillator;
export const PulseOscillator = PolyBlepPulseOscillator;
export const SubOscillator = PolyBlepSubOscillator;

export function clampPulseWidth(value: number): number {
  return Math.min(0.95, Math.max(0.05, value));
}

function normalizedPhaseIncrement(frequency: number, sampleRate: number): number {
  return Math.min(0.49, Math.max(0, frequency / sampleRate));
}

function wrapPhase(phase: number): number {
  return phase >= 1 ? phase - Math.floor(phase) : phase;
}

function polyBlep(phase: number, phaseIncrement: number): number {
  if (phaseIncrement <= 0) {
    return 0;
  }
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
