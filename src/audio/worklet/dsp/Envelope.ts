type EnvelopeStage = 'idle' | 'attack' | 'decay' | 'sustain' | 'release';

export class AdsrEnvelope {
  private stage: EnvelopeStage = 'idle';
  private value = 0;

  gateOn(): void {
    this.stage = 'attack';
  }

  gateOff(): void {
    if (this.stage !== 'idle') {
      this.stage = 'release';
    }
  }

  reset(): void {
    this.stage = 'idle';
    this.value = 0;
  }

  isActive(): boolean {
    return this.stage !== 'idle' || this.value > 0.0005;
  }

  next(sampleRate: number, attack: number, decay: number, sustain: number, release: number): number {
    if (this.stage === 'attack') {
      this.value += (1 - this.value) * coefficient(sampleRate, attack);
      if (this.value >= 0.999) {
        this.value = 1;
        this.stage = 'decay';
      }
    } else if (this.stage === 'decay') {
      this.value += (sustain - this.value) * coefficient(sampleRate, decay);
      if (Math.abs(this.value - sustain) < 0.001) {
        this.value = sustain;
        this.stage = 'sustain';
      }
    } else if (this.stage === 'sustain') {
      this.value = sustain;
    } else if (this.stage === 'release') {
      this.value += (0 - this.value) * coefficient(sampleRate, release);
      if (this.value <= 0.0005) {
        this.value = 0;
        this.stage = 'idle';
      }
    }

    return this.value;
  }
}

function coefficient(sampleRate: number, timeSeconds: number): number {
  return 1 - Math.exp(-1 / Math.max(1, timeSeconds * sampleRate * 0.22));
}
