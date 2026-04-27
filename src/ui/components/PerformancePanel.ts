import type { PolandSh101Patch } from '../../synth/patch';
import { createKnob } from './Knob';
import { createSlider } from './Slider';

type PerformancePanelOptions = {
  patch: PolandSh101Patch;
  onPatchChange: (patch: PolandSh101Patch) => void;
  onPitchBend: (value: number) => void;
};

export class PerformancePanel {
  readonly element: HTMLElement;
  private patch: PolandSh101Patch;
  private readonly onPatchChange: (patch: PolandSh101Patch) => void;

  constructor(options: PerformancePanelOptions) {
    this.patch = { ...options.patch };
    this.onPatchChange = options.onPatchChange;
    this.element = document.createElement('aside');
    this.element.className = 'performance-panel';
    this.element.append(
      this.createHeading(),
      this.createKnobRow(),
      this.createBenderArea(options.onPitchBend),
      this.createSwitchPlaceholders(),
    );
  }

  updatePatch(patch: PolandSh101Patch): void {
    this.patch = { ...patch };
  }

  private setPatch<K extends keyof PolandSh101Patch>(key: K, value: PolandSh101Patch[K]): void {
    this.patch = { ...this.patch, [key]: value };
    this.onPatchChange(this.patch);
  }

  private createHeading(): HTMLElement {
    const heading = document.createElement('h2');
    heading.textContent = 'BENDER / PORTAMENTO';
    return heading;
  }

  private createKnobRow(): HTMLElement {
    const row = document.createElement('div');
    row.className = 'performance-knobs';
    row.append(
      createKnob({ label: 'VOLUME', min: 0, max: 1, step: 0.01, value: this.patch.masterVolume, onChange: (value) => this.setPatch('masterVolume', value) }),
      createKnob({ label: 'PORTAMENTO', min: 0, max: 1.5, step: 0.001, value: this.patch.portamentoTime, onChange: (value) => this.setPatch('portamentoTime', value) }),
    );
    return row;
  }

  private createBenderArea(onPitchBend: (value: number) => void): HTMLElement {
    const area = document.createElement('div');
    area.className = 'bender-area';
    area.append(
      createSlider({ label: 'VCO', min: -1, max: 1, step: 0.01, value: 0, className: 'horizontal-slider bender-slider', onChange: onPitchBend }),
      createSlider({ label: 'VCF', min: 0, max: 1, step: 0.01, value: this.patch.lfoFilterAmount, className: 'horizontal-slider bender-slider', onChange: (value) => this.setPatch('lfoFilterAmount', value) }),
      createSlider({ label: 'LFO MOD', min: 0, max: 12, step: 0.1, value: this.patch.benderLfoModAmount, className: 'horizontal-slider bender-slider', onChange: (value) => this.setPatch('benderLfoModAmount', value) }),
      this.createBenderLever(),
    );
    return area;
  }

  private createBenderLever(): HTMLElement {
    const lever = document.createElement('div');
    lever.className = 'bender-lever';
    const handle = document.createElement('span');
    handle.className = 'bender-handle';
    // Placeholder control: this visual lever is not yet a pointer-driven performance controller.
    lever.append(handle);
    return lever;
  }

  private createSwitchPlaceholders(): HTMLElement {
    const switches = document.createElement('div');
    switches.className = 'performance-switches';
    // Placeholder controls: portamento mode and transpose mode are visual until mode parameters exist.
    switches.append(
      this.createPlaceholder('PORTA MODE'),
      this.createPlaceholder('TRANSPOSE'),
    );
    return switches;
  }

  private createPlaceholder(label: string): HTMLElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'performance-switch';
    button.textContent = label;
    button.addEventListener('click', () => button.classList.toggle('is-on'));
    return button;
  }
}
