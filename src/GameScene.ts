import eases from 'eases';
import {
	BitmapText,
	Container,
	DisplayObject,
	Graphics,
	SCALE_MODES,
	Sprite,
} from 'pixi.js';
import { Area } from './Area';
import { Border } from './Border';
import { Camera } from './Camera';
import { game } from './Game';
import { GameObject } from './GameObject';
import { PropParallax } from './PropParallax';
import { ScreenFilter } from './ScreenFilter';
import { Animator } from './Scripts/Animator';
import { Updater } from './Scripts/Updater';
import { TextInput } from './TextInput';
import { Tween, TweenManager } from './Tweens';
import { V } from './VMath';
import { size } from './config';
import { fontDialogue } from './font';
import { shuffle, tex } from './utils';

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

	sprPortrait: Sprite;
	sprFace: Sprite;
	animatorFace: Animator;
	sprPortrait2: Sprite;
	sprPopup: Sprite;
	textPopup: BitmapText;

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

	portraitBump = 0;
	portraitBumpTween?: Tween;

	textInput: TextInput;

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

			const start = game.app.ticker.lastTime;
			bgParallax.scripts.push({
				gameObject: bgParallax,
				update() {
					const speed = 100; // TODO: speed based on typing
					bgParallax.spr.tilePosition.x =
						((game.app.ticker.lastTime - start) / 1000) *
						speed *
						bgParallax.mult[0];
					bgParallax.spr.tilePosition.y =
						((game.app.ticker.lastTime - start) / 1000) *
						speed *
						bgParallax.mult[1];
				},
			});
		});

		this.border = new Border();
		this.border.init();
		this.take(this.border);
		this.take(this.camera);

		this.sprPortrait = new Sprite(tex('emptyFrame'));
		this.sprPortrait2 = new Sprite(tex('emptyFrame'));
		this.sprFace = new Sprite(tex('neutral'));
		this.sprPortrait.addChild(this.sprFace);
		this.sprPortrait.addChild(this.sprPortrait2);
		this.container.addChild(this.sprPortrait);
		this.sprPortrait.x -= size.x / 2 - 50;
		this.sprPortrait.y -= size.y / 2 - 50;
		this.sprPopup = new Sprite(tex('dialogueBg'));
		this.textPopup = new BitmapText('test', fontDialogue);
		this.textPopup.y += 70;
		this.textPopup.x += 170;
		this.textPopup.anchor.x = 0.5;
		this.sprPopup.addChild(this.textPopup);
		this.sprPopup.x += this.sprPortrait.width;
		this.sprPortrait.addChild(this.sprPopup);
		this.border.scripts.push(
			new Animator(this.border, {
				spr: this.sprPopup,
				freq: 1 / 200,
			})
		);

		this.border.scripts.push(
			new Updater(this.border, () => {
				this.sprPortrait.anchor.y =
					Math.sin(game.app.ticker.lastTime * 0.005) * 0.025 +
					this.portraitBump;
				this.sprPortrait.angle =
					(eases.bounceInOut(
						Math.cos(game.app.ticker.lastTime * 0.005) * 0.5 + 0.5
					) -
						0.5) *
					5;
				this.sprFace.anchor = this.sprPortrait2.anchor =
					this.sprPortrait.anchor;
			})
		);
		this.border.scripts.push(
			(this.animatorFace = new Animator(this.border, {
				spr: this.sprFace,
				freq: 1 / 100,
			}))
		);

		this.screenFilter = new ScreenFilter();

		this.camera.display.container.addChild(this.container);

		document.addEventListener('keydown', this.onInput, {
			capture: true,
		});

		this.textInput = new TextInput();
		this.textInput.setTarget('Sphinx of black quartz, hear my vow!');
		this.container.addChild(this.textInput.sprScrim);
		this.container.addChild(this.textInput.display.container);
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
		if (!type) return;
		if (type === 'Backspace') {
			this.textInput.backspace();
		} else {
			this.textInput.addCurrent(type);
			if (this.portraitBumpTween) TweenManager.abort(this.portraitBumpTween);
			this.portraitBump = 0.1;
			// @ts-expect-error weird `this` thing
			this.portraitBumpTween = TweenManager.tween(this, 'portraitBump', 0, 100);
			this.animatorFace.setAnimation(
				shuffle(['neutral', 'surprise', 'smile', 'starmouth', 'lookAround'])[0]
			);
			this.textPopup.text = shuffle([
				'oh',
				'ohh',
				'ohh',
				'ah',
				'hehe',
				'haha',
				'hee',
				'teehee',
			])[0];
		}
	};

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
