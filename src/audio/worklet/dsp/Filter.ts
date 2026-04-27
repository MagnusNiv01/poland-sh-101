export class ResonantLowPassFilter {
  private low = 0;
  private band = 0;

  process(input: number, cutoffHz: number, resonance: number, sampleRate: number): number {
    const clampedCutoff = Math.min(sampleRate * 0.45, Math.max(20, cutoffHz));
    const f = 2 * Math.sin(Math.PI * clampedCutoff / sampleRate);
    const q = Math.max(0.05, 1.95 - resonance * 1.8);
    this.low += f * this.band;
    const high = input - this.low - q * this.band;
    this.band += f * high;
    return this.low;
  }

  reset(): void {
    this.low = 0;
    this.band = 0;
  }
}
