import { randRange } from './utils';

const sounds = {
	good: [
		'mmm-hohoho',
		'oh yeah, right there right there',
		'yeahyhyh',
		'hehehehe',
		'ooh!',
		'yeah yeah yeah',
		'eheeheehee',
		'wohohoho',
		'ohohoho',
		'ahahaha',
		'hihoh!',
		'heueuhaha',
		'ah hahaha',
	],
	bad: [
		'NO!',
		'UGH!',
		'ARGH!',
		'EURGH!',
		'noooo',
		'STOP!',
		'nononono',
		'BLEH!',
		'YUCK!',
		"don't like it.",
		'nuh uh',
		'NOOO',
		'Bad.',
		'BADbad!',
	],
};

export function randomSound(sound: keyof typeof sounds) {
	const a = sounds[sound];
	const idx = Math.floor(randRange(0, a.length));
	return [idx, a[idx]] as const;
}
