import eases from 'eases';
import { BitmapText, NineSlicePlane } from 'pixi.js';
import { game } from './Game';
import { GameObject } from './GameObject';
import { Display } from './Scripts/Display';
import { Tween, TweenManager } from './Tweens';
import { fontInput } from './font';
import { tex } from './utils';

const padding = {
	x: 60,
	y: 60,
};
const tintCurrent = 0x00ff00;
const tintUpcoming = 0xbbbbbb;
const tintWrong = 0xff0000;
const tintRight = 0xffffff;
export class TextInput extends GameObject {
	display: Display;
	text: BitmapText[] = [];
	sprScrim: NineSlicePlane;

	strTarget = '';
	strCurrent = '';

	tweenX?: Tween;

	constructor() {
		super();
		this.scripts.push((this.display = new Display(this)));
		const texScrim = tex('textBg');
		this.sprScrim = new NineSlicePlane(
			texScrim,
			texScrim.baseTexture.width / 2,
			0,
			texScrim.baseTexture.width / 2,
			0
		);
		padding.x = texScrim.baseTexture.width / 4;
	}

	setTarget(str: string) {
		this.strTarget = str;
		this.text.forEach((i) => i.destroy());
		this.text.length = 0;
		this.strTarget.split('').forEach((i, idx) => {
			const t = new BitmapText(i, fontInput);
			this.text.push(t);
			t.x = Math.max(
				0,
				(this.text[idx - 1]?.x ?? 0) +
					(this.text[idx - 1]?.width ?? 0) +
					(fontInput.letterSpacing ?? 0)
			);
			this.display.container.addChild(t);
		});
		this.display.container.x = -this.display.container.width / 2;
		this.sprScrim.width = this.display.container.width + padding.x * 2;
		this.sprScrim.height = this.display.container.height + padding.y;
		this.clearCurrent();
	}

	getX() {
		return 0 - (this.text[this.strCurrent.length - 1]?.x ?? 0);
	}

	clearCurrent() {
		this.strCurrent = '';
		this.text.forEach((i, idx) => {
			i.text = this.strTarget[idx];
			i.anchor.x = 0;
			i.anchor.y = 0;
			i.tint = tintUpcoming;
		});
		if (this.text[0]) this.text[0].tint = tintCurrent;
		if (this.tweenX) TweenManager.abort(this.tweenX);
		this.display.container.x = this.getX();
	}

	addCurrent(str: string) {
		if (this.strCurrent.length >= this.strTarget.length) return;
		this.strCurrent = `${this.strCurrent}${str}`;
		const idx = this.strCurrent.length - 1;
		const i = this.text[idx];
		i.anchor.x = 0;
		i.anchor.y = 0;
		if (this.strCurrent[idx] !== this.strTarget[idx]) {
			i.text = this.strCurrent[idx];
			if (i.text === ' ') i.text = '_';
			i.tint = tintWrong;
		} else {
			i.tint = tintRight;
		}
		const next = this.text[idx + 1];
		if (next) next.tint = tintCurrent;
		if (this.tweenX) TweenManager.abort(this.tweenX);
		this.tweenX = TweenManager.tween(
			this.display.container,
			'x',
			this.getX(),
			100,
			undefined,
			eases.circOut
		);
	}

	isRight() {
		return (
			this.strCurrent[this.strCurrent.length - 1] ===
			this.strTarget[this.strCurrent.length - 1]
		);
	}

	backspace() {
		if (!this.strCurrent.length) return;
		this.strCurrent = this.strCurrent.substring(0, this.strCurrent.length - 1);
		const idx = this.strCurrent.length;
		if (idx < 0) return;
		this.text[idx].tint = tintCurrent;
		this.text[idx].text = this.strTarget[idx];
		if (!this.text[idx + 1]) return;
		this.text[idx + 1].tint = tintUpcoming;
		this.text[idx + 1].text = this.strTarget[idx + 1];
		if (this.tweenX) TweenManager.abort(this.tweenX);
		this.tweenX = TweenManager.tween(
			this.display.container,
			'x',
			this.getX(),
			100,
			undefined,
			eases.circOut
		);
	}

	update() {
		const t = game.app.ticker.lastTime;
		this.text.forEach((i, idx) => {
			if (
				this.strCurrent.length > idx &&
				this.strCurrent[idx] !== this.strTarget[idx]
			) {
				i.y = 0;
				i.anchor.x = (Math.random() - 0.5) * 0.1;
				i.anchor.y = (Math.random() - 0.5) * 0.1;
			} else if (this.strCurrent.length > idx) {
				i.y = Math.sin(t * 0.01 + idx * 0.5) * 4;
			} else {
				i.y = Math.sin(t * 0.01 + idx * 0.5) * 2;
			}
		});
		this.sprScrim.x = this.display.container.x - padding.x;
		this.sprScrim.y = this.display.container.y - padding.y / 2;
		this.sprScrim.alpha = this.display.container.alpha;
	}
}
