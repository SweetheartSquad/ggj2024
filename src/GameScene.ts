import {
	BitmapText,
	Container,
	DisplayObject,
	Graphics,
	SCALE_MODES,
} from 'pixi.js';
import { Area } from './Area';
import { Border } from './Border';
import { Camera } from './Camera';
import { game } from './Game';
import { GameObject } from './GameObject';
import { PropParallax } from './PropParallax';
import { ScreenFilter } from './ScreenFilter';
import { TweenManager } from './Tweens';
import { V } from './VMath';

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
		const bgs = [
			'borderPatternCyan',
			'borderPatternMagenta',
			'borderPatternYellow',
		];
		bgs.forEach((i, idx) => {
			const bgParallax = new PropParallax({
				texture: i,
				mult: 1 + (idx + 1) / bgs.length,
			});
			this.take(bgParallax);
			this.container.addChild(bgParallax.display.container);
			bgParallax.spr.texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;

			const start = Date.now();
			bgParallax.scripts.push({
				gameObject: bgParallax,
				update() {
					const speed = 100; // TODO: speed based on typing
					bgParallax.spr.tilePosition.x =
						((Date.now() - start) / 1000) * speed * bgParallax.mult[0];
					bgParallax.spr.tilePosition.y =
						((Date.now() - start) / 1000) * speed * bgParallax.mult[1];
				},
			});
		});

		this.border = new Border();
		this.border.init();
		this.take(this.border);
		this.take(this.camera);

		this.screenFilter = new ScreenFilter();

		this.camera.display.container.addChild(this.container);

		document.addEventListener('keydown', this.onInput, {
			capture: true,
		});

		this.textInput = new BitmapText('the ', {
			fontName: 'bmfont',
			align: 'center',
		});
		this.textInput.anchor.x = 0.5;
		this.container.addChild(this.textInput);
	}

	onInput = (event: KeyboardEvent) => {
		const keyReplacements: { [key: string]: string | undefined } = {
			// backspace needs special handling
			Backspace: 'Backspace',
			// might as well
			Delete: 'Backspace',
			'`': "'",
			// not in font
			'~': '',
			'[': '',
			']': '',
			'{': '',
			'}': '',
			'|': '',
		};
		const key = event.key;
		const type = keyReplacements[key] ?? (key.length > 1 ? '' : key);
		if (type === 'Backspace') {
			this.textInput.text = this.textInput.text.substring(
				0,
				this.textInput.text.length - 1
			);
		} else {
			this.textInput.text += type;
		}
	};

	textInput: BitmapText;

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
