# Poland SH-101

Poland SH-101 is a local/private SH-101-inspired browser synthesizer. It follows the structure and control language of a classic monophonic hardware synth while using original TypeScript, CSS, and UI elements. It is not an official Roland product and does not use official Roland logos or assets.

## Current Features

- Browser-based monophonic synth built with TypeScript and Vite
- SH-101-inspired dark hardware panel UI labeled “Poland SH-101”
- AudioWorklet-based audio engine with sample-by-sample DSP
- Saw, pulse, sub oscillator, and white noise sources
- Pulse width and PWM source/amount controls
- Low-pass filter with resonance, envelope modulation, LFO modulation, and keyboard tracking
- VCA gate/envelope mode, VCA level, master volume, and ADSR envelope
- LFO with sine, triangle, saw, square, sample-and-hold/random, and noise modes
- Pitch bend, portamento, transpose, and 32-key on-screen mini keyboard
- Computer keyboard note input using `A W S E D F T G Y H U J K`
- Parameter smoothing for important continuous controls
- Soft clipping at the output for safer gain staging

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Docker Compose Development

```bash
docker compose up
```

Then open `http://localhost:5173` in your browser.

The Compose setup runs the existing Vite dev server with `--host 0.0.0.0`, exposes port `5173`, bind-mounts the project into `/app`, and keeps container dependencies in a separate `node_modules` volume. This keeps hot reload available while avoiding Linux container dependencies being written into the host `node_modules` directory.

To stop the app:

```bash
docker compose down
```

## Build

```bash
npm run build
```

## Browser Requirements

Use a modern Chromium, Firefox, or Safari browser with AudioWorklet support. Audio starts after the first pointer or keyboard interaction because browsers require a user gesture before resuming an `AudioContext`.

## Audio Engine

The synth runs fully in the browser. The main thread owns the `AudioContext`, loads an `AudioWorklet`, and sends strongly typed note, pitch bend, and patch messages.

The AudioWorklet generates audio sample-by-sample. DSP is split into small modules for oscillators, envelope, filter, LFO, smoothing, and noise generation. Saw and pulse oscillators use simple polyBLEP correction for cleaner high notes. The filter is a lightweight resonant state-variable low-pass model with smoothed cutoff and resonance modulation.

## Placeholders

Some visible panel controls are intentionally visual placeholders in this version:

- Top jack strip
- Sequencer/arpeggiator buttons
- Bender lever visual
- Portamento mode switch
- Transpose mode switch

## Known Limitations

- Oscillators are cleaner than naive waveforms but are not full production-grade band-limited oscillators.
- The filter is stable and useful, but not a detailed analog SH-style model.
- Sequencer, arpeggiator, and hold behavior are not implemented yet.
- Portamento and legato behavior are basic.
- MIDI input and patch persistence are not implemented yet.
- Desktop and laptop layouts are prioritized over mobile.

## Roadmap

- More accurate analog-style filter
- Higher-quality band-limited oscillators
- Better PWM behavior
- MIDI input
- Patch save/load
- Functional sequencer
- Functional arpeggiator
- Improved portamento and legato behavior
- Mobile/touch improvements
