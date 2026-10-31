/** Loop com passo fixo: a física fica igual em 60 Hz, 120 Hz ou celular lento. */
export function startLoop(update: (dt: number) => void, render: () => void): void {
  const step = 1 / 120;
  let last = performance.now();
  let acc = 0;

  const frame = (now: number) => {
    acc += Math.min((now - last) / 1000, 0.25);
    last = now;
    while (acc >= step) {
      update(step);
      acc -= step;
    }
    render();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
