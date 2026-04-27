type KnobOptions = {
  label: string;
  min: number;
  max: number;
  step: number;
  value: number;
  className?: string;
  onChange: (value: number) => void;
};

export function createKnob(options: KnobOptions): HTMLElement {
  const wrap = document.createElement('label');
  wrap.className = `control knob-control ${options.className ?? ''}`;

  const name = document.createElement('span');
  name.className = 'control-label';
  name.textContent = options.label;

  const input = document.createElement('input');
  input.type = 'range';
  input.className = 'knob-input';
  input.min = String(options.min);
  input.max = String(options.max);
  input.step = String(options.step);
  input.value = String(options.value);

  const face = document.createElement('span');
  face.className = 'knob-face';
  const pointer = document.createElement('span');
  pointer.className = 'knob-pointer';
  face.append(pointer);

  const setAngle = (value: number) => {
    const ratio = (value - options.min) / (options.max - options.min);
    const degrees = -135 + ratio * 270;
    face.style.setProperty('--knob-angle', `${degrees}deg`);
  };
  setAngle(options.value);

  input.addEventListener('input', () => {
    const value = Number(input.value);
    setAngle(value);
    options.onChange(value);
  });

  wrap.append(name, face, input);
  return wrap;
}
