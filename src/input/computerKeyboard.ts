export type KeyboardBinding = {
  key: string;
  noteOffset: number;
};

export const computerKeyboardMap: KeyboardBinding[] = [
  { key: 'a', noteOffset: 0 },
  { key: 'w', noteOffset: 1 },
  { key: 's', noteOffset: 2 },
  { key: 'e', noteOffset: 3 },
  { key: 'd', noteOffset: 4 },
  { key: 'f', noteOffset: 5 },
  { key: 't', noteOffset: 6 },
  { key: 'g', noteOffset: 7 },
  { key: 'y', noteOffset: 8 },
  { key: 'h', noteOffset: 9 },
  { key: 'u', noteOffset: 10 },
  { key: 'j', noteOffset: 11 },
  { key: 'k', noteOffset: 12 },
];

export function keyToNote(key: string, baseNote: number): number | undefined {
  const binding = computerKeyboardMap.find((entry) => entry.key === key.toLowerCase());
  return binding ? baseNote + binding.noteOffset : undefined;
}

export function noteToFrequency(note: number): number {
  return 440 * 2 ** ((note - 69) / 12);
}
