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
import { music, sfx } from './Audio';
import { Border } from './Border';
import { Camera } from './Camera';
import { Foot } from './Foot';
import { game } from './Game';
import { GameObject } from './GameObject';
import { PropParallax } from './PropParallax';
import { ScreenFilter } from './ScreenFilter';
import { Animator } from './Scripts/Animator';
import { Updater } from './Scripts/Updater';
import { randomSound } from './Sounds';
import { TextInput } from './TextInput';
import { Tween, TweenManager } from './Tweens';
import { V } from './VMath';
import { size } from './config';
import { fontDialogue } from './font';
import { lines } from './lines';
import { delay, lerp, shuffle, tex } from './utils';

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
	feet: [Foot, Foot];

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

		const vignette = new Sprite(tex('vignette'));
		vignette.anchor.x = vignette.anchor.y = 0.5;
		this.container.addChild(vignette);
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
		this.textPopup.y += 110;
		this.textPopup.x += 220;
		this.textPopup.anchor.x = 0.5;
		this.textPopup.anchor.y = 0.5;
		this.sprPopup.addChild(this.textPopup);
		this.sprPopup.x += this.sprPortrait.width;
		this.sprPortrait.addChild(this.sprPopup);
		this.border.scripts.push(
			new Animator(this.border, {
				spr: this.sprPopup,
				freq: 1 / 200,
			})
		);

		this.feet = [new Foot(), new Foot()];
		this.feet.forEach((f) => {
			this.container.addChild(f.display.container);
		});
		this.feet[1].display.container.scale.x = -1;
		this.feet[0].transform.x = -this.feet[0].display.container.width * 0.55;
		this.feet[1].transform.x = -this.feet[1].display.container.width * 0.55;
		this.take(this.feet[0]);
		this.take(this.feet[1]);

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
		this.container.addChild(this.textInput.sprScrim);
		this.container.addChild(this.textInput.display.container);
		this.textInput.display.container.y = size.y / 2 - 93 / 2 - 45;

		music('bgm');
		this.init();
	}

	async init() {
		this.textInput.display.container.alpha = 0;
		await this.say('hello');
		this.say('type "start" to tickle my feet');
		this.textInput.display.container.alpha = 1;
		{
			let { errors } = await this.requireSequence('start');
			this.textInput.setTarget('');
			this.textInput.clearCurrent();
			if (errors) {
				this.animatorFace.setAnimation('neutral');
				this.say('oops! not quite, try that again');
				errors = (await this.requireSequence('start')).errors;
				this.textInput.setTarget('');
				this.textInput.clearCurrent();
				if (errors) {
					this.animatorFace.setAnimation('surprise');
					this.say('hmm, you seem a little rusty?');
					errors = (await this.requireSequence('start')).errors;
					this.textInput.setTarget('');
					this.textInput.clearCurrent();
					if (errors) {
						this.animatorFace.setAnimation('surprise');
						await this.say('ugh fine, whatever');
						await this.say("i guess you'll have to do");
					}
				}
			}
		}

		this.doRun();
	}

	async doRun() {
		this.animatorFace.setAnimation('neutral');
		sfx('countdownCount');
		await this.say('3');
		sfx('countdownCount');
		await this.say('2');
		sfx('countdownCount');
		await this.say('1');
		sfx('countdownGo');
		this.say('GO!');
		const { errors, timeTakenInSeconds, wpm } = await this.requireSequence(
			shuffle(lines)[0]
		);

		this.sprPopup.scale.x = 2;
		this.sprPopup.scale.y = 2;
		this.textPopup.fontSize = (fontDialogue.fontSize ?? 1) / 2;

		if (errors === 0) {
			this.animatorFace.setAnimation('laughCry');
			await this.say(
				`wowee, my toes are singing!\nyou're the perfect tickler!\nyou hit all the right spots at all the right times!`
			);
			this.say(
				`you did ${Math.round(
					wpm
				)} tickles per minute in ${timeTakenInSeconds.toFixed(
					2
				)}s! why don't you type "restart" and tickle me again?`
			);
		} else if (errors <= 5) {
			this.animatorFace.setAnimation('laugh');
			await this.say(
				`wow, my feet are feelin' fly! but could you do better next time?`
			);
			this.say(
				`you did ${Math.round(
					wpm
				)} tickles per minute in ${timeTakenInSeconds.toFixed(
					2
				)}s, but you made ${errors} whoopsies! why don't you type "restart" and tickle me again?`
			);
		} else {
			this.animatorFace.setAnimation('neutral');
			await this.say(
				`ugh, it feels like the soul's been sucked out of my soles! you gotta get some finesse in those fingies!`
			);
			this.say(
				`you did ${Math.round(
					wpm
				)} tickles per minute in ${timeTakenInSeconds.toFixed(
					2
				)}s, but you made ${errors} whoopsies! why don't you type "restart" and tickle me again?`
			);
		}
		await new Promise<void>((r) => {
			const check = async () => {
				const { errors } = await this.requireSequence('restart');

				this.sprPopup.scale.x = 1;
				this.sprPopup.scale.y = 1;
				this.textPopup.fontSize = fontDialogue.fontSize;
				if (errors) {
					this.animatorFace.setAnimation('neutral');
					await this.say('seriously?');
					this.say('type "restart" to try again');
					check();
				} else {
					r();
				}
			};
			check();
		});
		this.doRun();
	}

	waiting = true;

	async say(text: string) {
		this.textPopup.text = text;
		this.bump();
		await delay(Math.max(800, text.length * 100));
	}

	async requireSequence(text: string) {
		this.waiting = false;
		this.textInput.clearCurrent();
		this.textInput.setTarget(text);
		const startTime = game.app.ticker.lastTime;
		await new Promise<void>((r) => {
			const check = () => {
				if (
					this.textInput.strCurrent.length === this.textInput.strTarget.length
				) {
					return r();
				}
				requestAnimationFrame(check);
			};
			check();
		});
		const endTime = game.app.ticker.lastTime;
		const timeTakenInSeconds = (endTime - startTime) / 1000;
		const errors = this.textInput.strCurrent
			.split('')
			.filter((i, idx) => i !== this.textInput.strTarget[idx]).length;
		this.waiting = true;
		const words = this.textInput.strTarget.length / 5;
		return {
			wpm: words / (timeTakenInSeconds / 60),
			errors,
			timeTakenInSeconds,
		};
	}

	bump() {
		if (this.portraitBumpTween) TweenManager.abort(this.portraitBumpTween);
		this.portraitBump = 0.1;
		// @ts-expect-error weird `this` thing
		this.portraitBumpTween = TweenManager.tween(this, 'portraitBump', 0, 100);
	}

	canBeHappy = true;
	canBeHappyTimeout = 0;

	canPlayGoodBadSound = true;
	canPlayGoodBadSoundTimeout = 0;

	onInput = (event: KeyboardEvent) => {
		if (this.waiting) return;
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

		const wasRight = this.textInput.isRight();

		if (type === 'Backspace') {
			this.textInput.backspace();
		} else {
			this.textInput.addCurrent(type);

			if (!this.textInput.isRight() && wasRight) {
				clearTimeout(this.canPlayGoodBadSoundTimeout);
				this.canPlayGoodBadSound = true;
			}

			// update visuals
			this.bump();
			const happyFaces = ['neutral', 'smile', 'laugh', 'laughCry'];
			const madFaces = ['starmouth', 'surprise', 'lookAround'];
			if (this.textInput.isRight() && this.canBeHappy) {
				this.animatorFace.setAnimation(
					happyFaces[
						Math.floor(
							lerp(
								0,
								happyFaces.length - 1,
								this.textInput.strCurrent.length /
									this.textInput.strTarget.length
							) + 0.5
						)
					]
				);

				if (this.canPlayGoodBadSound) {
					const [idx, text] = randomSound('good');
					sfx(`good${idx}`);
					this.textPopup.text = text;
					this.canPlayGoodBadSound = false;
					this.canPlayGoodBadSoundTimeout = window.setTimeout(() => {
						this.canPlayGoodBadSound = true;
					}, 1000);
				}
			} else if (!this.textInput.isRight()) {
				this.canBeHappy = false;
				clearTimeout(this.canBeHappyTimeout);
				this.canBeHappyTimeout = window.setTimeout(() => {
					this.canBeHappy = true;
					this.canBeHappyTimeout = 0;
				}, 1000);
				this.animatorFace.setAnimation(shuffle(madFaces)[0]);

				if (this.canPlayGoodBadSound) {
					const [idx, text] = randomSound('bad');
					sfx(`bad${idx}`);
					this.textPopup.text = text;
					this.canPlayGoodBadSound = false;
					this.canPlayGoodBadSoundTimeout = window.setTimeout(() => {
						this.canPlayGoodBadSound = true;
					}, 1000);
				}
			}

			sfx('type', {
				rate: 1 + ((type.codePointAt(0) ?? 0) % 26) / 26,
				volume: Math.random() * 0.25 + 1,
			});

			let foot = 0;
			let toe = -1;
			switch (type.toLowerCase()) {
				case '`':
				case '~':
				case '!':
				case '1':
				case 'q':
				case 'a':
				case 'z':
					toe = 4;
					break;
				case '@':
				case '2':
				case 'w':
				case 's':
				case 'x':
					toe = 3;
					break;
				case '#':
				case '3':
				case 'e':
				case 'd':
				case 'c':
					toe = 2;
					break;
				case '$':
				case '4':
				case 'r':
				case 'f':
				case 'v':
					toe = 1;
					break;
				case '%':
				case '5':
				case 't':
				case 'g':
				case 'b':
					toe = 0;
					break;
				case '^':
				case '6':
				case 'y':
				case 'h':
				case 'n':
					foot = 1;
					toe = 0;
					break;
				case '&':
				case '7':
				case 'u':
				case 'j':
				case 'm':
					foot = 1;
					toe = 1;
					break;
				case '*':
				case '8':
				case 'i':
				case 'k':
				case ',':
				case '<':
					foot = 1;
					toe = 2;
					break;
				case '(':
				case '9':
				case 'o':
				case 'l':
				case '.':
				case '>':
					foot = 1;
					toe = 3;
					break;
				case ')':
				case '0':
				case 'p':
				case ';':
				case ':':
				case '/':
				case '?':
				case '-':
				case '_':
				case '[':
				case '{':
				case "'":
				case '"':
				case '=':
				case '+':
				case ']':
				case '}':
				case '\\':
				case '|':
					foot = 1;
					toe = 4;
					break;
			}
			if (toe >= 0) {
				this.feet[foot].curl(toe);
			}
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
