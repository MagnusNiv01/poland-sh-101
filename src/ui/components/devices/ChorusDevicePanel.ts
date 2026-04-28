import { defaultChorusSettings, type ChorusSettings } from '../../../audio/devices/types';
import { createDeviceShell } from './DeviceShell';
import { createDeviceSlider } from './deviceControls';

type ChorusDevicePanelOptions = {
  onChange: (settings: Partial<ChorusSettings>) => void;
};

export class ChorusDevicePanel {
  readonly element: HTMLElement;
  private settings: ChorusSettings = { ...defaultChorusSettings };

  constructor(private readonly options: ChorusDevicePanelOptions) {
    this.element = createDeviceShell({
      title: 'Chorus',
      enabled: this.settings.enabled,
      onEnabledChange: (enabled) => this.update({ enabled }),
      children: [
        createDeviceSlider({ label: 'Rate', min: 0.05, max: 4, step: 0.01, value: this.settings.rate, onChange: (rate) => this.update({ rate }) }),
        createDeviceSlider({ label: 'Depth', min: 0, max: 0.018, step: 0.001, value: this.settings.depth, onChange: (depth) => this.update({ depth }) }),
        createDeviceSlider({ label: 'Mix', min: 0, max: 1, step: 0.01, value: this.settings.mix, onChange: (mix) => this.update({ mix }) }),
        createDeviceSlider({ label: 'Feedback', min: 0, max: 0.65, step: 0.01, value: this.settings.feedback, onChange: (feedback) => this.update({ feedback }) }),
        createDeviceSlider({ label: 'Delay', min: 0.006, max: 0.045, step: 0.001, value: this.settings.delayTime, onChange: (delayTime) => this.update({ delayTime }) }),
        createDeviceSlider({ label: 'Width', min: 0, max: 1, step: 0.01, value: this.settings.stereoWidth, onChange: (stereoWidth) => this.update({ stereoWidth }) }),
      ],
    });
  }

  private update(settings: Partial<ChorusSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.options.onChange(settings);
  }
}
