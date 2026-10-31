import { Input } from '@/core/input';
import { startLoop } from '@/core/loop';
import { fitCanvas } from '@/core/screen';
import { GameOverScene } from '@/scenes/gameover';
import { MenuScene } from '@/scenes/menu';
import { PlayScene } from '@/scenes/play';
import type { GameResult, Scene, SceneManager } from '@/scenes/scene';

const canvas = document.querySelector<HTMLCanvasElement>('#game');
if (!canvas) throw new Error('Canvas #game not found');

const ctx = fitCanvas(canvas);
const input = new Input(document.body);

let scene: Scene;
const manager: SceneManager = {
  goToMenu: () => (scene = new MenuScene(manager)),
  goToPlay: () => (scene = new PlayScene(manager)),
  goToGameOver: (result: GameResult) => (scene = new GameOverScene(manager, result))
};
manager.goToMenu();

startLoop(
  (dt) => scene.update(dt, input.consume()),
  () => scene.render(ctx)
);
