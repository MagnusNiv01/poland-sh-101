type DeviceSliderOptions = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  onChange: (value: number) => void;
};

type DeviceSelectOption<TValue extends string> = {
  label: string;
  value: TValue;
};

type DeviceSelectOptions<TValue extends string> = {
  label: string;
  value: TValue;
  options: DeviceSelectOption<TValue>[];
  onChange: (value: TValue) => void;
};

export type DeviceValueControl<TValue> = HTMLElement & {
  setValue(value: TValue): void;
};

export function createDeviceSlider(options: DeviceSliderOptions): DeviceValueControl<number> {
  const wrap = document.createElement('label');
  wrap.className = 'device-control';

  const label = document.createElement('span');
  label.textContent = options.label;

  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(options.min);
  input.max = String(options.max);
  input.step = String(options.step);
  input.value = String(options.value);

  const value = document.createElement('span');
  value.className = 'device-control-value';
  const setValue = (nextValue: number) => {
    value.textContent = formatValue(nextValue);
  };
  setValue(options.value);

  input.addEventListener('input', () => {
    const nextValue = Number(input.value);
    setValue(nextValue);
    options.onChange(nextValue);
  });

  wrap.append(label, input, value);
  return Object.assign(wrap, {
    setValue(nextValue: number) {
      input.value = String(nextValue);
      setValue(nextValue);
    },
  });
}

export function createDeviceSelect<TValue extends string>(options: DeviceSelectOptions<TValue>): DeviceValueControl<TValue> {
  const wrap = document.createElement('label');
  wrap.className = 'device-control';

  const label = document.createElement('span');
  label.textContent = options.label;

  const select = document.createElement('select');
  select.className = 'device-select';
  for (const option of options.options) {
    const element = document.createElement('option');
    element.value = option.value;
    element.textContent = option.label;
    select.append(element);
  }
  select.value = options.value;
  select.addEventListener('change', () => {
    options.onChange(select.value as TValue);
  });

  wrap.append(label, select);
  return Object.assign(wrap, {
    setValue(nextValue: TValue) {
      select.value = nextValue;
    },
  });
}

export function createDeviceToggle(label: string, value: boolean, onChange: (value: boolean) => void): DeviceValueControl<boolean> {
  const button = document.createElement('button');
  button.type = 'button';
  button.className = `device-mini-toggle ${value ? 'is-on' : ''}`;
  button.textContent = label;
  const setValue = (nextValue: boolean) => {
    button.classList.toggle('is-on', nextValue);
  };
  button.addEventListener('click', () => {
    const nextValue = !button.classList.contains('is-on');
    setValue(nextValue);
    onChange(nextValue);
  });
  return Object.assign(button, { setValue });
}

function formatValue(value: number): string {
  if (Math.abs(value) >= 10) {
    return value.toFixed(0);
  }
  if (Math.abs(value) >= 1) {
    return value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
  }
  return value.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
}
