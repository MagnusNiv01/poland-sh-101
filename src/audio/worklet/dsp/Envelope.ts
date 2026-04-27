type EnvelopeStage = 'idle' | 'attack' | 'decay' | 'sustain' | 'release';

export class AdsrEnvelope {
  private stage: EnvelopeStage = 'idle';
  private value = 0;
  private releaseStart = 0;

  gateOn(): void {
    this.stage = 'attack';
  }

  gateOff(): void {
    this.releaseStart = this.value;
    this.stage = 'release';
  }

  reset(): void {
    this.stage = 'idle';
    this.value = 0;
    this.releaseStart = 0;
  }

  next(sampleRate: number, attack: number, decay: number, sustain: number, release: number): number {
    if (this.stage === 'attack') {
      this.value += 1 / Math.max(1, attack * sampleRate);
      if (this.value >= 1) {
        this.value = 1;
        this.stage = 'decay';
      }
    } else if (this.stage === 'decay') {
      this.value += (sustain - this.value) / Math.max(1, decay * sampleRate);
      if (Math.abs(this.value - sustain) < 0.001) {
        this.value = sustain;
        this.stage = 'sustain';
      }
    } else if (this.stage === 'sustain') {
      this.value = sustain;
    } else if (this.stage === 'release') {
      this.value -= this.releaseStart / Math.max(1, release * sampleRate);
      if (this.value <= 0) {
        this.value = 0;
        this.stage = 'idle';
      }
    }

    return this.value;
  }
}
