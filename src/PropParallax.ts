import { SCALE_MODES, TilingSprite } from 'pixi.js';
import { GameObject } from './GameObject';
import { Animator } from './Scripts/Animator';
import { Display } from './Scripts/Display';
import { Transform } from './Scripts/Transform';
import { V } from './VMath';
import { size } from './config';
import { tex } from './utils';

export class PropParallax extends GameObject {
	spr: TilingSprite;

	animator?: Animator;

	transform: Transform;

	display: Display;

	mult: [number, number];

	tileOffset: V;

	offset: number;

	constructor({
		texture,
		x = 0,
		y = 0,
		alpha = 1,
		scale = 1,
		animate = true,
		flip,
		blur,
		offset = 0,
		mult = 1,
		freq = 1 / 400,
	}: {
		texture: string;
		x?: number;
		y?: number;
		alpha?: number;
		scale?: number;
		blur?: boolean;
		flip?: boolean;
		animate?: boolean;
		offset?: number;
		mult?: number | [number, number];
		freq?: number;
	}) {
		super();

		const t = tex(texture);
		this.spr = new TilingSprite(t, size.x + 2, size.y + 2);
		if (blur) {
			this.spr.texture.baseTexture.scaleMode = SCALE_MODES.LINEAR;
		}
		this.spr.anchor.x = 0.5;
		this.spr.anchor.y = 0.5;
		this.spr.alpha = alpha;
		this.spr.tileScale.x = this.spr.tileScale.y = scale;
		if (flip) {
			this.spr.scale.x *= -1;
		}

		this.scripts.push((this.transform = new Transform(this)));
		this.scripts.push((this.display = new Display(this)));
		if (animate && t.textureCacheIds[1].match(/\.\d+$/)) {
			this.scripts.push(
				(this.animator = new Animator(this, {
					spr: this.spr,
					freq,
				}))
			);
			this.animator.offset = Math.random() * 10000;
		}

		this.display.container.addChild(this.spr);

		this.offset = offset;
		this.spr.y -= offset;
		this.transform.y += offset;

		this.mult = typeof mult === 'number' ? [mult, mult] : mult;
		this.tileOffset = {
			x,
			y,
		};
		this.display.updatePosition();
		this.init();
	}
}
