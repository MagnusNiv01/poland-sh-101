import { defaultFlangerSettings, type FlangerPolarity, type FlangerSettings } from '../../../audio/devices/types';
import { createDeviceShell, type DeviceShellElement } from './DeviceShell';
import { createDeviceSelect, createDeviceSlider, type DeviceValueControl } from './deviceControls';

type FlangerDevicePanelOptions = {
  onChange: (settings: Partial<FlangerSettings>) => void;
};

export class FlangerDevicePanel {
  readonly element: DeviceShellElement;
  private settings: FlangerSettings = { ...defaultFlangerSettings };
  private readonly controls: {
    rate: DeviceValueControl<number>;
    depth: DeviceValueControl<number>;
    mix: DeviceValueControl<number>;
    feedback: DeviceValueControl<number>;
    delayTime: DeviceValueControl<number>;
    stereoWidth: DeviceValueControl<number>;
    phase: DeviceValueControl<number>;
    polarity: DeviceValueControl<FlangerPolarity>;
  };

  constructor(private readonly options: FlangerDevicePanelOptions) {
    this.controls = {
      rate: createDeviceSlider({ label: 'Rate', min: 0.01, max: 10, step: 0.01, value: this.settings.rate, onChange: (rate) => this.update({ rate }) }),
      depth: createDeviceSlider({ label: 'Depth', min: 0, max: 1, step: 0.01, value: this.settings.depth, onChange: (depth) => this.update({ depth }) }),
      mix: createDeviceSlider({ label: 'Mix', min: 0, max: 1, step: 0.01, value: this.settings.mix, onChange: (mix) => this.update({ mix }) }),
      feedback: createDeviceSlider({ label: 'Feedback', min: 0, max: 0.85, step: 0.01, value: this.settings.feedback, onChange: (feedback) => this.update({ feedback }) }),
      delayTime: createDeviceSlider({ label: 'Delay', min: 0.0005, max: 0.015, step: 0.0005, value: this.settings.delayTime, onChange: (delayTime) => this.update({ delayTime }) }),
      stereoWidth: createDeviceSlider({ label: 'Width', min: 0, max: 1, step: 0.01, value: this.settings.stereoWidth, onChange: (stereoWidth) => this.update({ stereoWidth }) }),
      phase: createDeviceSlider({ label: 'Phase', min: 0, max: 180, step: 1, value: this.settings.phase, onChange: (phase) => this.update({ phase }) }),
      polarity: createDeviceSelect<FlangerPolarity>({
        label: 'Polarity',
        value: this.settings.polarity,
        options: [
          { label: 'Positive', value: 'positive' },
          { label: 'Negative', value: 'negative' },
        ],
        onChange: (polarity) => this.update({ polarity }),
      }),
    };
    this.element = createDeviceShell({
      title: 'Flanger',
      enabled: this.settings.enabled,
      onEnabledChange: (enabled) => this.update({ enabled }),
      children: Object.values(this.controls),
    });
  }

  updateSettings(settings: FlangerSettings): void {
    this.settings = { ...settings };
    this.element.setEnabled(this.settings.enabled);
    this.controls.rate.setValue(this.settings.rate);
    this.controls.depth.setValue(this.settings.depth);
    this.controls.mix.setValue(this.settings.mix);
    this.controls.feedback.setValue(this.settings.feedback);
    this.controls.delayTime.setValue(this.settings.delayTime);
    this.controls.stereoWidth.setValue(this.settings.stereoWidth);
    this.controls.phase.setValue(this.settings.phase);
    this.controls.polarity.setValue(this.settings.polarity);
  }

  private update(settings: Partial<FlangerSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.options.onChange(settings);
  }
}
