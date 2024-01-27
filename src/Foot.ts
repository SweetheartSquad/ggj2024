import eases from 'eases';
import { Sprite } from 'pixi.js';
import { game } from './Game';
import { GameObject } from './GameObject';
import { Display } from './Scripts/Display';
import { Transform } from './Scripts/Transform';
import { Tween, TweenManager } from './Tweens';
import { tex } from './utils';

export class Foot extends GameObject {
	transform: Transform;
	display: Display;
	toes: Sprite[] = [];
	timeouts: number[] = [];
	base: Sprite;
	offset = 0;
	private static offseter = 0;
	bump = 0;
	tweenBump?: Tween;
	constructor() {
		super();
		this.offset = Foot.offseter++;
		this.scripts.push((this.transform = new Transform(this)));
		this.scripts.push((this.display = new Display(this)));
		this.base = new Sprite(tex('foot'));
		this.base.anchor.x = 0.5;
		new Array(5).fill(0).map((_, idx) => {
			const s = new Sprite(tex(`toe${idx}.1`));
			s.anchor.x = 0.5;
			this.toes.push(s);
		});
		this.toes.forEach((toe) => this.display.container.addChild(toe));
		this.display.container.addChild(this.base);
	}

	curl(toe: number) {
		this.toes[toe].texture = tex(`toe${toe}.2`);
		this.timeouts[toe] = window.setTimeout(() => {
			this.uncurl(toe);
		}, 200);
		if (this.tweenBump) TweenManager.abort(this.tweenBump);
		this.tweenBump = TweenManager.tween(
			this,
			'bump',
			// @ts-expect-error annoying this thing
			0,
			200,
			10,
			eases.bounceOut
		);
	}
	uncurl(toe: number) {
		this.toes[toe].texture = tex(`toe${toe}.1`);
		clearTimeout(this.timeouts[toe]);
		this.timeouts[toe] = 0;
	}
	update(): void {
		this.display.container.pivot.y =
			Math.sin(game.app.ticker.lastTime * 0.01 + this.offset) * 5 + this.bump;
	}
}
