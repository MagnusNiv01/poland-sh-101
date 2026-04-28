# Poland SH-101

Poland SH-101 is a local/private SH-101-inspired browser synthesizer. It follows the structure and control language of a classic monophonic hardware synth while using original TypeScript, CSS, and UI elements. It is not an official Roland product and does not use official Roland logos or assets.

<img width="1815" height="1162" alt="image" src="https://github.com/user-attachments/assets/844240b7-d605-48c4-9d1d-6dad49e93f4f" />

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
- Preset Control Box for localStorage-based complete setup save/load
- External device rack with typed Chorus, Flanger, Echo, and Reverb effect modules
- Plug-and-play external device chain for adding future browser audio effects

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

The AudioWorklet generates audio sample-by-sample. DSP is split into small modules for oscillators, envelope, filter, LFO, smoothing, and noise generation. Saw, pulse, and sub oscillators use PolyBLEP edge correction for cleaner high notes and smoother PWM. The filter is a cascaded TPT state-variable low-pass model with smoothed cutoff/resonance modulation, mild drive, and controlled feedback.

The synth output is routed through an external device chain before reaching the browser output:

```text
AudioWorklet synth -> ExternalDeviceChain -> Chorus -> Flanger -> Echo -> Reverb -> AudioContext destination
```

External devices live outside the SH-101 patch model. Each device exposes typed settings, an input/output node pair, a bypass-safe enabled state, and a small UI panel in the external rack below the synth.

## External Devices

- Chorus: Web Audio chorus using modulated delay lines, wet/dry mix, feedback, delay time, depth, rate, and stereo width.
- Flanger: Web Audio flanger using very short modulated delay lines, wet/dry mix, feedback, stereo width, polarity, and phase-like stereo modulation offset.
- Echo: Web Audio delay using delay lines, feedback, tone filtering, wet/dry mix, stereo spread, and ping-pong routing.
- Reverb: Web Audio convolution reverb with generated stereo impulse responses, pre-delay, tone, size, damping, decay, and wet/dry mix.

All external devices default to off, so the synth starts dry until an effect is enabled.

## Presets

The external rack includes a Preset Control Box. It is a control module, not an audio device, so it is not inserted into the audio signal chain and is not included inside saved presets.

Presets are stored in `localStorage` under `poland-sh101.presets.v1`. Each preset stores a versioned studio snapshot:

```ts
type StudioSnapshot = {
  version: number;
  activeInstrumentId: string;
  instruments: Record<string, {
    instrumentType: string;
    stateVersion: number;
    patch: unknown;
  }>;
  devices: Record<string, {
    deviceType: string;
    stateVersion: number;
    settings: unknown;
  }>;
};
```

The first instrument id is `poland-sh101`. External devices are saved by stable device id, not display name or rack order. Unknown saved device ids are ignored when loading.

The dropdown always includes ten read-only factory presets:

- INIT 101
- SUB BASS
- ACID BASS
- PWM LEAD
- RESO PLUCK
- NOISE HAT
- LASER ZAP
- DARK DRONE
- SPACE ECHO LEAD
- ORGANISH SQUARE

Factory presets are prefixed with `F -` in the selector/display. User presets are stored separately in localStorage and appear under the user group. Selecting a preset in the dropdown immediately loads it; there is no separate load step. `SAVE` on a factory preset creates a new user preset copy instead of overwriting the factory preset. `DELETE` is disabled for factory presets.

`EXPORT` downloads a human-readable `poland-sh101-presets.json` file with this shape:

```ts
type ExportedPresetFile = {
  fileType: 'poland-sh101-presets';
  version: number;
  exportedAt: string;
  factoryPresets: StoredPreset[];
  userPresets: StoredPreset[];
};
```

`IMPORT` accepts compatible JSON exports and imports only user presets. Built-in factory presets stay defined by code and are not replaced by imported files. Imported presets with ids that already exist are assigned new ids; duplicate names are allowed.

External audio devices implement a serializable contract with stable `id`, `deviceType`, `stateVersion`, `includeInPresets`, `getSettings()`, and `updateSettings()`. Future devices become preset-compatible by implementing that contract and being added to the app's device registry; the preset manager does not import Chorus, Flanger, Echo, or Reverb directly.

## Placeholders

Some visible panel controls are intentionally visual placeholders in this version:

- Top jack strip
- Sequencer/arpeggiator buttons
- Bender lever visual
- Portamento mode switch
- Transpose mode switch
- Echo tempo sync setting

## Known Limitations

- Oscillators use PolyBLEP correction but are not full wavetable or minBLEP oscillators.
- The filter is more synth-like than a simple digital low-pass, but it is not a component-level analog SH-style model.
- Chorus, Flanger, Echo, and Reverb are simple Web Audio implementations, not detailed vintage effect models.
- Flanger phase controls the relative stereo modulation amount and polarity in this first version, not a full independent second LFO phase offset.
- Reverb impulse responses are generated in code and do not model a specific physical space.
- Sequencer, arpeggiator, and hold behavior are not implemented yet.
- Portamento and legato behavior are basic.
- MIDI input and patch persistence are not implemented yet.
- Presets are local to the current browser profile and are not exported/imported as files yet.
- Desktop and laptop layouts are prioritized over mobile.

## Roadmap

- More accurate component-style analog filter behavior
- Wavetable or minBLEP oscillator options
- Better PWM behavior
- Additional external devices such as distortion, compressor, EQ, and phaser
- More advanced stereo flanger phase handling
- Higher-quality reverb algorithms and smoother impulse regeneration
- Preset export/import and chain reordering UI
- MIDI input
- Patch save/load
- Functional sequencer
- Functional arpeggiator
- Improved portamento and legato behavior
- Mobile/touch improvements
