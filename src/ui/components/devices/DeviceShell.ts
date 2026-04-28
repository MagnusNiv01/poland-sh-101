type DeviceShellOptions = {
  title: string;
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  children: HTMLElement[];
};

export type DeviceShellElement = HTMLElement & {
  setEnabled(enabled: boolean): void;
};

export function createDeviceShell(options: DeviceShellOptions): DeviceShellElement {
  const shell = document.createElement('section');
  shell.className = `device-shell ${options.enabled ? 'is-enabled' : ''}`;

  const header = document.createElement('header');
  header.className = 'device-header';

  const title = document.createElement('h2');
  title.textContent = options.title;

  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'device-toggle';
  toggle.textContent = options.enabled ? 'ON' : 'OFF';
  const setEnabled = (enabled: boolean) => {
    shell.classList.toggle('is-enabled', enabled);
    toggle.textContent = enabled ? 'ON' : 'OFF';
  };
  toggle.addEventListener('click', () => {
    const enabled = !shell.classList.contains('is-enabled');
    setEnabled(enabled);
    options.onEnabledChange(enabled);
  });

  const controls = document.createElement('div');
  controls.className = 'device-controls';
  controls.append(...options.children);

  header.append(title, toggle);
  shell.append(header, controls);
  return Object.assign(shell, { setEnabled });
}
