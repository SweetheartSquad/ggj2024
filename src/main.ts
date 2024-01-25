import { Sprite, Texture } from 'pixi.js';
import { game } from './Game';
import { GameScene } from './GameScene';
import { fps, size } from './config';

let activeScene: GameScene | undefined;
let newScene: GameScene | (() => GameScene) | undefined;

export function getActiveScene(): GameScene | undefined {
	return activeScene;
}

export function setScene(scene?: NonNullable<typeof newScene>): void {
	newScene = scene;
}

function update(): void {
	// switch scene
	if (newScene && activeScene !== newScene) {
		activeScene?.destroy();
		window.scene = activeScene =
			typeof newScene === 'function' ? newScene() : newScene;
		newScene = undefined;
		if (activeScene) {
			game.app.stage.addChildAt(activeScene.camera.display.container, 1);
		}
	}

	// update
	activeScene?.update();
}

export function init(): void {
	const fill = new Sprite(Texture.WHITE);
	fill.name = 'fill';
	fill.tint = 0x000000;
	fill.width = size.x;
	fill.height = size.x;
	game.app.stage.addChildAt(fill, 0);
	setScene(new GameScene());

	// start main loop
	game.app.ticker.maxFPS = fps;
	game.app.ticker.add(update);
	game.app.ticker.update();
}
