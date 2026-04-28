import type { MidiParsedMessage } from './midiTypes';

export function parseMidiMessage(data: Uint8Array): MidiParsedMessage | null {
  if (data.length < 1) {
    return null;
  }

  const status = data[0];
  const type = status & 0xf0;
  const channel = status & 0x0f;
  const data1 = data[1] ?? 0;
  const data2 = data[2] ?? 0;

  if (type === 0x80) {
    return { type: 'noteOff', note: clamp7Bit(data1), channel };
  }

  if (type === 0x90) {
    const velocity = clamp7Bit(data2);
    if (velocity === 0) {
      return { type: 'noteOff', note: clamp7Bit(data1), channel };
    }
    return {
      type: 'noteOn',
      note: clamp7Bit(data1),
      velocity: velocity / 127,
      channel,
    };
  }

  if (type === 0xb0) {
    const value = clamp7Bit(data2);
    return {
      type: 'controlChange',
      controller: clamp7Bit(data1),
      value,
      normalizedValue: value / 127,
      channel,
    };
  }

  if (type === 0xe0) {
    const raw = clamp7Bit(data1) + (clamp7Bit(data2) << 7);
    return {
      type: 'pitchBend',
      value: Math.max(-1, Math.min(1, (raw - 8192) / 8192)),
      channel,
    };
  }

  return null;
}

function clamp7Bit(value: number): number {
  return Math.max(0, Math.min(127, value));
}
