import { defaultReverbSettings, type ReverbSettings } from '../../../audio/devices/types';
import { createDeviceShell } from './DeviceShell';
import { createDeviceSlider } from './deviceControls';

type ReverbDevicePanelOptions = {
  onChange: (settings: Partial<ReverbSettings>) => void;
};

export class ReverbDevicePanel {
  readonly element: HTMLElement;
  private settings: ReverbSettings = { ...defaultReverbSettings };

  constructor(private readonly options: ReverbDevicePanelOptions) {
    this.element = createDeviceShell({
      title: 'Reverb',
      enabled: this.settings.enabled,
      onEnabledChange: (enabled) => this.update({ enabled }),
      children: [
        createDeviceSlider({ label: 'Mix', min: 0, max: 1, step: 0.01, value: this.settings.mix, onChange: (mix) => this.update({ mix }) }),
        createDeviceSlider({ label: 'Decay', min: 0.1, max: 10, step: 0.1, value: this.settings.decay, onChange: (decay) => this.update({ decay }) }),
        createDeviceSlider({ label: 'Pre Delay', min: 0, max: 0.2, step: 0.005, value: this.settings.preDelay, onChange: (preDelay) => this.update({ preDelay }) }),
        createDeviceSlider({ label: 'Tone', min: 0, max: 1, step: 0.01, value: this.settings.tone, onChange: (tone) => this.update({ tone }) }),
        createDeviceSlider({ label: 'Size', min: 0, max: 1, step: 0.01, value: this.settings.size, onChange: (size) => this.update({ size }) }),
        createDeviceSlider({ label: 'Damping', min: 0, max: 1, step: 0.01, value: this.settings.damping, onChange: (damping) => this.update({ damping }) }),
      ],
    });
  }

  private update(settings: Partial<ReverbSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.options.onChange(settings);
  }
}
