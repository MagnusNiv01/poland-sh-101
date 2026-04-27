export class Smoother {
  private current = 0;
  private target = 0;
  private coefficient: number;

  constructor(sampleRate: number, timeSeconds: number, initialValue = 0) {
    this.coefficient = this.coefficientFromTime(sampleRate, timeSeconds);
    this.current = initialValue;
    this.target = initialValue;
  }

  setTime(sampleRate: number, timeSeconds: number): void {
    this.coefficient = this.coefficientFromTime(sampleRate, timeSeconds);
  }

  setTarget(value: number): void {
    this.target = value;
  }

  next(): number {
    this.current = this.target + this.coefficient * (this.current - this.target);
    return this.current;
  }

  reset(value: number): void {
    this.current = value;
    this.target = value;
  }

  private coefficientFromTime(sampleRate: number, timeSeconds: number): number {
    return Math.exp(-1 / Math.max(1, timeSeconds * sampleRate));
  }
}
