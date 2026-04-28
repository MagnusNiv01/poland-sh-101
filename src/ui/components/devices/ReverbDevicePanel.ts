import { defaultReverbSettings, type ReverbSettings } from '../../../audio/devices/types';
import { createDeviceShell, type DeviceShellElement } from './DeviceShell';
import { createDeviceSlider, type DeviceValueControl } from './deviceControls';

type ReverbDevicePanelOptions = {
  onChange: (settings: Partial<ReverbSettings>) => void;
};

export class ReverbDevicePanel {
  readonly element: DeviceShellElement;
  private settings: ReverbSettings = { ...defaultReverbSettings };
  private readonly controls: {
    [K in Exclude<keyof ReverbSettings, 'enabled'>]: DeviceValueControl<number>;
  };

  constructor(private readonly options: ReverbDevicePanelOptions) {
    this.controls = {
      mix: createDeviceSlider({ label: 'Mix', min: 0, max: 1, step: 0.01, value: this.settings.mix, onChange: (mix) => this.update({ mix }) }),
      decay: createDeviceSlider({ label: 'Decay', min: 0.1, max: 10, step: 0.1, value: this.settings.decay, onChange: (decay) => this.update({ decay }) }),
      preDelay: createDeviceSlider({ label: 'Pre Delay', min: 0, max: 0.2, step: 0.005, value: this.settings.preDelay, onChange: (preDelay) => this.update({ preDelay }) }),
      tone: createDeviceSlider({ label: 'Tone', min: 0, max: 1, step: 0.01, value: this.settings.tone, onChange: (tone) => this.update({ tone }) }),
      size: createDeviceSlider({ label: 'Size', min: 0, max: 1, step: 0.01, value: this.settings.size, onChange: (size) => this.update({ size }) }),
      damping: createDeviceSlider({ label: 'Damping', min: 0, max: 1, step: 0.01, value: this.settings.damping, onChange: (damping) => this.update({ damping }) }),
    };
    this.element = createDeviceShell({
      title: 'Reverb',
      enabled: this.settings.enabled,
      onEnabledChange: (enabled) => this.update({ enabled }),
      children: Object.values(this.controls),
    });
  }

  updateSettings(settings: ReverbSettings): void {
    this.settings = { ...settings };
    this.element.setEnabled(this.settings.enabled);
    this.controls.mix.setValue(this.settings.mix);
    this.controls.decay.setValue(this.settings.decay);
    this.controls.preDelay.setValue(this.settings.preDelay);
    this.controls.tone.setValue(this.settings.tone);
    this.controls.size.setValue(this.settings.size);
    this.controls.damping.setValue(this.settings.damping);
  }

  private update(settings: Partial<ReverbSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.options.onChange(settings);
  }
}
