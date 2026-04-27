# Poland SH-101

Poland SH-101 is a local/private SH-101-inspired browser synthesizer. It visually follows the classic monophonic hardware panel layout closely while using original CSS, original UI elements, and the project name “Poland SH-101”. It is not an official Roland product and does not use official Roland logos or assets.

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Browser Requirements

Use a modern Chromium, Firefox, or Safari browser with AudioWorklet support. Audio starts after the first pointer or keyboard interaction because browsers require a user gesture before resuming an `AudioContext`.

## Audio Engine

The synth runs fully in the browser. The main thread owns the `AudioContext`, loads an `AudioWorklet`, and sends strongly typed note, pitch bend, and patch messages. The AudioWorklet generates audio sample-by-sample with saw, pulse, sub oscillator, noise, a low-pass filter, ADSR envelope, LFO, smoothing, and soft clipping.

## Known Limitations

- Oscillators are naive and can alias at higher pitches.
- The low-pass filter is a simple resonant digital filter, not an accurate analog model.
- Sequencer, arpeggiator, and hold controls are visual placeholders in this first version.
- Portamento and legato behavior are basic.
- MIDI input and patch persistence are not implemented yet.
- Desktop and laptop layouts are prioritized over mobile.

## Roadmap

- More accurate analog-style filter
- Band-limited oscillators
- Better PWM behavior
- MIDI input
- Patch save/load
- Functional sequencer
- Functional arpeggiator
- Improved portamento and legato behavior
- Mobile/touch improvements
