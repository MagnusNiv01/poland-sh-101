type SliderOptions = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  unit?: string;
  className?: string;
  onChange: (value: number) => void;
};

export function createSlider(options: SliderOptions): HTMLElement {
  const wrap = document.createElement('label');
  wrap.className = `control slider-control ${options.className ?? ''}`;

  const name = document.createElement('span');
  name.className = 'control-label';
  name.textContent = options.label;

  const input = document.createElement('input');
  input.type = 'range';
  input.min = String(options.min);
  input.max = String(options.max);
  input.step = String(options.step);
  input.value = String(options.value);

  const readout = document.createElement('span');
  readout.className = 'control-value';
  const setReadout = (value: number) => {
    readout.textContent = `${formatValue(value)}${options.unit ?? ''}`;
  };
  setReadout(options.value);

  input.addEventListener('input', () => {
    const value = Number(input.value);
    setReadout(value);
    options.onChange(value);
  });

  wrap.append(name, input, readout);
  return wrap;
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
