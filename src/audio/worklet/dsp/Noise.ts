export class NoiseGenerator {
  private state = 22222;

  nextWhite(): number {
    this.state = (this.state * 1664525 + 1013904223) | 0;
    return ((this.state >>> 0) / 2147483647) - 1;
  }
}
