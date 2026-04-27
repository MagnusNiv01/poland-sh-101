export class ResonantLowPassFilter {
  private ic1eq = 0;
  private ic2eq = 0;

  process(input: number, cutoffHz: number, resonance: number, sampleRate: number): number {
    const clampedCutoff = Math.min(sampleRate * 0.42, Math.max(18, cutoffHz));
    const clampedResonance = Math.min(0.98, Math.max(0, resonance));
    const g = Math.tan(Math.PI * clampedCutoff / sampleRate);
    const k = 2 - clampedResonance * 1.86;
    const a1 = 1 / (1 + g * (g + k));
    const a2 = g * a1;
    const a3 = g * a2;
    const driven = Math.tanh(input * (1 + clampedResonance * 1.6));
    const v3 = driven - this.ic2eq;
    const v1 = a1 * this.ic1eq + a2 * v3;
    const v2 = this.ic2eq + a2 * this.ic1eq + a3 * v3;
    this.ic1eq = 2 * v1 - this.ic1eq;
    this.ic2eq = 2 * v2 - this.ic2eq;
    return v2;
  }

  reset(): void {
    this.ic1eq = 0;
    this.ic2eq = 0;
  }
}
