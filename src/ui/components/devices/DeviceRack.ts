import type { PresetManager } from '../../../presets/PresetManager';
import type { StudioSnapshot } from '../../../presets/types';
import type { ExternalDeviceSettingsMap } from '../../../audio/devices/types';
import { ChorusDevicePanel } from './ChorusDevicePanel';
import { EchoDevicePanel } from './EchoDevicePanel';
import { FlangerDevicePanel } from './FlangerDevicePanel';
import { PresetControlDevicePanel } from './PresetControlDevicePanel';
import { ReverbDevicePanel } from './ReverbDevicePanel';

type DeviceRackOptions = {
  presetManager: PresetManager;
  createSnapshot: () => StudioSnapshot;
  applySnapshot: (snapshot: StudioSnapshot) => void;
  onDeviceChange: <TId extends keyof ExternalDeviceSettingsMap>(
    id: TId,
    settings: Partial<ExternalDeviceSettingsMap[TId]>,
  ) => void;
};

export class DeviceRack {
  readonly element: HTMLElement;
  private readonly chorus: ChorusDevicePanel;
  private readonly flanger: FlangerDevicePanel;
  private readonly echo: EchoDevicePanel;
  private readonly reverb: ReverbDevicePanel;

  constructor(options: DeviceRackOptions) {
    this.element = document.createElement('section');
    this.element.className = 'device-rack';

    const title = document.createElement('div');
    title.className = 'device-rack-title';
    title.textContent = 'External Devices';

    const devices = document.createElement('div');
    devices.className = 'device-rack-devices';
    const presetControl = new PresetControlDevicePanel({
      manager: options.presetManager,
      createSnapshot: options.createSnapshot,
      applySnapshot: options.applySnapshot,
    });
    this.chorus = new ChorusDevicePanel({
      onChange: (settings) => options.onDeviceChange('chorus', settings),
    });
    this.flanger = new FlangerDevicePanel({
      onChange: (settings) => options.onDeviceChange('flanger', settings),
    });
    this.echo = new EchoDevicePanel({
      onChange: (settings) => options.onDeviceChange('echo', settings),
    });
    this.reverb = new ReverbDevicePanel({
      onChange: (settings) => options.onDeviceChange('reverb', settings),
    });
    devices.append(presetControl.element, this.chorus.element, this.flanger.element, this.echo.element, this.reverb.element);

    this.element.append(title, devices);
  }

  updateDeviceSettings<TId extends keyof ExternalDeviceSettingsMap>(
    id: TId,
    settings: ExternalDeviceSettingsMap[TId],
  ): void {
    if (id === 'chorus') {
      this.chorus.updateSettings(settings as ExternalDeviceSettingsMap['chorus']);
      return;
    }
    if (id === 'flanger') {
      this.flanger.updateSettings(settings as ExternalDeviceSettingsMap['flanger']);
      return;
    }
    if (id === 'echo') {
      this.echo.updateSettings(settings as ExternalDeviceSettingsMap['echo']);
      return;
    }
    if (id === 'reverb') {
      this.reverb.updateSettings(settings as ExternalDeviceSettingsMap['reverb']);
    }
  }
}
