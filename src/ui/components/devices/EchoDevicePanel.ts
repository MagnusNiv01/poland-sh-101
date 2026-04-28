import { defaultEchoSettings, type EchoSettings } from '../../../audio/devices/types';
import { createDeviceShell } from './DeviceShell';
import { createDeviceSlider, createDeviceToggle } from './deviceControls';

type EchoDevicePanelOptions = {
  onChange: (settings: Partial<EchoSettings>) => void;
};

export class EchoDevicePanel {
  readonly element: HTMLElement;
  private settings: EchoSettings = { ...defaultEchoSettings };

  constructor(private readonly options: EchoDevicePanelOptions) {
    this.element = createDeviceShell({
      title: 'Echo',
      enabled: this.settings.enabled,
      onEnabledChange: (enabled) => this.update({ enabled }),
      children: [
        createDeviceSlider({ label: 'Time', min: 0.03, max: 1.5, step: 0.01, value: this.settings.time, onChange: (time) => this.update({ time }) }),
        createDeviceSlider({ label: 'Feedback', min: 0, max: 0.85, step: 0.01, value: this.settings.feedback, onChange: (feedback) => this.update({ feedback }) }),
        createDeviceSlider({ label: 'Mix', min: 0, max: 1, step: 0.01, value: this.settings.mix, onChange: (mix) => this.update({ mix }) }),
        createDeviceSlider({ label: 'Tone', min: 0, max: 1, step: 0.01, value: this.settings.tone, onChange: (tone) => this.update({ tone }) }),
        createDeviceSlider({ label: 'Spread', min: 0, max: 0.35, step: 0.01, value: this.settings.stereoSpread, onChange: (stereoSpread) => this.update({ stereoSpread }) }),
        createDeviceToggle('Ping Pong', this.settings.pingPong, (pingPong) => this.update({ pingPong })),
        createDeviceToggle('Sync', this.settings.syncEnabled, (syncEnabled) => this.update({ syncEnabled })),
      ],
    });
  }

  private update(settings: Partial<EchoSettings>): void {
    this.settings = { ...this.settings, ...settings };
    this.options.onChange(settings);
  }
}
