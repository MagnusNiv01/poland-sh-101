import { defaultChorusSettings, type ChorusSettings } from '../../../audio/devices/types';
import { createDeviceShell, type DeviceShellElement } from './DeviceShell';
import { createDeviceSlider, type DeviceValueControl } from './deviceControls';

type ChorusDevicePanelOptions = {
  onChange: (settings: Partial<ChorusSettings>) => void;
};

export class ChorusDevicePanel {
  readonly element: DeviceShellElement;
  private settings: ChorusSettings = { ...defaultChorusSettings };
  private readonly controls: {
    [K in Exclude<keyof ChorusSettings, 'enabled'>]: DeviceValueControl<number>;
  };

  constructor(private readonly options: ChorusDevicePanelOptions) {
    this.controls = {
      rate: createDeviceSlider({ label: 'Rate', min: 0.05, max: 4, step: 0.01, value: this.settings.rate, onChange: (rate) => this.update({ rate }) }),
      depth: createDeviceSlider({ label: 'Depth', min: 0, max: 0.018, step: 0.001, value: this.settings.depth, onChange: (depth) => this.update({ depth }) }),
      mix: createDeviceSlider({ label: 'Mix', min: 0, max: 1, step: 0.01, value: this.settings.mix, onChange: (mix) => this.update({ mix }) }),
      feedback: createDeviceSlider({ label: 'Feedback', min: 0, max: 0.65, step: 0.01, value: this.settings.feedback, onChange: (feedback) => this.update({ feedback }) }),
      delayTime: createDeviceSlider({ label: 'Delay', min: 0.006, max: 0.045, step: 0.001, value: this.settings.delayTime, onChange: (delayTime) => this.update({ delayTime }) }),
      stereoWidth: createDeviceSlider({ label: 'Width', min: 0, max: 1, step: 0.01, value: this.settings.stereoWidth, onChange: (stereoWidth) => this.update({ stereoWidth }) }),
    };
    this.element = createDeviceShell({
      title: 'Chorus',
      enabled: this.settings.enabled,
      onEnabledChange: (enabled) => this.update({ enabled }),
      children: Object.values(this.controls),
    });
  }

  updateSettings(settings: ChorusSettings): void {
    this.settings = { ...settings };
    this.element.setEnabled(this.settings.enabled);
    this.controls.rate.setValue(this.settings.rate);
    this.controls.depth.setValue(this.settings.depth);
    this.controls.mix.setValue(this.settings.mix);
    this.controls.feedback.setValue(this.settings.feedback);
    this.controls.delayTime.setValue(this.settings.delayTime);
    this.controls.stereoWidth.setValue(this.settings.stereoWidth);
  }

  private update(settings: Partial<ChorusSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.options.onChange(settings);
  }
}
