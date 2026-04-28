import type { ExternalDeviceSettingsMap } from '../../../audio/devices/types';
import { ChorusDevicePanel } from './ChorusDevicePanel';
import { EchoDevicePanel } from './EchoDevicePanel';
import { FlangerDevicePanel } from './FlangerDevicePanel';
import { ReverbDevicePanel } from './ReverbDevicePanel';

type DeviceRackOptions = {
  onDeviceChange: <TId extends keyof ExternalDeviceSettingsMap>(
    id: TId,
    settings: Partial<ExternalDeviceSettingsMap[TId]>,
  ) => void;
};

export class DeviceRack {
  readonly element: HTMLElement;

  constructor(options: DeviceRackOptions) {
    this.element = document.createElement('section');
    this.element.className = 'device-rack';

    const title = document.createElement('div');
    title.className = 'device-rack-title';
    title.textContent = 'External Devices';

    const devices = document.createElement('div');
    devices.className = 'device-rack-devices';
    const chorus = new ChorusDevicePanel({
      onChange: (settings) => options.onDeviceChange('chorus', settings),
    });
    const flanger = new FlangerDevicePanel({
      onChange: (settings) => options.onDeviceChange('flanger', settings),
    });
    const echo = new EchoDevicePanel({
      onChange: (settings) => options.onDeviceChange('echo', settings),
    });
    const reverb = new ReverbDevicePanel({
      onChange: (settings) => options.onDeviceChange('reverb', settings),
    });
    devices.append(chorus.element, flanger.element, echo.element, reverb.element);

    this.element.append(title, devices);
  }
}
