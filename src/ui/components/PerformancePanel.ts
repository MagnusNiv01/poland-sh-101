import type { PolandSh101Patch } from '../../synth/patch';
import { createKnob } from './Knob';

type PerformancePanelOptions = {
  patch: PolandSh101Patch;
  onPatchChange: (patch: PolandSh101Patch) => void;
  onPitchBend: (value: number) => void;
};

export class PerformancePanel {
  readonly element: HTMLElement;
  private patch: PolandSh101Patch;
  private readonly onPatchChange: (patch: PolandSh101Patch) => void;
  private portamentoControl: HTMLElement | null = null;
  private voiceModeControl: HTMLElement | null = null;

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
    this.syncPortamentoState();
    this.syncVoiceModeState();
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
    this.portamentoControl = createKnob({
      label: 'PORTAMENTO',
      min: 0,
      max: 1.5,
      step: 0.001,
      value: this.patch.portamentoTime,
      onChange: (value) => this.setPatch('portamentoTime', value),
    });
    this.voiceModeControl = this.createVoiceModeControl();
    row.append(
      createKnob({ label: 'VOLUME', min: 0, max: 1, step: 0.01, value: this.patch.masterVolume, onChange: (value) => this.setPatch('masterVolume', value) }),
      this.portamentoControl,
      this.voiceModeControl,
    );
    this.syncPortamentoState();
    this.syncVoiceModeState();
    return row;
  }

  private createVoiceModeControl(): HTMLElement {
    const wrap = document.createElement('div');
    wrap.className = 'control voice-mode-control';

    const label = document.createElement('span');
    label.className = 'control-label';
    label.textContent = 'VOICE MODE';

    const switchGroup = document.createElement('div');
    switchGroup.className = 'voice-mode-switch';
    switchGroup.setAttribute('role', 'group');
    switchGroup.setAttribute('aria-label', 'Voice mode');

    const mono = this.createVoiceModeButton('MONO', 'mono');
    const poly = this.createVoiceModeButton('POLY', 'poly');
    switchGroup.append(mono, poly);
    wrap.append(label, switchGroup);
    return wrap;
  }

  private createVoiceModeButton(label: string, mode: PolandSh101Patch['voiceMode']): HTMLButtonElement {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'voice-mode-option';
    button.dataset.voiceMode = mode;
    button.textContent = label;
    button.addEventListener('click', () => this.setPatch('voiceMode', mode));
    return button;
  }

  private createBenderArea(onPitchBend: (value: number) => void): HTMLElement {
    const area = document.createElement('div');
    area.className = 'bender-area';
    area.append(
      this.createBenderAmountSlider({
        label: 'VCO',
        min: -1,
        max: 1,
        step: 0.01,
        value: 0,
        format: (value) => (Math.abs(value) < 0.005 ? 'CENTER' : `${value > 0 ? '+' : ''}${Math.round(value * 100)}%`),
        onChange: onPitchBend,
      }),
      this.createBenderAmountSlider({
        label: 'VCF',
        min: 0,
        max: 1,
        step: 0.01,
        value: this.patch.lfoFilterAmount,
        format: (value) => `${Math.round(value * 100)}%`,
        onChange: (value) => this.setPatch('lfoFilterAmount', value),
      }),
      this.createBenderAmountSlider({
        label: 'LFO MOD',
        min: 0,
        max: 12,
        step: 0.1,
        value: this.patch.benderLfoModAmount,
        format: (value) => value.toFixed(1).replace(/\.0$/, ''),
        onChange: (value) => this.setPatch('benderLfoModAmount', value),
      }),
      this.createBenderLever(onPitchBend),
    );
    return area;
  }

  private createBenderAmountSlider(options: {
    label: string;
    min: number;
    max: number;
    step: number;
    value: number;
    format: (value: number) => string;
    onChange: (value: number) => void;
  }): HTMLElement {
    const wrap = document.createElement('label');
    wrap.className = 'bender-amount';

    const label = document.createElement('span');
    label.className = 'bender-amount-label';
    label.textContent = options.label;

    const input = document.createElement('input');
    input.type = 'range';
    input.min = String(options.min);
    input.max = String(options.max);
    input.step = String(options.step);
    input.value = String(options.value);

    const value = document.createElement('span');
    value.className = 'bender-amount-value';
    const setValue = (nextValue: number) => {
      value.textContent = options.format(nextValue);
    };
    setValue(options.value);

    input.addEventListener('input', () => {
      const nextValue = Number(input.value);
      setValue(nextValue);
      options.onChange(nextValue);
    });

    wrap.append(label, input, value);
    return wrap;
  }

  private createBenderLever(onPitchBend: (value: number) => void): HTMLElement {
    const lever = document.createElement('button');
    lever.type = 'button';
    lever.className = 'bender-lever';
    const handle = document.createElement('span');
    handle.className = 'bender-handle';
    const center = document.createElement('span');
    center.className = 'bender-center';
    const setBend = (value: number) => {
      const clamped = Math.min(1, Math.max(-1, value));
      handle.style.setProperty('--bend-position', `${clamped * 42}px`);
      onPitchBend(clamped);
    };
    const release = () => {
      setBend(0);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', release);
      window.removeEventListener('pointercancel', release);
    };
    const move = (event: PointerEvent) => {
      const rect = lever.getBoundingClientRect();
      const value = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      setBend(value);
    };
    lever.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      lever.setPointerCapture(event.pointerId);
      move(event);
      window.addEventListener('pointermove', move);
      window.addEventListener('pointerup', release);
      window.addEventListener('pointercancel', release);
    });
    lever.addEventListener('keydown', (event) => {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        setBend(-1);
      }
      if (event.key === 'ArrowRight') {
        event.preventDefault();
        setBend(1);
      }
    });
    lever.addEventListener('keyup', () => setBend(0));
    lever.setAttribute('aria-label', 'Pitch bend lever');
    handle.style.setProperty('--bend-position', '0px');
    lever.append(center, handle);
    return lever;
  }

  private createSwitchPlaceholders(): HTMLElement {
    const switches = document.createElement('div');
    switches.className = 'performance-switches';
    switches.append(
      // TODO: Map PORTA MODE to a typed portamento mode such as off, always, or legato.
      this.createPlaceholder('PORTA MODE'),
      // TODO: Map TRANSPOSE to a typed transpose mode or octave switch.
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

  private syncPortamentoState(): void {
    if (!this.portamentoControl) {
      return;
    }
    const isPoly = this.patch.voiceMode === 'poly';
    this.portamentoControl.classList.toggle('is-disabled', isPoly);
    const input = this.portamentoControl.querySelector('input');
    if (input instanceof HTMLInputElement) {
      input.disabled = isPoly;
      input.value = String(this.patch.portamentoTime);
    }
  }

  private syncVoiceModeState(): void {
    if (!this.voiceModeControl) {
      return;
    }
    for (const button of this.voiceModeControl.querySelectorAll<HTMLButtonElement>('.voice-mode-option')) {
      const isActive = button.dataset.voiceMode === this.patch.voiceMode;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', String(isActive));
    }
  }
}
