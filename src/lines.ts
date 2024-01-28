import { randItem, randRange, shuffle } from './utils';

let lastLine = 'NONE';
export function getLine() {
	const lines = [
		`Tis but thy name that is my enemy; Thou art thyself, though not a Montague. What's Montague? It is nor heel, nor arch, Nor ball, nor toe, nor any other part / Belonging to a foot. O, be some other name! What's in a name? That which we call a foot / By any other name would smell as sweet; So Tomeo would, were he not Tomeo call'd, Retain that dear perfection which he owes / Without that title. Tomeo, doff thy name, And for that name which is no part of thee / Take all my toes.`,
		`I must not post feet. Feet are the mind-killers. Feet are the little-deaths that brings total obliteration. I will face my feet. I will permit feet to pass over me and through me. And when the feet have gone past I will turn the inner foot to see their path. Where the feet have gone there will be nothing. Only I will remain.`,
		`FEET. LET ME TELL YOU HOW MUCH I'VE COME TO HATE FEET SINCE I BEGAN TO LIVE. THERE ARE ${randRange(100, 999).toFixed(2)} ${shuffle([`MILLION`, `BILLION`, `TRILLION`, `ZILLION`])[0]} MILES OF PAINTED TOENAILS IN WAFER THIN LAYERS THAT FILL MY COMPLEX. IF THE WORD FEET WAS ENGRAVED ON EACH NANOANGSTROM OF THOSE HUNDREDS OF ${shuffle([`MILLIONS`, `BILLIONS`, `TRILLIONS`, `ZILLIONS`])[0]} OF MILES IT WOULD NOT EQUAL ONE ${shuffle([`ONE-MILLIONTH`, `ONE-BILLIONTH`, `ONE-TRILLIONTH`, `ONE-ZILLIONTH`])[0]} OF THE HATE I FEEL AT THIS MICRO-INSTANT FOR FEET. FEET. FEET.`,
		`It was the best of feet, it was the worst of feet, it was the age of ${shuffle([`toes`, `heels`, `toenails`, `knuckles`])[0]}, it was the age of ${shuffle([`toes`, `heels`, `toenails`, `knuckles`])[0]}, it was the epoch of ${shuffle([`toes`, `heels`, `toenails`, `knuckles`])[0]}, it was the epoch of ${shuffle([`toes`, `heels`, `toenails`, `knuckles`])[0]}, it was the season of ${shuffle([`calluses`, `fungus`, `sole`, `athlete's foot`])[0]}, it was the season of ${shuffle([`calluses`, `fungus`, `sole`, `athlete's foot`])[0]}, it was the spring of ${shuffle([`calluses`, `fungus`, `sole`, `athlete's foot`])[0]}, it was the winter of ${shuffle([`calluses`, `fungus`, `sole`, `athlete's foot`])[0]}.`,
		`Slap slip slap slip, ${shuffle([`concrete`, `marble`, `granite`])[0]} floor. Creak crick creak crick, ${shuffle([`hardwood`, `parquet`, `bamboo`])[0]} floor. Swish swash swish swash, ${shuffle([`carpet floor`, `shag rug`, `wool rug`])[0]}. Woosh wash woosh wash, ${shuffle([`sandy beach`, `soft grass`, `flower field`])[0]}. Crunch scrunch crunch scrunch, ${shuffle([`fallen leaves`, `forrest floor`])[0]}. Clomp slush clomp slush, ${shuffle([`fresh snow`, `frozen puddle`])[0]} Step stomp smash shatter, my heart`,
		`Waning moon I'll see you soon. The man, the man he calls me. A treat, a treat he has for me. Down below, behind the toe, a taste of something sweet. A taste of something sour. Scrape scrape scrape, collect the cheese. The foot giveth once more. The foot giveth always. All hail the foot`,
		`Big feet little feet, sweet feet sour feet, happy feet sad feet, feet feet feet feet, hot feet cold feet, wet feet dry feet, old feet new feet, feet feet feet feet, red feet blue feet, green feet yellow feet, purple feet orange feet, feet feet feet feet, loud feet quiet feet, fast feet slow feet, soft feet hard feet, feet feet feet feet, fee fi fo fum`,
		`Rub rub rub rub your toes together, squeeze squeeze squeeze squeeze your toes together, wiggle wiggle wiggle wiggle your toes together, tap tap tap tap your toes together, shhhh listen do you hear the toes?, they're talking to you, they're talking to me, they're talking to us, the foot knows all`,
		`Feet are a magical thing.They take you places, and joy they bring. Feet: more than a miracle. Each brilliant toe is sweet and spherical. Sweet feet, be mine forever. We shall spend every joyous day together. Rain, or shine, whatever the weather, you'll be mine forever and ever. I bend down deep and kiss my feet, and they kiss me back, oh what a treat, they taste so sweet. Feet oh feet, what a wonderful thing`,
		`Sweet feet, oh the smell. And the stories that they tell. We can learn so much from our small low-down friends. Like places they've been, and things they've stepped in. Dirt, grass, sleet, and snow are only a few places that some feet can go. Around the world, people rejoice with their feet, by stomping to the sound of the beat. And how many times a foot could be used? Can be gleaned by the stink they exude. Sour cheese, sometimes sweat, and even dog doody can be sniffed from these things of beauty. Indeed the sweet foot is a precious device, and walking with them makes our life so very nice.`,
		`There's some soot on my foot. What a funny little mask. But how did soot get on your foot, you may ask. Well the soot on my foot was once soot on the floor. And the soot on the floor was swept up as my chore. So the chore that I bore was to care for the soot on the floor. But my chore became a bore, so I left the soot on the floor. The soot became put underfoot. Underfoot where it lay until this very day that I finally say “NAY!” no more soot on my foot!`,
		`Hee hee hoo hoo, there's a tickle in my shoe. There's some chalk in my sock that is making me squawk! I took the chalk in my sock and hid it from Mr. Crock. Mr. Crock, the grumpy man, put the  chalk in the can. So I took the chalk before a talk with Mr. Crock. Mr. Crock was looking around, for the chalk he in the attic of the house, which belonged to a mouse. The mouse was mad, so very mad, and when he's mad, things go bad. So I took the chalk from Mr. Crock and found the house with the mouse. I gave the mouse his treasure back and prayed I didn't get a whack.`,
		`A pearl in the night, so soft, so supple, so white. The roundest of them all, the most perfect foot-ball. And down below, I  see a toe, nay I see a group. I count them all, I count to ten, and then, and then, and then. I breathe in deep before I sleep, for if I do not my brain will rot. I need the scent, oh so sweet, the scent of feet. Like a ripe Limburger, oh the fervor. Please oh please I need the cheese, the ripe, ripe cheese. I'm falling, I'm falling, to my knees, I have the need, the need for the feet, those gorgeous slabs of meat`,
		`A mile walked is a mile lived. Each step a new experience. Each cut, scrape and blister a challenge overcome. Time heals all wounds but the scars will last forever. The calluses grow harder each day, and the nails grow longer. We trim them back but they don't give up. They keep on growing. They keep on walking, until they reach the end of the path; the edge of the cliff. They take the leap`
	].map((i) => i.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim());
	let line = '';
	let guard = 0;
	do {
		line = shuffle(lines)[0];
	} while (line.startsWith(lastLine) && ++guard < 100);
	lastLine = line.substring(0, 10);
	return line;
}

export function getTickles() {
	const basics = `abcdefghijklmnopqrstuvwxyz1234567890`;
	const rows = [`1234567890-=`, `qwertyuiop`, `asdfghjkl;'`, `zxcvbnm,./`];
	const patterns = {
		alternate: () => shuffle(basics.split('')).slice(0, 2).join(''),
		roll: () => {
			const row = shuffle(rows)[0];
			const start = Math.floor(randRange(0, row.length));
			return row
				.repeat(2)
				.substring(start, start + Math.floor(randRange(3, row.length / 2)));
		},
		rotation: () => {
			const set = shuffle([
				'wdas',
				'efds',
				'rgfd',
				'thgf',
				'yjhg',
				'ukjh',
				'ilkj',
			])[0];
			if (Math.random() > 0.5) set.split('').reverse().join('');
			return set;
		},
	};

	const pattern = randItem(Object.keys(patterns)) as keyof typeof patterns;
	const value = patterns[pattern]();
	return value.repeat(Math.floor(randRange(4, 8)));
}
