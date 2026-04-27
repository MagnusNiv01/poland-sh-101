import type { PolandSh101Patch } from '../../synth/patch';
import { createKnob } from './Knob';
import { createSlider } from './Slider';
import { createSwitch } from './Switch';

type PanelOptions = {
  patch: PolandSh101Patch;
  onPatchChange: (patch: PolandSh101Patch) => void;
  onPitchBend: (value: number) => void;
};

export class SynthPanel {
  readonly element: HTMLElement;
  private patch: PolandSh101Patch;
  private readonly onPatchChange: (patch: PolandSh101Patch) => void;

  constructor(options: PanelOptions) {
    this.patch = { ...options.patch };
    this.onPatchChange = options.onPatchChange;
    this.element = document.createElement('section');
    this.element.className = 'synth-panel';
    this.element.append(
      this.createJackStrip(),
      this.createMainControls(options.onPitchBend),
      this.createSequencerStrip(),
    );
  }

  private setPatch<K extends keyof PolandSh101Patch>(key: K, value: PolandSh101Patch[K]): void {
    this.patch = { ...this.patch, [key]: value };
    this.onPatchChange(this.patch);
  }

  private setPwmAmount(value: number): void {
    this.patch = {
      ...this.patch,
      pwmAmount: value,
      lfoPulseWidthAmount: value,
    };
    this.onPatchChange(this.patch);
  }

  private createJackStrip(): HTMLElement {
    const strip = document.createElement('div');
    strip.className = 'jack-strip';
    const labels = ['EXT CLK IN', 'HOLD', 'CV OUT', 'GATE OUT', 'CV IN', 'GATE IN', 'PHONES', 'OUTPUT'];

    // Placeholder controls: jack labels are decorative until external I/O features are implemented.
    for (const label of labels) {
      const item = document.createElement('div');
      item.className = 'jack-item';
      const jack = document.createElement('span');
      jack.className = 'jack-hole';
      const text = document.createElement('span');
      text.textContent = label;
      item.append(jack, text);
      strip.append(item);
    }

    return strip;
  }

  private createMainControls(onPitchBend: (value: number) => void): HTMLElement {
    const grid = document.createElement('div');
    grid.className = 'control-grid';
    grid.append(
      this.section('TUNE', [
        createKnob({ label: 'TUNE', min: -12, max: 12, step: 12, value: this.patch.transpose, className: 'large-tune', onChange: (value) => this.setPatch('transpose', value) }),
      ], 'tune-section'),
      this.section('MODULATOR', [
        createSlider({ label: 'RATE', min: 0.05, max: 18, step: 0.05, value: this.patch.lfoRate, unit: 'Hz', onChange: (value) => this.setPatch('lfoRate', value) }),
        createSlider({ label: 'DELAY', min: 0, max: 3, step: 0.01, value: this.patch.lfoDelay, unit: 's', onChange: (value) => this.setPatch('lfoDelay', value) }),
        createSwitch({ label: 'WAVEFORM', value: this.patch.lfoWaveform, options: [
          { label: 'SIN', value: 'sine' },
          { label: 'TRI', value: 'triangle' },
          { label: 'SAW', value: 'saw' },
          { label: 'SQR', value: 'square' },
          { label: 'S/H', value: 'random' },
          { label: 'NOISE', value: 'noise' },
        ], onChange: (value) => this.setPatch('lfoWaveform', value) }),
      ]),
      this.section('VCO', [
        createSlider({ label: 'MOD', min: 0, max: 12, step: 0.1, value: this.patch.lfoPitchAmount, onChange: (value) => this.setPatch('lfoPitchAmount', value) }),
        createSwitch({ label: 'RANGE', value: this.patch.vcoRange, options: [
          { label: "16'", value: '16' },
          { label: "8'", value: '8' },
          { label: "4'", value: '4' },
          { label: "2'", value: '2' },
        ], onChange: (value) => this.setPatch('vcoRange', value) }),
        createSlider({ label: 'P WIDTH', min: 0.05, max: 0.95, step: 0.01, value: this.patch.pulseWidth, onChange: (value) => this.setPatch('pulseWidth', value) }),
        createSwitch({ label: 'PWM SRC', value: this.patch.pwmSource, options: [
          { label: 'MAN', value: 'manual' },
          { label: 'LFO', value: 'lfo' },
          { label: 'ENV', value: 'envelope' },
        ], onChange: (value) => this.setPatch('pwmSource', value) }),
        createSlider({ label: 'PWM AMT', min: 0, max: 0.45, step: 0.01, value: this.patch.pwmAmount, onChange: (value) => this.setPwmAmount(value) }),
      ]),
      this.section('SOURCE MIXER', [
        createSlider({ label: 'PULSE', min: 0, max: 1, step: 0.01, value: this.patch.pulseLevel, className: 'accent-red', onChange: (value) => this.setPatch('pulseLevel', value) }),
        createSlider({ label: 'SAW', min: 0, max: 1, step: 0.01, value: this.patch.sawLevel, className: 'accent-blue', onChange: (value) => this.setPatch('sawLevel', value) }),
        createSlider({ label: 'SUB OSC', min: 0, max: 1, step: 0.01, value: this.patch.subLevel, className: 'accent-green', onChange: (value) => this.setPatch('subLevel', value) }),
        createSlider({ label: 'NOISE', min: 0, max: 1, step: 0.01, value: this.patch.noiseLevel, className: 'accent-yellow', onChange: (value) => this.setPatch('noiseLevel', value) }),
        createSwitch({ label: 'MODE', value: this.patch.subMode, options: [
          { label: '-1 OCT', value: 'oneOctaveDown' },
          { label: '-2 OCT', value: 'twoOctavesDown' },
          { label: '-2 PLS', value: 'twoOctavesDownNarrow' },
        ], onChange: (value) => this.setPatch('subMode', value) }),
      ], 'mixer-section'),
      this.section('VCF', [
        createSlider({ label: 'FREQ', min: 0, max: 1, step: 0.001, value: this.patch.filterCutoff, className: 'accent-blue', onChange: (value) => this.setPatch('filterCutoff', value) }),
        createSlider({ label: 'RES', min: 0, max: 1, step: 0.001, value: this.patch.filterResonance, className: 'accent-red', onChange: (value) => this.setPatch('filterResonance', value) }),
        createSlider({ label: 'ENV', min: 0, max: 1, step: 0.001, value: this.patch.filterEnvelopeAmount, onChange: (value) => this.setPatch('filterEnvelopeAmount', value) }),
        createSlider({ label: 'LFO', min: 0, max: 1, step: 0.001, value: this.patch.filterLfoAmount, onChange: (value) => this.setPatch('filterLfoAmount', value) }),
        createSlider({ label: 'KYBD', min: 0, max: 1, step: 0.001, value: this.patch.filterKeyboardTracking, onChange: (value) => this.setPatch('filterKeyboardTracking', value) }),
      ], 'wide-section'),
      this.section('VCA', [
        createSwitch({ label: 'MODE', value: this.patch.vcaMode, options: [
          { label: 'GATE', value: 'gate' },
          { label: 'ENV', value: 'envelope' },
        ], onChange: (value) => this.setPatch('vcaMode', value) }),
        createSlider({ label: 'LEVEL', min: 0, max: 1, step: 0.01, value: this.patch.vcaLevel, onChange: (value) => this.setPatch('vcaLevel', value) }),
      ], 'vca-section'),
      this.section('ENVELOPE', [
        createSlider({ label: 'A', min: 0.001, max: 2.5, step: 0.001, value: this.patch.envAttack, className: 'accent-red', onChange: (value) => this.setPatch('envAttack', value) }),
        createSlider({ label: 'D', min: 0.001, max: 3, step: 0.001, value: this.patch.envDecay, className: 'accent-yellow', onChange: (value) => this.setPatch('envDecay', value) }),
        createSlider({ label: 'S', min: 0, max: 1, step: 0.001, value: this.patch.envSustain, className: 'accent-green', onChange: (value) => this.setPatch('envSustain', value) }),
        createSlider({ label: 'R', min: 0.001, max: 4, step: 0.001, value: this.patch.envRelease, className: 'accent-blue', onChange: (value) => this.setPatch('envRelease', value) }),
      ], 'envelope-section'),
    );
    void onPitchBend;
    return grid;
  }

  private createSequencerStrip(): HTMLElement {
    const strip = document.createElement('div');
    strip.className = 'sequencer-strip';
    const buttons = document.createElement('div');
    buttons.className = 'sequencer-buttons';
    strip.append(
      buttons,
      this.createModelLabel(),
    );
    // Placeholder controls: sequencer/arpeggiator actions are visual only until those engines exist.
    for (const label of ['POWER', 'LOAD', 'PLAY', 'DOWN', 'U & D', 'UP', 'HOLD', 'KEY TRANS']) {
      buttons.append(this.placeholderSwitch(label));
    }
    const labels = document.createElement('div');
    labels.className = 'sequencer-labels';
    labels.innerHTML = '<span>SEQUENCER</span><span>ARPEGGIO</span><span>HOLD</span><span>LEGATO</span><span>REST</span>';
    buttons.append(labels);
    return strip;
  }

  private createModelLabel(): HTMLElement {
    const model = document.createElement('div');
    model.className = 'model-label';
    model.innerHTML = '<span class="model-name">Poland SH-101</span><span class="model-subtitle">Monophonic Synthesizer</span>';
    return model;
  }

  private placeholderSwitch(label: string): HTMLElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'placeholder-switch';
    button.textContent = label;
    button.addEventListener('click', () => button.classList.toggle('is-on'));
    return button;
  }

  private section(title: string, controls: HTMLElement[], extraClass = ''): HTMLElement {
    const section = document.createElement('section');
    section.className = `panel-section ${extraClass}`;
    const heading = document.createElement('h2');
    heading.textContent = title;
    const controlsWrap = document.createElement('div');
    controlsWrap.className = 'section-controls';
    controlsWrap.append(...controls);
    section.append(heading, controlsWrap);
    return section;
  }
}
