import { defaultFlangerSettings, type FlangerPolarity, type FlangerSettings } from '../../../audio/devices/types';
import { createDeviceShell } from './DeviceShell';
import { createDeviceSelect, createDeviceSlider } from './deviceControls';

type FlangerDevicePanelOptions = {
  onChange: (settings: Partial<FlangerSettings>) => void;
};

export class FlangerDevicePanel {
  readonly element: HTMLElement;
  private settings: FlangerSettings = { ...defaultFlangerSettings };

  constructor(private readonly options: FlangerDevicePanelOptions) {
    this.element = createDeviceShell({
      title: 'Flanger',
      enabled: this.settings.enabled,
      onEnabledChange: (enabled) => this.update({ enabled }),
      children: [
        createDeviceSlider({ label: 'Rate', min: 0.01, max: 10, step: 0.01, value: this.settings.rate, onChange: (rate) => this.update({ rate }) }),
        createDeviceSlider({ label: 'Depth', min: 0, max: 1, step: 0.01, value: this.settings.depth, onChange: (depth) => this.update({ depth }) }),
        createDeviceSlider({ label: 'Mix', min: 0, max: 1, step: 0.01, value: this.settings.mix, onChange: (mix) => this.update({ mix }) }),
        createDeviceSlider({ label: 'Feedback', min: 0, max: 0.85, step: 0.01, value: this.settings.feedback, onChange: (feedback) => this.update({ feedback }) }),
        createDeviceSlider({ label: 'Delay', min: 0.0005, max: 0.015, step: 0.0005, value: this.settings.delayTime, onChange: (delayTime) => this.update({ delayTime }) }),
        createDeviceSlider({ label: 'Width', min: 0, max: 1, step: 0.01, value: this.settings.stereoWidth, onChange: (stereoWidth) => this.update({ stereoWidth }) }),
        createDeviceSlider({ label: 'Phase', min: 0, max: 180, step: 1, value: this.settings.phase, onChange: (phase) => this.update({ phase }) }),
        createDeviceSelect<FlangerPolarity>({
          label: 'Polarity',
          value: this.settings.polarity,
          options: [
            { label: 'Positive', value: 'positive' },
            { label: 'Negative', value: 'negative' },
          ],
          onChange: (polarity) => this.update({ polarity }),
        }),
      ],
    });
  }

  private update(settings: Partial<FlangerSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.options.onChange(settings);
  }
}
