import type { MidiStatus as MidiStatusState } from '../../input/midi/midiTypes';

export class MidiStatus {
  readonly element: HTMLElement;
  private readonly text: HTMLElement;
  private readonly activity: HTMLElement;

  constructor() {
    this.element = document.createElement('section');
    this.element.className = 'midi-status';

    const label = document.createElement('span');
    label.className = 'midi-status-label';
    label.textContent = 'MIDI';

    this.text = document.createElement('span');
    this.text.className = 'midi-status-text';
    this.text.textContent = 'MIDI not initialized';

    this.activity = document.createElement('span');
    this.activity.className = 'midi-status-activity';

    this.element.append(label, this.text, this.activity);
  }

  update(status: MidiStatusState): void {
    this.element.dataset.state = status.state;
    this.text.textContent = status.label;
    this.activity.classList.toggle('is-active', status.state === 'connected' && status.lastActivityAt !== null);
    if (status.state === 'connected' && status.lastActivityAt !== null) {
      window.setTimeout(() => this.activity.classList.remove('is-active'), 90);
    }
  }
}
