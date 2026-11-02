import '@/pwa';
import '@/ui/game-ui.css';
import { Input } from '@/core/input';
import { startLoop } from '@/core/loop';
import { fitCanvas } from '@/core/screen';
import { GameOverScene } from '@/scenes/gameover';
import { MenuScene } from '@/scenes/menu';
import { PlayScene } from '@/scenes/play';
import type { Scene, SceneManager } from '@/scenes/scene';
import type { RunStats } from '@/systems/session';

const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (!canvas) throw new Error('Canvas #game not found');

const ctx = fitCanvas(canvas);
const input = new Input(canvas);

let scene: Scene;
const manager: SceneManager = {
  goToMenu: () => (scene = new MenuScene(manager)),
  goToPlay: (options) => (scene = new PlayScene(manager, options)),
  goToGameOver: (run: RunStats) => (scene = new GameOverScene(manager, run))
};
manager.goToMenu();

// EQUILÍBRIO (só desenvolvimento): roda a partida acelerada, sem desenhar
if (import.meta.env.DEV) {
  Object.assign(window, {
    __fast: (seconds: number) => {
      const idle = { pressed: false, pause: false, sound: false };
      for (let i = 0; i < seconds * 120; i++) scene.update(1 / 120, idle);
    },
    __play: (options?: Parameters<SceneManager['goToPlay']>[0]) => manager.goToPlay(options)
  });
}

startLoop(
  (dt) => scene.update(dt, input.consume()),
  () => scene.render(ctx)
);
