type SwitchOption<T extends string> = {
  label: string;
  value: T;
};

type SwitchOptions<T extends string> = {
  label: string;
  value: T;
  options: SwitchOption<T>[];
  onChange: (value: T) => void;
};

export function createSwitch<T extends string>(options: SwitchOptions<T>): HTMLElement {
  const wrap = document.createElement('fieldset');
  wrap.className = 'control switch-control';
  const groupName = `${options.label}-${crypto.randomUUID()}`;

  const legend = document.createElement('legend');
  legend.className = 'control-label';
  legend.textContent = options.label;
  wrap.append(legend);

  const row = document.createElement('div');
  row.className = 'switch-options';

  for (const option of options.options) {
    const label = document.createElement('label');
    label.className = 'switch-option';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = groupName;
    input.value = option.value;
    input.checked = option.value === options.value;
    input.addEventListener('change', () => {
      if (input.checked) {
        options.onChange(option.value);
      }
    });

    const text = document.createElement('span');
    text.textContent = option.label;
    label.append(input, text);
    row.append(label);
  }

  wrap.append(row);
  return wrap;
}
