export class AnalogStyleLowPassFilter {
  private section1Ic1 = 0;
  private section1Ic2 = 0;
  private section2Ic1 = 0;
  private section2Ic2 = 0;
  private lastOutput = 0;

  process(input: number, cutoffHz: number, resonance: number, sampleRate: number): number {
    const clampedCutoff = Math.min(sampleRate * 0.40, Math.max(18, cutoffHz));
    const clampedResonance = Math.min(0.97, Math.max(0, resonance));
    const g = Math.tan(Math.PI * clampedCutoff / sampleRate);
    const damping = 1.18 - clampedResonance * 0.42;
    const feedback = clampedResonance * 2.85;
    const drive = 1.05 + clampedResonance * 0.95;

    // Two TPT state-variable low-pass sections are cascaded for a smoother,
    // synth-like four-pole response. Global feedback and tanh drive add a
    // controlled analog-style resonance character without unstable runaway.
    const driven = Math.tanh((input - this.lastOutput * feedback) * drive);
    const first = this.processSection(driven, g, damping, 1);
    const secondInput = Math.tanh(first * (1 + clampedResonance * 0.25));
    const second = this.processSection(secondInput, g, damping, 2);
    const output = this.sanitize(second * (1 + clampedResonance * 0.18));
    this.lastOutput = output;
    return output;
  }

  reset(): void {
    this.section1Ic1 = 0;
    this.section1Ic2 = 0;
    this.section2Ic1 = 0;
    this.section2Ic2 = 0;
    this.lastOutput = 0;
  }

  private processSection(input: number, g: number, damping: number, section: 1 | 2): number {
    const ic1 = section === 1 ? this.section1Ic1 : this.section2Ic1;
    const ic2 = section === 1 ? this.section1Ic2 : this.section2Ic2;
    const a1 = 1 / (1 + g * (g + damping));
    const a2 = g * a1;
    const a3 = g * a2;
    const v3 = input - ic2;
    const v1 = a1 * ic1 + a2 * v3;
    const v2 = ic2 + a2 * ic1 + a3 * v3;

    if (section === 1) {
      this.section1Ic1 = this.sanitize(2 * v1 - ic1);
      this.section1Ic2 = this.sanitize(2 * v2 - ic2);
    } else {
      this.section2Ic1 = this.sanitize(2 * v1 - ic1);
      this.section2Ic2 = this.sanitize(2 * v2 - ic2);
    }

    return v2;
  }

  private sanitize(value: number): number {
    if (!Number.isFinite(value)) {
      this.reset();
      return 0;
    }
    return Math.max(-4, Math.min(4, value));
  }
}

export const ResonantLowPassFilter = AnalogStyleLowPassFilter;
