import HowlerLoaderParser from 'howler-pixi-loader-middleware';
import {
	Application,
	Assets,
	BaseTexture,
	Container,
	DisplayObject,
	NineSlicePlane,
	ProgressCallback,
	Renderer,
	SCALE_MODES,
	Sprite,
	Text,
	Texture,
	extensions,
	loadTxt,
	settings,
	utils,
} from 'pixi.js';
import { getMusic, music } from './Audio';
import { enableHotReload } from './GameHotReload';
import { Animator } from './Scripts/Animator';
import { Display } from './Scripts/Display';
import { size } from './config';
import * as fonts from './font';
import { error } from './logger';
import { getActiveScene, init } from './main';
import { tex, unique } from './utils';
// eslint-disable-next-line import/extensions, import/no-absolute-path
import assets from '/assets.txt?url';

// PIXI configuration stuff
BaseTexture.defaultOptions.scaleMode = SCALE_MODES.NEAREST;
settings.ROUND_PIXELS = true;

function cacheBust(url: string) {
	if (url.startsWith('data:') || url.startsWith('http')) return url;
	const urlObj = new URL(url, window.location.href);
	urlObj.searchParams.set('t', BUILD_HASH || '');
	return urlObj.toString();
}

const frameCounts: Record<string, number> = {};
export const resources: Record<string, unknown> = {};

export function resource<T>(key: string) {
	return resources[key] as T | undefined;
}

export function getFrameCount(animation: string): number {
	return frameCounts[animation] || 0;
}

window.resources = resources;
window.resource = resource;

function getAssetName(file: string) {
	return file.split('/').pop()?.split('.').slice(0, -1).join('.') || file;
}

function updateResourceCache(assetsLoaded: Record<string, unknown>) {
	// update public cache
	Object.keys(assetsLoaded).forEach((i) => delete resources[i]);
	Object.entries(assetsLoaded).forEach(([key, value]) => {
		resources[key] = value;
	});

	unique(
		Object.keys(assetsLoaded)
			.filter((i) => i.match(/\.\d+$/))
			.map((i) => i.replace(/\.\d+$/, ''))
	).forEach((i) => {
		// cache frame sequence data
		frameCounts[i] = Object.keys(resources).filter((j) =>
			j.startsWith(`${i}.`)
		).length;

		// cache alias to first frame under non-numbered key
		resources[i] = resources[`${i}.1`];
	});
}

export async function loadAssetResources() {
	if (Object.keys(resources).length) {
		await Assets.unload(cacheBust(assets));
	}
	const assetsData = (await Assets.load<string>(cacheBust(assets))) as string;
	const assetResources = assetsData
		.trim()
		.split(/\r?\n/)
		.flatMap((i) => {
			if (i.match(/\.x\d+\./)) {
				const [base, count, ext] = i.split(/\.x(\d+)\./);
				return new Array(parseInt(count, 10))
					.fill('')
					.map((_, idx) => `${base}.${idx + 1}.${ext}`);
			}
			return i;
		})
		.filter((i) => i && !i.startsWith('//'))
		.reduce<Record<string, string>>((acc, i) => {
			const name = getAssetName(i);
			const url = i.startsWith('http') ? i : `assets/${i}`;
			if (acc[name])
				throw new Error(`Asset name conflict: "${acc[name]}", "${url}"`);
			acc[name] = cacheBust(url);
			return acc;
		}, {});
	return assetResources;
}

export class Game {
	app: Application;

	startTime: number;

	constructor() {
		const canvas = document.createElement('canvas');
		this.app = new Application({
			view: canvas,
			width: size.x,
			height: size.y,
			antialias: false,
			backgroundAlpha: 1,
			resolution: 1,
			clearBeforeRender: true,
			backgroundColor: 0x000000,
		});
		this.startTime = Date.now();
	}

	async load(onLoad?: ProgressCallback) {
		Assets.init();

		// parse .glsl as plaintext
		const loadTextTest = loadTxt.test;
		loadTxt.test = (url) =>
			loadTextTest?.(url) || utils.path.extname(url).includes('.glsl');
		extensions.add(HowlerLoaderParser);

		// load assets list
		const assetResources = await loadAssetResources();

		// load assets
		Assets.addBundle('resources', assetResources);
		const assetsLoaded = await Assets.loadBundle('resources', onLoad);

		// verify assets loaded
		const failedToLoad = Object.keys(assetResources)
			.filter((i) => !assetsLoaded[i])
			.join(', ');
		if (failedToLoad) throw new Error(`Failed to load: ${failedToLoad}`);

		updateResourceCache(assetsLoaded);

		// preload fonts
		Object.values(fonts).forEach((i) => {
			const t = new Text('preload', i);
			t.alpha = 0;
			this.app.stage.addChild(t);
			this.app.stage.render(this.app.renderer as Renderer);
			this.app.stage.removeChild(t);
		});
	}

	private async reloadAssetRaw(asset: string) {
		this.app.ticker.stop();

		function recurseChildren(
			result: DisplayObject[],
			obj: DisplayObject
		): DisplayObject[] {
			result = result.concat(obj);
			if (!(obj instanceof Container)) return result;
			return result.concat(
				...(obj as Container).children.map((i) => recurseChildren([], i))
			);
		}

		const scene = getActiveScene();
		const assetName = getAssetName(asset);
		const oldAsset = resource(assetName);
		let unload: (() => Promise<void>) | undefined;
		let reload: (() => Promise<void>) | undefined;

		const isTexture = !!(oldAsset as Texture)?.baseTexture;
		if (isTexture) {
			type Textured = Sprite | NineSlicePlane;
			let textures: [Textured, string][];
			unload = async () => {
				const objs = recurseChildren([], this.app.stage).concat(
					...Object.values(scene?.areas || [])
						.flat()
						.flatMap((i) => i?.getScripts(Display))
						.filter((i) => i)
						.map((i) => recurseChildren([], (i as Display).container))
				);
				textures = (
					objs.filter(
						(i) => (i as Textured)?.texture === oldAsset
					) as Textured[]
				)
					.map((i) => [i, i?.texture?.textureCacheIds[1]])
					.filter(([, id]) => id) as [Textured, string][];
			};
			reload = async () => {
				textures.forEach(([textured, texId]) => {
					if ((textured as NineSlicePlane).shader) {
						(textured as NineSlicePlane).shader.uniforms.uSampler.baseTexture =
							tex(texId).baseTexture;
					}
					textured.texture = tex(texId);
				});
			};
		}
		const playing = getMusic();
		if (playing?.howl && (oldAsset as Howl) === playing.howl) {
			unload = async () => {
				music('', { fade: 0, restart: true });
			};
			reload = async () => {
				music(playing.music, { ...playing, fade: 0, restart: true });
			};
		}

		await unload?.();
		if (resources[assetName]) await Assets.unload(assetName);
		const newAsset = await Assets.load({
			name: assetName,
			src: asset,
		}).catch((err) => {
			if (isTexture) {
				error(err);
				return tex('error');
			}
			throw err;
		});
		updateResourceCache({
			[assetName]: newAsset,
		});
		await reload?.();

		scene?.screenFilter.reload();

		this.app.ticker.start();
	}

	private async reloadManifestRaw() {
		this.app.ticker.stop();

		const oldAssets = Object.keys(resources);
		const updatedAssets = await loadAssetResources();
		const newAssets = Object.keys(updatedAssets)
			.filter((i) => !oldAssets.includes(i))
			.map((i) => updatedAssets[i]);
		const deletedAssets = oldAssets.filter((i) => !updatedAssets[i]);
		deletedAssets.map((i) => delete resources[i]);
		await Promise.all(newAssets.map((i) => window.game?.reloadAssetRaw(i)));

		updateResourceCache(
			Object.fromEntries(
				await Promise.all(
					Object.entries(updatedAssets).map(async ([k, v]) => [
						k,
						await Assets.load(v),
					])
				)
			)
		);

		window.gameObjects?.forEach((i) => {
			i.getScripts(Animator).forEach((animator) => {
				const a = animator.animation;
				animator.animation = '';
				animator.setAnimation(a, animator.holds);
			});
		});

		this.app.ticker.start();
	}

	private reloadingAssets = Promise.resolve();

	async reloadAsset(asset: string) {
		this.reloadingAssets = this.reloadingAssets.then(() =>
			this.reloadAssetRaw(asset)
		);
		return this.reloadingAssets;
	}

	async reloadManifest() {
		this.reloadingAssets = this.reloadingAssets.then(() =>
			this.reloadManifestRaw()
		);
		return this.reloadingAssets;
	}

	init = init;
}

export const game = new Game();
window.game = game;

enableHotReload();
