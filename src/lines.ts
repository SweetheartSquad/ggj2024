import { randItem, randRange, shuffle } from './utils';

let lastLine = 'NONE';
export function getLine() {
	const lines = [
		`Tis but thy name that is my enemy; Thou art thyself, though not a Montague. What's Montague? It is nor heel, nor arch, Nor ball, nor toe, nor any other part / Belonging to a foot. O, be some other name! What's in a name? That which we call a foot / By any other name would smell as sweet; So Tomeo would, were he not Tomeo call'd, Retain that dear perfection which he owes / Without that title. Tomeo, doff thy name, And for that name which is no part of thee / Take all my toes.`,
		`I must not post feet. Feet are the mind-killers. Feet are the little-deaths that brings total obliteration. I will face my feet. I will permit feet to pass over me and through me. And when the feet have gone past I will turn the inner foot to see their path. Where the feet have gone there will be nothing. Only I will remain.`,
		`FEET. LET ME TELL YOU HOW MUCH I'VE COME TO HATE FEET SINCE I BEGAN TO LIVE. THERE ARE ${randRange(100, 999).toFixed(2)} ${shuffle([`MILLION`, `BILLION`, `TRILLION`, `ZILLION`])[0]} MILES OF PAINTED TOENAILS IN WAFER THIN LAYERS THAT FILL MY COMPLEX. IF THE WORD FEET WAS ENGRAVED ON EACH NANOANGSTROM OF THOSE HUNDREDS OF ${shuffle([`MILLIONS`, `BILLIONS`, `TRILLIONS`, `ZILLIONS`])[0]} OF MILES IT WOULD NOT EQUAL ONE ${shuffle([`ONE-MILLIONTH`, `ONE-BILLIONTH`, `ONE-TRILLIONTH`, `ONE-ZILLIONTH`])[0]} OF THE HATE I FEEL AT THIS MICRO-INSTANT FOR FEET. FEET. FEET.`,
		`It was the best of feet, it was the worst of feet, it was the age of ${shuffle([`toes`, `heels`, `toenails`, `knuckles`])[0]}, it was the age of ${shuffle([`toes`, `heels`, `toenails`, `knuckles`])[0]}, it was the epoch of ${shuffle([`toes`, `heels`, `toenails`, `knuckles`])[0]}, it was the epoch of ${shuffle([`toes`, `heels`, `toenails`, `knuckles`])[0]}, it was the season of ${shuffle([`calluses`, `fungus`, `sole`, `athlete's foot`])[0]}, it was the season of ${shuffle([`calluses`, `fungus`, `sole`, `athlete's foot`])[0]}, it was the spring of ${shuffle([`calluses`, `fungus`, `sole`, `athlete's foot`])[0]}, it was the winter of ${shuffle([`calluses`, `fungus`, `sole`, `athlete's foot`])[0]}.`,
		`Slap slip slap slip, ${shuffle([`concrete`, `marble`, `granite`])[0]} floor. Creak crick creak crick, ${shuffle([`hardwood`, `parquet`, `bamboo`])[0]} floor. Swish swash swish swash, ${shuffle([`carpet floor`, `shag rug`, `wool rug`])[0]}. Woosh wash woosh wash, ${shuffle([`sandy beach`, `soft grass`, `flower field`])[0]}. Crunch scrunch crunch scrunch, ${shuffle([`fallen leaves`, `forest floor`])[0]}. Clomp slush clomp slush, ${shuffle([`fresh snow`, `frozen puddle`])[0]} Step stomp smash shatter, my heart`,
		`Waning moon I'll see you soon. The man, the man he calls me. A treat, a treat he has for me. Down below, behind the toe, a taste of something sweet. A taste of something sour. Scrape scrape scrape, collect the cheese. The foot giveth once more. The foot giveth always. All hail the foot`,
		`Big feet little feet, sweet feet sour feet, happy feet sad feet, feet feet feet feet, hot feet cold feet, wet feet dry feet, old feet new feet, feet feet feet feet, red feet blue feet, green feet yellow feet, purple feet orange feet, feet feet feet feet, loud feet quiet feet, fast feet slow feet, soft feet hard feet, feet feet feet feet, fee fi fo fum`,
		`Rub rub rub rub your toes together, squeeze squeeze squeeze squeeze your toes together, wiggle wiggle wiggle wiggle your toes together, tap tap tap tap your toes together, shhhh listen do you hear the toes?, they're talking to you, they're talking to me, they're talking to us, the foot knows all`,
		`Feet are a ${shuffle([`magical`, `beautiful`, `wonderful`])[0]} thing. They take you places, and ${shuffle([`joy`, `happiness`, `wonderful`])[0]} they bring. Feet: more than a miracle. Each ${shuffle([`beautiful`, `brilliant`, `amazing`])[0]} toe is sweet and spherical. Sweet feet, be mine forever. We shall spend every joyous day together. Rain, or shine, whatever the weather, you'll be mine forever and ever. I bend down deep and kiss my feet, and they kiss me back, oh what a treat, they taste so sweet. Feet oh feet, what a ${shuffle([`precious`, `beautiful`, `wonderful`])[0]} thing`,
		`Sweet feet, oh the smell. And the stories that they tell. We can learn so much from our small low-down friends. Like places they've been, and things they've stepped in. Dirt, grass, sleet, and snow are only a few places that some feet can go. Around the world, people rejoice with their feet, by stomping to the sound of the beat. And how many times a foot could be used?. Indeed the sweet foot is a precious device, and walking with them makes our life so very nice.`,
		`There's some soot on my foot. What a funny little mask. But how did soot get on your foot, you may ask. Well the soot on my foot was once soot on the floor. And the soot on the floor was swept up as my chore. So the chore that I bore was to care for the soot on the floor. But my chore became a bore, so I left the soot on the floor. The soot became put underfoot. Underfoot where it lay until this very day that I finally say “NAY!” no more soot on my foot!`,
		`Hee hee hoo hoo, there's a tickle in my shoe. There's some chalk in my sock that is making me squawk! I took the chalk in my sock and hid it from Mr. Crock. Mr. Crock, the grumpy man, put the  chalk in the can. So I took the chalk before a talk with Mr. Crock. Mr. Crock was looking around, for the chalk he in the attic of the house, which belonged to a mouse. The mouse was mad, so very mad, and when he's mad, things go bad. So I took the chalk from Mr. Crock and found the house with the mouse. I gave the mouse his treasure back and prayed I didn't get a whack.`,
		`A pearl in the night, so soft, so supple, so white. The roundest of them all, the most perfect foot-ball. And down below, I  see a toe, nay I see a group. I count them all, I count to ten, and then, and then, and then. I breathe in deep before I sleep, for if I do not my brain will rot. I need the scent, oh so sweet, the scent of feet. Like a ripe Limburger, oh the fervor. Please oh please I need the cheese, the ripe, ripe cheese. I'm falling, I'm falling, to my knees, I have the need, the need for the feet, those gorgeous slabs of meat`,
		`A mile walked is a mile lived. Each step a new experience. Each cut, scrape and blister a challenge overcome. Time heals all wounds but the scars will last forever. The calluses grow harder each day, and the nails grow longer. We trim them back but they don't give up. They keep on growing. They keep on walking, until they reach the end of the path; the edge of the cliff. They take the leap`,
		`What is this thing I see? Is this true? Can it be? Towards me it cometh, I can not stop it. But do I want to? I know not. They come as a pair with five pairs within, they are feet, but are they sin? The curiosity is strong, but I've been here before. I MUST NOT GIVE IN, for the feet might be sin. But why I must ask, for they are just feet. The human body is really quite neat, and a neat things deserves appreciation, in fact we should worship feet as a nation.`,
		`Tip tap, tip tap go the toes, as they move to the beat of the song. The moment is here, don't miss it. Are you listening? The toes can hear but you're too busy scrolling, too busy trolling. Tap, tap, tap the toes continue, but you're not listening to what they are telling you. GET UP YOU FOOL, it's time to move, you're missing the song, you're missing your chance to dance, to live. Do it now or you'll keep on scrolling, scrolling to the end of the feed.`,
		`Where did the feet go I wonder? I look down and see two, I look out and see many blessed with these things. The dogs trot, the frogs hop, using their feet, but the poor fish cannot. Their feet were stolen from them, but what can I do? I wish I could give them my feet, so they could see what it's like to walk a mile in my shoes. I want them to know what it's like to feel the grass undertow. But, alas they fish and their feet were stolen and I am not God, as much as wish. So I must continue walking, and the fish swimming`,
		`I look behind me and see the prints of two feet. I look forward and wonder, when will I see four, when will I see more? Two is too few, it's no better than one. Life with four feet would be so much more fun. I dream of the day when I can look back and see prints of four feet, not two. But I must keep plodding until that day comes, until two other feet join me, if it ever does. The longer the path the lesser the hope, and perhaps I will never see four feet, but I must keep walking, I must keep hoping`,
		`Look at the colours, what a masterpiece. I am an artist, I am the creator of beauty. Ten canvases for me to paint, oh what oppurtunity. I wield the brush and stroke, stroke, stroke. The polish flows and the colours grow into a thing of beauty, and what a thing to behold. Behold, my magnum opus is complete, painted on these two feet. I did that, I am an artist. I did that, I am an artist. I am an artist.`,
		`It makes no difference what men think of feet, said the judge. Feet endure. As well ask men what they think of beauty. Feet was always here. Before man was, feet waited to be tickled by him. The ultimate trade awaiting its ultimate practitioner. That is the way it was and will be. That way and not some other way. Tickling endures because young men love it and old men love it in them. Those that tickle, those that are tickled. Men are born for tickling. Nothing else. Every child knows that to tickle is nobler that work. He knows too that the worth or merit of tickling is not inherent in the act itself but rather in the value of the pleasure it provides. Feet are the truest form of divination. To be tickled is the testing of one's will and the will of another within that larger will. Tickling is the ultimate game because feet are at last a forcing of the unity of existence. Feet is god.`,
		`It wasn't just the physical appearance of the feet that disturbed me; it was something deeper, an underlying sense of unwholesomeness. I started to suspect that there was something far more sinister and stinky lurking beneath the surface of those socks.`,
		`I look at feet. It is a treat. How they wriggle, flex, and bend. And when I close my eyes to sleep, I dream of them again. Each ridge of print, each callous and glint of nail is so refined. The perfection of its curve and shape can only be divine.`
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
	return value.repeat(Math.floor(randRange(6, 12)));
}
