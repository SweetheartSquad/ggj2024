import eases from 'eases';
import {
	BitmapText,
	Container,
	DisplayObject,
	Graphics,
	NineSlicePlane,
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
import { fontCombo, fontDialogue } from './font';
import { getLine } from './lines';
import { delay, lerp, removeFromArray, shuffle, tex } from './utils';

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

	furthest = -1;
	comboLimit = 0;
	comboLimitBreak = 0;
	combo: number = 0;
	textCombo: BitmapText;

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
	sprFeather: Sprite;
	tweenFeatherX?: Tween;
	tweenFeatherY?: Tween;
	tweenFeatherA?: Tween;

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

			let speed = 100;
			bgParallax.scripts.push({
				gameObject: bgParallax,
				update: () => {
					speed = lerp(
						speed,
						100 + (this.combo || 1) * 10,
						0.1 * game.app.ticker.deltaTime
					);
					bgParallax.spr.tilePosition.x +=
						(game.app.ticker.deltaMS / 1000) * speed * bgParallax.mult[0];
					bgParallax.spr.tilePosition.y +=
						(game.app.ticker.deltaMS / 1000) * speed * bgParallax.mult[1];
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

		const bg = new Sprite(tex('background'));
		bg.anchor.x = bg.anchor.y = 0.5;
		bg.scale.x = bg.scale.y = 2;
		this.container.addChild(bg);
		const animatorBg = new Animator(this.border, {
			spr: bg,
			freq: 1 / 100,
		});
		this.border.scripts.push(animatorBg);
		const texBorder = tex('border');
		const spr = new NineSlicePlane(
			texBorder,
			texBorder.width / 3,
			texBorder.height / 3,
			texBorder.width / 3,
			texBorder.height / 3
		);
		spr.name = 'border';
		spr.width = bg.width;
		spr.height = bg.height;
		spr.x -= spr.width / 2;
		spr.y -= spr.height / 2;
		this.container.addChild(spr);
		this.border.scripts.push({
			gameObject: this.border,
			update: () => {
				animatorBg.freq =
					(1 + Math.max(this.combo, 0) / Math.max(this.comboLimit, 1)) / 150;
				bg.tint = parseInt(
					`0x${Math.floor(
						lerp(
							128,
							255,
							Math.sin(game.app.ticker.lastTime * 0.001) * 0.5 + 0.5
						)
					).toString(16)}${Math.floor(
						lerp(
							128,
							255,
							Math.sin(
								game.app.ticker.lastTime * 0.001 + (Math.PI * 2 * 1) / 3
							) *
								0.5 +
								0.5
						)
					).toString(16)}${Math.floor(
						lerp(
							128,
							255,
							Math.sin(
								game.app.ticker.lastTime * 0.001 + (Math.PI * 2 * 2) / 3
							) *
								0.5 +
								0.5
						)
					).toString(16)}`
				);
			},
		});

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
		this.sprFeather = new Sprite(tex('feather'));
		this.sprFeather.anchor.x = 0.2;
		this.sprFeather.anchor.y = 0.8;
		this.container.addChild(this.sprFeather);

		this.textCombo = new BitmapText(``, fontCombo);
		this.container.addChild(this.textCombo);
		this.textCombo.x = size.x / 2 - 170;
		this.textCombo.y = -size.y / 2 + 260;

		this.border.scripts.push(
			new Updater(this.border, () => {
				if (this.combo) {
					this.textCombo.text = `x${this.combo}${'!'.repeat(
						Math.floor(this.combo / 10)
					)}`;
				} else {
					this.textCombo.text = '';
				}
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
		this.container.addChild(this.textInput.sprScrim);
		this.container.addChild(this.textInput.display.container);

		music('bgm');
		this.init();
	}

	async init() {
		sfx(`good0`, { rate: Math.random() * 0.5 + 1.5 });
		await this.say('hello');
		sfx(`good0`, { rate: Math.random() * 0.5 + 1.5 });
		this.say('type "start" to tickle my feet');
		{
			let { errors } = await this.requireSequence('start');
			this.textInput.setTarget('');
			this.textInput.clearCurrent();
			if (errors) {
				sfx(`bad0`, { rate: Math.random() * 0.5 + 1.5 });
				this.animatorFace.setAnimation('laugh');
				this.say('oops! not quite, try that again');
				errors = (await this.requireSequence('start')).errors;
				this.textInput.setTarget('');
				this.textInput.clearCurrent();
				if (errors) {
					sfx(`bad4`, { rate: Math.random() * 0.5 + 1.5 });
					this.animatorFace.setAnimation('neutral');
					this.say('hmm, you seem a little rusty?');
					errors = (await this.requireSequence('start')).errors;
					this.textInput.setTarget('');
					this.textInput.clearCurrent();
					if (errors) {
						sfx(`bad1`, { rate: Math.random() * 0.5 + 1.5 });
						this.animatorFace.setAnimation('annoyed');
						await this.say('ugh fine, whatever');
						await this.say("i guess you'll have to do");
					}
				}
			}
		}

		this.doRun();
	}

	async doRun() {
		const sprClockHands = new Sprite(tex('clockHands'));
		const sprClockBody = new Sprite(tex('clockBody'));
		sprClockHands.x = sprClockBody.x = size.x / 2 - 140;
		sprClockHands.y = sprClockBody.y = -size.y / 2 + 140;
		sprClockHands.anchor.x =
			sprClockHands.anchor.y =
			sprClockBody.anchor.x =
			sprClockBody.anchor.y =
				0.5;
		this.container.addChild(sprClockBody);
		this.container.addChild(sprClockHands);
		sprClockHands.alpha = sprClockBody.alpha = 0.25;

		this.combo = 0;
		this.furthest = -1;

		this.animatorFace.setAnimation('neutral');
		this.textInput.setTarget('');
		sfx('countdown3');
		await this.say('3');
		sprClockHands.alpha = sprClockBody.alpha = 0.5;
		sfx('countdown2');
		await this.say('2');
		sprClockHands.alpha = sprClockBody.alpha = 0.75;
		sfx('countdown1');
		await this.say('1');
		sprClockHands.alpha = sprClockBody.alpha = 1;
		const start = game.app.ticker.lastTime;
		const spinner = new Updater(this.border, () => {
			sprClockBody.angle =
				((game.app.ticker.lastTime - start) / 1000 / 60) * 360;
		});
		this.border.scripts.push(spinner);
		sfx('countdownGo');
		this.say('GO!');
		this.reacting = true;
		const line = getLine();

		this.comboLimit = Math.floor(line.split(' ').length * 0.4);
		this.comboLimitBreak = 0;
		const { errors, timeTakenInSeconds, wpm } = await this.requireSequence(
			line
		);
		this.reacting = false;

		sfx('endBuzzer');
		sprClockHands.destroy();
		sprClockBody.destroy();
		removeFromArray(this.border.scripts, spinner);
		spinner.destroy?.();
		this.say(`that's it!`);
		this.combo = 0;
		await delay(2000);

		this.sprPopup.scale.x = 2;
		this.sprPopup.scale.y = 2;
		this.textPopup.fontSize = (fontDialogue.fontSize ?? 1) / 2;

		if (errors === 0) {
			this.animatorFace.setAnimation('laughCry');
			this.textInput.setTarget('');
			sfx(`good12`, { rate: Math.random() * 0.5 + 1.5 });
			await this.say(
				`wowee, my toes are singing!\nyou're the perfect tickler!\nyou hit all the right spots at all the right times!`
			);
			sfx(`good0`, { rate: Math.random() * 0.5 + 1.5 });
			this.say(
				`you did ${Math.round(
					wpm
				)} tickles per minute in ${timeTakenInSeconds.toFixed(
					2
				)}s! why don't you type "restart" and tickle me again?`
			);
		} else if (errors <= 5) {
			this.animatorFace.setAnimation('laugh');
			this.textInput.setTarget('');
			sfx(`good11`, { rate: Math.random() * 0.5 + 1.5 });
			await this.say(
				`wow, my feet are feelin' fly! but could you do better next time?`
			);
			sfx(`good0`, { rate: Math.random() * 0.5 + 1.5 });
			this.say(
				`you did ${Math.round(
					wpm
				)} tickles per minute in ${timeTakenInSeconds.toFixed(
					2
				)}s, but you made ${errors} whoopsies! why don't you type "restart" and tickle me again?`
			);
		} else {
			this.animatorFace.setAnimation('annoyed');
			this.textInput.setTarget('');
			sfx(`bad1`, { rate: Math.random() * 0.5 + 1.5 });
			await this.say(
				`ugh, it feels like the soul's been sucked out of my soles! you gotta get some finesse in those fingies!`
			);
			sfx(`good0`, { rate: Math.random() * 0.5 + 1.5 });
			this.animatorFace.setAnimation('neutral');
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
					sfx(`bad1`, { rate: Math.random() * 0.5 + 1.5 });
					await this.say('seriously?');
					sfx(`good0`, { rate: Math.random() * 0.5 + 1.5 });
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

	reacting = false;

	async say(text: string) {
		this.textPopup.text = text;
		this.bump();
		await delay(Math.max(800, text.length * 80));
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
		event.preventDefault();
		if (type === 'Backspace') {
			this.textInput.backspace();
		} else {
			this.textInput.addCurrent(type);
			if (
				this.textInput.strTarget[this.textInput.strCurrent.length] === ' ' &&
				this.textInput.strCurrent.length > this.furthest
			) {
				this.canPlayGoodBadSound = true;

				if (
					this.reacting &&
					this.textInput.strCurrent.endsWith(
						this.textInput.strTarget
							.substring(0, this.textInput.strCurrent.length)
							.split(' ')
							.pop() || ''
					)
				) {
					const [idx, text] = randomSound('good');
					sfx(`good${idx}`, { rate: Math.random() * 0.5 + 1.5 });
					this.screenFilter.flash([1, 1, 1, 0.05], 150);
					this.textPopup.text = text;
					++this.combo;

					if (this.combo && this.combo % this.comboLimit === 0) {
						// do combo limit break
						console.log('limit break');
						++this.comboLimitBreak;
						const current = this.textInput.strCurrent;
						const split = [
							this.textInput.strTarget.substring(
								0,
								this.textInput.strCurrent.length + 1
							),
							getTickles(),
							' ',
							this.textInput.strTarget.substring(
								this.textInput.strCurrent.length + 1
							),
						];
						split.splice(1, 0, 'blahblahblah');
						this.textInput.setTarget(split.join(''));
						current.split('').forEach((i) => {
							this.textInput.addCurrent(i);
						});
					}
				}
			}

			// update visuals
			this.bump();
			const happyFaces = [
				'neutral',
				'lookAround',
				'surprise',
				'smile',
				'laugh',
				'starmouth',
				'laughCry',
			];
			const madFaces = ['annoyed'];
			if (this.reacting && this.textInput.isRight() && this.canBeHappy) {
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
			} else if (this.reacting && !this.textInput.isRight()) {
				this.canBeHappy = false;
				clearTimeout(this.canBeHappyTimeout);
				this.canBeHappyTimeout = window.setTimeout(() => {
					this.canBeHappy = true;
					this.canBeHappyTimeout = 0;
				}, 1000);
				this.animatorFace.setAnimation(shuffle(madFaces)[0]);

				if (this.canPlayGoodBadSound) {
					const [idx, text] = randomSound('bad');
					sfx(`bad${idx}`, { rate: Math.random() * 0.5 + 1.5 });
					this.screenFilter.flash([1, 0, 0, 0.1], 150);
					this.textPopup.text = text;
					this.canPlayGoodBadSound = false;
					this.combo = 0;
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
				const [x, y] = [
					[
						[-110, 120],
						[-240, 110],
						[-310, 140],
						[-340, 200],
						[-390, 260],
					],
					[
						[110, 120],
						[240, 110],
						[310, 140],
						[340, 200],
						[390, 260],
					],
				][foot][toe];
				if (this.tweenFeatherX) TweenManager.abort(this.tweenFeatherX);
				if (this.tweenFeatherY) TweenManager.abort(this.tweenFeatherY);
				if (this.tweenFeatherA) TweenManager.abort(this.tweenFeatherA);
				this.tweenFeatherX = TweenManager.tween(
					this.sprFeather,
					'x',
					x - this.sprFeather.width * (1 - this.sprFeather.anchor.x),
					150,
					undefined,
					eases.circInOut
				);
				this.tweenFeatherY = TweenManager.tween(
					this.sprFeather,
					'y',
					y + this.sprFeather.height * (1 - this.sprFeather.anchor.y),
					150,
					undefined,
					eases.circInOut
				);
				this.tweenFeatherA = TweenManager.tween(
					this.sprFeather,
					'angle',
					0,
					300,
					1,
					(t) => Math.sin(t * Math.PI * 2 * 3 + Math.PI) * 20 * eases.backOut(t)
				);
			}

			this.furthest = Math.max(this.furthest, this.textInput.strCurrent.length);
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

		this.sprFeather.pivot.y = Math.sin(curTime * 0.005) * 5;
		this.sprFeather.pivot.x = Math.sin(curTime * 0.0025) * 5;

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
