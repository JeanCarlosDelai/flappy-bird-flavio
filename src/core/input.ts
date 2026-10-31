/** Junta toque, clique e teclado num único sinal de "apertou". */
export class Input {
  private pressed = false;

  constructor(target: HTMLElement) {
    const press = (e: Event) => {
      e.preventDefault();
      this.pressed = true;
    };
    target.addEventListener('pointerdown', press);
    window.addEventListener('keydown', (e) => {
      if (e.repeat) return;
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW' || e.code === 'Enter') {
        press(e);
      }
    });
  }

  /** Retorna true uma vez por toque. */
  consume(): boolean {
    const was = this.pressed;
    this.pressed = false;
    return was;
  }
}
