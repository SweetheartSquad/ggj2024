import eases from 'eases';
import { BitmapText, NineSlicePlane } from 'pixi.js';
import { game } from './Game';
import { GameObject } from './GameObject';
import { Display } from './Scripts/Display';
import { Tween, TweenManager } from './Tweens';
import { fontInput } from './font';
import { tex } from './utils';

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
		this.sprScrim = new NineSlicePlane(tex('textBg'));
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
		this.setCurrent('');
	}

	setCurrent(str: string) {
		this.strCurrent = str;
		this.text.forEach((i, idx) => {
			i.text = this.strTarget[idx];
			if (this.strCurrent.length === idx) {
				i.tint = 0x00ff00;
			} else if (this.strCurrent.length <= idx) {
				i.tint = 0xbbbbbb;
			} else if (this.strCurrent[idx] !== this.strTarget[idx]) {
				i.text = this.strCurrent[idx];
				if (i.text === ' ') i.text = '_';
				i.tint = 0xff0000;
			} else {
				i.tint = 0xffffff;
			}
		});
		if (this.tweenX) TweenManager.abort(this.tweenX);
		this.tweenX = TweenManager.tween(
			this.display.container,
			'x',
			-this.display.container.width / 2 - this.strCurrent.length * 12,
			100,
			undefined,
			eases.circOut
		);
	}

	update() {
		const t = game.app.ticker.lastTime;
		this.text.forEach((i, idx) => {
			i.y = Math.sin(t * 0.01 + idx * 0.5) * 5;
		});
		const padding = 10;
		this.sprScrim.x = this.display.container.x - padding;
		this.sprScrim.y = this.display.container.y - padding;
		this.sprScrim.width = this.display.container.width + padding;
		this.sprScrim.height = this.display.container.height + padding;
	}
}
