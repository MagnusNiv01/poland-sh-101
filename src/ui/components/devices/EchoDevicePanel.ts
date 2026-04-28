import { defaultEchoSettings, type EchoSettings } from '../../../audio/devices/types';
import { createDeviceShell, type DeviceShellElement } from './DeviceShell';
import { createDeviceSlider, createDeviceToggle, type DeviceValueControl } from './deviceControls';

type EchoDevicePanelOptions = {
  onChange: (settings: Partial<EchoSettings>) => void;
};

export class EchoDevicePanel {
  readonly element: DeviceShellElement;
  private settings: EchoSettings = { ...defaultEchoSettings };
  private readonly controls: {
    time: DeviceValueControl<number>;
    feedback: DeviceValueControl<number>;
    mix: DeviceValueControl<number>;
    tone: DeviceValueControl<number>;
    stereoSpread: DeviceValueControl<number>;
    pingPong: DeviceValueControl<boolean>;
    syncEnabled: DeviceValueControl<boolean>;
  };

  constructor(private readonly options: EchoDevicePanelOptions) {
    this.controls = {
      time: createDeviceSlider({ label: 'Time', min: 0.03, max: 1.5, step: 0.01, value: this.settings.time, onChange: (time) => this.update({ time }) }),
      feedback: createDeviceSlider({ label: 'Feedback', min: 0, max: 0.85, step: 0.01, value: this.settings.feedback, onChange: (feedback) => this.update({ feedback }) }),
      mix: createDeviceSlider({ label: 'Mix', min: 0, max: 1, step: 0.01, value: this.settings.mix, onChange: (mix) => this.update({ mix }) }),
      tone: createDeviceSlider({ label: 'Tone', min: 0, max: 1, step: 0.01, value: this.settings.tone, onChange: (tone) => this.update({ tone }) }),
      stereoSpread: createDeviceSlider({ label: 'Spread', min: 0, max: 0.35, step: 0.01, value: this.settings.stereoSpread, onChange: (stereoSpread) => this.update({ stereoSpread }) }),
      pingPong: createDeviceToggle('Ping Pong', this.settings.pingPong, (pingPong) => this.update({ pingPong })),
      syncEnabled: createDeviceToggle('Sync', this.settings.syncEnabled, (syncEnabled) => this.update({ syncEnabled })),
    };
    this.element = createDeviceShell({
      title: 'Echo',
      enabled: this.settings.enabled,
      onEnabledChange: (enabled) => this.update({ enabled }),
      children: Object.values(this.controls),
    });
  }

  updateSettings(settings: EchoSettings): void {
    this.settings = { ...settings };
    this.element.setEnabled(this.settings.enabled);
    this.controls.time.setValue(this.settings.time);
    this.controls.feedback.setValue(this.settings.feedback);
    this.controls.mix.setValue(this.settings.mix);
    this.controls.tone.setValue(this.settings.tone);
    this.controls.stereoSpread.setValue(this.settings.stereoSpread);
    this.controls.pingPong.setValue(this.settings.pingPong);
    this.controls.syncEnabled.setValue(this.settings.syncEnabled);
  }

  private update(settings: Partial<EchoSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.options.onChange(settings);
  }
}
