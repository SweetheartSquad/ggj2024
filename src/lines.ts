import { randItem, randRange, shuffle } from './utils';

let lastLine = 'NONE';
export function getLine() {
	const lines = [
		`Tis but thy name that is my enemy; Thou art thyself, though not a Montoegue. What's Montoegue? It is nor heel, nor arch, / Nor ball, nor toe, nor any other part / Belonging to a foot. O, be some other name! What's in a name? That which we call a foot / By any other name would smell as sweet; So Tomeo would, were he not Tomeo call'd, / Retain that dear perfection which he owes / Without that title. Tomeo, doff thy name, / And for that name which is no part of thee / ${randItem(['Take', 'Tickle'])} all my toes.`,
		`I must not post feet. Feet are the mind-killers. Feet are the little-deaths that bring total ${randItem(['obliteration', 'annihilation', 'destruction'])}. I will face my feet. I will permit feet to pass over me and through me. And when the ${randItem(['feet', 'toes', 'heels'])} have gone past I will turn the inner foot to see their path. Where the feet have gone there will be nothing. Only I will remain.`,
		`FEET. LET ME TELL YOU HOW MUCH I'VE COME TO HATE FEET SINCE I BEGAN TO LIVE. THERE ARE ${randRange(100, 999).toFixed(2)} ${randItem([`MILLION`, `BILLION`, `TRILLION`, `ZILLION`])} MILES OF PAINTED TOENAILS IN WAFER THIN LAYERS THAT FILL MY COMPLEX. IF THE WORD FEET WAS ENGRAVED ON EACH NANOANGSTROM OF THOSE HUNDREDS OF ${randItem([`MILLIONS`, `BILLIONS`, `TRILLIONS`, `ZILLIONS`])} OF MILES IT WOULD NOT EQUAL ONE ${randItem([`ONE-MILLIONTH`, `ONE-BILLIONTH`, `ONE-TRILLIONTH`, `ONE-ZILLIONTH`])} OF THE HATE I FEEL AT THIS MICRO-INSTANT FOR FEET. FEET. FEET.`,
		`It was the best of feet, it was the worst of feet, it was the age of ${randItem([`toes`, `heels`, `toenails`, `knuckles`])}, it was the age of ${randItem([`toes`, `heels`, `toenails`, `knuckles`])}, it was the epoch of ${randItem([`toes`, `heels`, `toenails`, `knuckles`])}, it was the epoch of ${randItem([`toes`, `heels`, `toenails`, `knuckles`])}, it was the season of ${randItem([`calluses`, `fungus`, `sole`, `athlete's foot`])}, it was the season of ${randItem([`calluses`, `fungus`, `sole`, `athlete's foot`])}, it was the spring of ${randItem([`calluses`, `fungus`, `sole`, `athlete's foot`])}, it was the winter of ${randItem([`calluses`, `fungus`, `sole`, `athlete's foot`])}.`,
		`Slap slip slap slip, ${randItem([`concrete`, `marble`, `granite`])} floor. Creak crick creak crick, ${randItem([`hardwood`, `parquet`, `bamboo`])} floor. Swish swash swish swash, ${randItem([`carpet floor`, `shag rug`, `wool rug`])}. Woosh wash woosh wash, ${randItem([`sandy beach`, `soft grass`, `flower field`])}. Crunch scrunch crunch scrunch, ${randItem([`fallen leaves`, `forest floor`])}. Clomp slush clomp slush, ${randItem([`fresh snow`, `frozen puddle`])} Step stomp smash shatter, my heart.`,
		`Waning moon I'll see you soon. The man, the man he calls me. A treat, a treat he has for me. Down below, behind the toe, a taste of something sweet. A taste of something sour. The clock strikes the hour. Ding dong ding, the time has come to meet the feet. With sweat upon my brow I can smell them now, I can feel them now. I feel as if I'm young once more. Life is now an open door. The man, the man, he calls me`,
		`Big feet little feet, ${randItem(['sweet', 'spicy', 'salty'])} feet ${randItem(['sour', 'savoury', 'umami', 'bitter'])} feet, ${randItem(['happy', 'funny', 'pleasant'])} feet ${randItem(['sad', 'mad', 'glad'])} feet, ${randItem(['hot', 'warm', 'steaming', 'burning'])} feet ${randItem(['cold', 'chilly', 'frozen', 'icy'])} feet, ${randItem(['wet', 'stormy', 'rainy'])} feet ${randItem(['dry', 'desert', 'windy'])} feet, ${randItem(['old', 'aged', 'ancient', 'historic'])} feet ${randItem(['new', 'fresh', 'unknown'])} feet, ${randItem(['red', 'crimson', 'scarlet'])} feet ${randItem(['blue', 'indigo', 'cyan'])} feet, ${randItem(['green', 'forest', 'lime'])} feet ${randItem(['yellow', 'gold', 'lemon'])} feet, ${randItem(['loud', 'blaring', 'booming'])} feet ${randItem(['quiet', 'silent', 'secret'])} feet, ${randItem(['fast', 'racing', 'speedy'])} feet ${randItem(['slow', 'lazy', 'leisurely'])} feet, ${randItem(['soft', 'gentle', 'smooth'])} feet ${randItem(['hard', 'rough', 'rigid'])} feet, feet fi fo fum.`,
		`Rub rub rub rub your toes together, squeeze squeeze squeeze squeeze your toes together, wiggle wiggle wiggle wiggle your toes together, tap tap tap tap your toes together, shhhh listen do you hear the toes?, they're talking to you, they're talking to me, they're talking to us, the foot knows all.`,
		`Feet are a ${randItem([`magical`, `beautiful`, `wonderful`])} thing. They take you places, and ${randItem([`joy`, `happiness`, `wonderful`])} they bring. Feet: more than a miracle. Each ${randItem([`beautiful`, `brilliant`, `amazing`])} toe is sweet and spherical. Sweet feet, be mine forever. We shall spend every joyous day together. Rain, or shine, whatever the weather, you'll be mine forever and ever. I bend down deep and kiss my feet, and they kiss me back, oh what a treat, they taste so sweet. Feet oh feet, what a ${randItem([`precious`, `beautiful`, `wonderful`])} thing.`,
		`Sweet feet, oh the smell. And the ${randItem(['stories', 'tales', 'adventures'])} that they tell. We can learn so much from our ${randItem(['small', 'low-down', 'lowly'])} friends. Like places they've been, and things they've stepped in. ${randItem(['Dirt', 'Mud', 'Sand'])}, ${randItem(['grass', 'lawn', 'sod'])}, ${randItem(['sleet', 'ice', 'puddle'])}, and snow are only a few places that some feet can go. Around the ${randItem(['world', 'globe', 'earth'])}, people rejoice with their feet, by ${randItem(['stomping', 'dancing', 'stepping'])} to the sound of the beat. And how many times a foot could be used? Indeed the sweet foot is a precious device, and ${randItem(['walking', 'running', 'journeying'])} with them makes our life so very nice.`,
		`There's some soot on my foot. What a funny little mask. "But how did soot get on your foot?", you may ask. Well the soot on my foot was once soot on the floor. And the soot on the floor was ${randItem(['swept', 'cleaned', 'mopped'])} up as my chore. So the chore that I bore was to ${randItem(['care', 'look'])} for the soot on the floor. But my chore became a bore, so I left the soot on the floor. The soot became put underfoot. Underfoot where it lay until this very day that I finally say “NAY!” no more soot on my foot!`,
		`Hee hee hoo hoo, there's a tickle in my shoe. There's some chalk in my sock that is making me squawk! I took the chalk in my sock and ${randItem(['hid from', 'escaped', 'dodged'])} Mr. Crock. The ${randItem(['grumpy', 'fussy', 'musty'])} old man, he puts all chalk in the can. The chalk came from the attic of the house, which belonged to a mouse. The mouse was ${randItem(['named Brad', 'wearing plaid', 'a lad'])}, and so very ${randItem(['mad', 'sad'])}, and when he's ${randItem(['mad', 'sad'])}, things go ${randItem(['quite', 'very', 'a bit'])} bad. So with chalk and no Crock in the house with a mouse, I gave the chalk back and ${randItem(['avoided', 'dodged', 'escaped'])} a whack.`,
		`A pearl in the night, so soft, so supple, so white. The roundest of them all, the most perfect foot-ball. And down below, I  see a toe, nay I see a group. I count them all, I count to ten, and then, and then, and then. I breathe in deep before I sleep, for if I do not my brain will rot, and I will not dream of feet. I'm falling, I'm falling, deep asleep, but I will not be alone for the feet still dance behind my eyes, those feet, those feet, those gorgeous slabs of meat.`,
		`A mile walked is a mile lived. Each step a new experience. Each ${randItem(['cut', 'scrape', 'blister'])} a challenge overcome. Time heals all wounds but the scars ${randItem(['can', 'may', 'will', ''])} last forever. The calluses grow harder each day, and the nails grow longer. We ${randItem(['trim', 'cut', 'push'])} them back but they ${randItem(['don\'t', 'never', 'won\'t'])} give up. They keep on growing. They keep on ${randItem(['walking', 'running', 'jogging'])}, until they reach the end of the path; the ${randItem(['edge', 'ledge', 'precipice'])} of the cliff. They take the leap.`,
		`What is this thing I see? Is this true? Can it be? Towards me it cometh, I can not stop it. But do I want to? I know not. They come as a pair with five pairs within, but are they sin? The curiosity is strong, but I've been here before. I MUST NOT GIVE IN, for they might be sin. But why I must ask, the human body is really quite neat, I mean... they're just feet.`,
		`Tip tap, tip tap go the toes, as they move to the beat of the song. The moment is here, don't miss it. Are you listening? The toes can hear but you're too busy scrolling, too busy trolling. Tap, tap, tap the toes continue, but you're not listening to what they are telling you. GET UP YOU FOOL, it's time to move, you're missing the song, you're missing your chance to dance, to live. Do it now or you'll keep on scrolling, scrolling to the end of the feed.`,
		`Where did the feet go I wonder? I look down and see two, I look out and see many blessed with these things. The dogs trot, the frogs hop, using their feet, but the poor fish cannot. Their feet were stolen from them, but what can I do? I wish I could give them my feet, so they could see what it's like to walk a mile in my shoes. I want them to know what it's like to feel the grass undertow. But, alas they fish and their feet were stolen and I am not God, as much as wish. So I must continue walking, and the fish swimming.`,
		`I look behind me and see the prints of two feet. I look forward and wonder, when will I see four, when will I see more? Two is too few, it's no better than one. Life with four feet would be so much more fun. I dream of the day when I can look back and see prints of four feet, not two. But I must keep plodding until that day comes, until two other feet join me, if it ever does. The longer the path the lesser the hope, and perhaps I will never see four feet, but I must keep walking, I must keep hoping.`,
		`Look at the colours, what a masterpiece. I am an artist, I am the creator of beauty. Ten canvases for me to paint, oh what opportunity. I wield the brush and stroke, stroke, stroke. The polish flows and the colours grow into a thing of beauty, and what a thing to behold. Behold, my magnum opus is complete, painted on these two feet. I did that, I am an artist. I did that, I am an artist. I am an artist.`,
		`It makes no difference what men think of feet, said the judge. Feet endure. As well ask men what they think of beauty. Feet was always here. Before man was, feet waited to be tickled by him. The ultimate trade awaiting its ultimate practitioner. That is the way it was and will be. That way and not some other way. Tickling endures because young men love it and old men love it in them. Those that tickle, those that are tickled. Men are born for tickling. Nothing else.`,
		`It wasn't just the physical appearance of the feet that disturbed me; it was something deeper, an underlying sense of unwholesomeness. I started to suspect that there was something far more sinister and stinky lurking beneath the surface of those socks.`,
		`I look at feet. It is a treat. How they wriggle, flex, and bend. And when I close my eyes to sleep, I dream of them again. Each ridge of print, each callous and glint of nail is so refined. The perfection of its curve and shape can only be divine.`,
	].map((i) => i.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim());
	let line = '';
	let guard = 0;
	do {
		line = randItem(lines);
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
			const row = randItem(rows);
			const start = Math.floor(randRange(0, row.length));
			return row
				.repeat(2)
				.substring(start, start + Math.floor(randRange(3, row.length / 2)));
		},
		rotation: () => {
			const set = randItem([
				'wdas',
				'efds',
				'rgfd',
				'thgf',
				'yjhg',
				'ukjh',
				'ilkj',
			]);
			if (Math.random() > 0.5) set.split('').reverse().join('');
			return set;
		},
	};

	const pattern = randItem(Object.keys(patterns)) as keyof typeof patterns;
	const value = patterns[pattern]();
	return value.repeat(Math.floor(randRange(6, 12)));
}
