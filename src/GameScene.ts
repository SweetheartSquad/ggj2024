import { BitmapText, Container, DisplayObject, Graphics } from 'pixi.js';
import { Area } from './Area';
import { Border } from './Border';
import { Camera } from './Camera';
import { game } from './Game';
import { GameObject } from './GameObject';
import { PropParallax } from './PropParallax';
import { ScreenFilter } from './ScreenFilter';
import { TweenManager } from './Tweens';
import { V } from './VMath';
import { getInput } from './main';

function depthCompare(
	a: DisplayObject & { offset?: number },
	b: DisplayObject & { offset?: number }
): number {
	return a.y + (a.offset || 0) - (b.y + (b.offset || 0));
}

export class GameScene {
	container = new Container();

	graphics = new Graphics();

	camera = new Camera();

	screenFilter: ScreenFilter;

	border: Border;

	interactionFocus?: V;

	areas: Partial<{ [key: string]: GameObject[] }> & { root: GameObject[] } = {
		root: [],
	};

	area?: string;

	get currentArea() {
		return this.areas[this.area || ''];
	}

	find(name: string) {
		return this.currentArea?.find(
			(i) => (i as { name?: string }).name === name
		);
	}

	findAll(name: string) {
		return this.currentArea?.filter(
			(i) => (i as { name?: string }).name === name
		);
	}

	focusAmt = 0.8;

	constructor() {
		const bgs = ['img_cheryl', 'img_cheryl', 'img_cheryl'];
		bgs.forEach((i, idx) => {
			const bgParallax = new PropParallax({
				texture: i,
				alpha: 0.5,
				mult: 1 + (idx + 1) / bgs.length,
			});
			this.take(bgParallax);
			this.container.addChild(bgParallax.display.container);

			const start = Date.now();
			bgParallax.scripts.push({
				gameObject: bgParallax,
				update() {
					const speed = 100; // TODO: speed based on typing
					bgParallax.spr.tilePosition.x =
						((Date.now() - start) / 1000) * speed * bgParallax.mult;
					bgParallax.spr.tilePosition.y =
						((Date.now() - start) / 1000) * speed * bgParallax.mult;
				},
			});
		});

		this.border = new Border();
		this.border.init();
		this.take(this.border);
		this.take(this.camera);

		this.screenFilter = new ScreenFilter();

		this.camera.display.container.addChild(this.container);


		this.border.display.container.alpha = 0;
	}

	destroy(): void {
		if (this.currentArea) {
			Area.unmount(this.currentArea);
		}
		Object.values(this.areas).forEach((a) => a?.forEach((o) => o.destroy()));
		this.container.destroy({
			children: true,
		});
	}

	goto({ area = this.area }: { area?: string; x?: number; y?: number }) {
		this.gotoArea(area);
	}

	gotoArea(area?: string) {
		let a = this.currentArea;
		if (a) Area.unmount(a);
		this.area = area;
		a = this.currentArea;
		if (!a) throw new Error(`Area "${area}" does not exist`);
		Area.mount(a, this.container);
	}

	update(): void {
		const curTime = game.app.ticker.lastTime;

		// depth sort
		// this.sortScene();
		// this.container.addChild(this.graphics);

		this.screenFilter.update();

		GameObject.update();
		TweenManager.update();
		this.screenFilter.uniforms.curTime = curTime / 1000;
		this.screenFilter.uniforms.camPos = [
			this.camera.display.container.pivot.x,
			-this.camera.display.container.pivot.y,
		];
	}

	sortScene() {
		this.container.children.sort(depthCompare);
	}

	take(gameObject: GameObject) {
		const a = this.currentArea;
		if (a) Area.remove(a, gameObject);
		Area.add(this.areas.root, gameObject);
	}

	drop(gameObject: GameObject) {
		Area.remove(this.areas.root, gameObject);
		const a = this.currentArea;
		if (a) Area.add(a, gameObject);
	}
}
