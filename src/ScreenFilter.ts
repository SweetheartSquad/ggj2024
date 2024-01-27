import eases from 'eases';
import { Rectangle, Texture, WRAP_MODES } from 'pixi.js';
import { CustomFilter } from './CustomFilter';
import { game, resource } from './Game';
import { Tween, TweenManager } from './Tweens';
import { size } from './config';
import { getActiveScene } from './main';

type Uniforms = {
	overlay: [number, number, number, number];
	invert: number;
	curTime: number;
	camPos: [number, number];
	ditherGridMap: Texture;
};

export class ScreenFilter extends CustomFilter<Uniforms> {
	constructor(uniforms?: Partial<Uniforms>) {
		const texDitherGrid = resource<Texture>('ditherGrid');
		if (!texDitherGrid) throw new Error('Could not find ditherGrid');
		texDitherGrid.baseTexture.wrapMode = WRAP_MODES.REPEAT;
		super(resource<string>('postprocess.frag'), {
			overlay: [0, 0, 0, 0],
			invert: 0,
			curTime: 0,
			camPos: [0, 0],
			ditherGridMap: texDitherGrid,
			...uniforms,
		});
		window.screenFilter = this;
		this.padding = 0;
		this.autoFit = false;
		game.app.stage.filters = [this];
		game.app.stage.filterArea = new Rectangle(0, 0, size.x, size.y);
	}

	reload() {
		game.app.stage.filters = null;
		const n = new ScreenFilter({
			overlay: this.uniforms.overlay,
			invert: this.uniforms.invert,
			curTime: this.uniforms.curTime,
			camPos: this.uniforms.camPos,
		});
		window.screenFilter = n;
		game.app.stage.filters = [n];
		const scene = getActiveScene();
		if (scene?.screenFilter) scene.screenFilter = n;
		this.destroy();
	}

	tweenFlash: Tween[] = [];

	flash(
		colour: [number, number, number] | [number, number, number, number],
		duration: number,
		ease: (t: number) => number = eases.linear
	) {
		this.tweenFlash.forEach((i) => TweenManager.abort(i));
		this.tweenFlash.length = 0;
		this.tweenFlash = [
			TweenManager.tween(
				this.uniforms.overlay,
				0,
				0,
				duration,
				colour[0],
				ease
			),
			TweenManager.tween(
				this.uniforms.overlay,
				1,
				0,
				duration,
				colour[1],
				ease
			),
			TweenManager.tween(
				this.uniforms.overlay,
				2,
				0,
				duration,
				colour[2],
				ease
			),
			TweenManager.tween(
				this.uniforms.overlay,
				3,
				0,
				duration,
				colour[3] ?? 1,
				ease
			),
		];
	}
}
