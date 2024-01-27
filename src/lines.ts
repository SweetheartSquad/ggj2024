import { shuffle } from "./utils";

let lastLine = 'NONE';
export function getLine() {
	const lines = [
		`Tis but thy name that is my enemy; Thou art thyself, though not a Montague. What's Montague? It is nor heel, nor arch, Nor ball, nor toe, nor any other part / Belonging to a foot. O, be some other name! What's in a name? That which we call a foot / By any other name would smell as sweet; So Tomeo would, were he not Tomeo call'd, Retain that dear perfection which he owes / Without that title. Tomeo, doff thy name, And for that name which is no part of thee / Take all my toes.`,
		`I must not post feet. Feet are the mind-killers. Feet are the little-deaths that brings total obliteration. I will face my feet. I will permit feet to pass over me and through me. And when the feet have gone past I will turn the inner foot to see their path. Where the feet have gone there will be nothing. Only I will remain.`,
		`FEET. LET ME TELL YOU HOW MUCH I'VE COME TO HATE FEET SINCE I BEGAN TO LIVE. THERE ARE ${shuffle([`387.44`, `420.69`, `614.97`, `882.53`])[0]} ${shuffle([`MILLION`, `BILLION`, `TRILLION`, `ZILLION`])[0]} MILES OF PAINTED TOENAILS IN WAFER THIN LAYERS THAT FILL MY COMPLEX. IF THE WORD FEET WAS ENGRAVED ON EACH NANOANGSTROM OF THOSE HUNDREDS OF ${shuffle([`MILLIONS`, `BILLIONS`, `TRILLIONS`, `ZILLIONS`])[0]} OF MILES IT WOULD NOT EQUAL ONE ${shuffle([`ONE-MILLIONTH`, `ONE-BILLIONTH`, `ONE-TRILLIONTH`, `ONE-ZILLIONTH`])[0]} OF THE HATE I FEEL AT THIS MICRO-INSTANT FOR FEET. FEET. FEET.`,
		`It was the best of feet, it was the worst of feet, it was the age of ${shuffle([`toes`, `heels`, `toenails`, `knuckles`])[0]}, it was the age of ${shuffle([`toes`, `heels`, `toenails`, `knuckles`])[0]}, it was the epoch of ${shuffle([`toes`, `heels`, `toenails`, `knuckles`])[0]}, it was the epoch of ${shuffle([`toes`, `heels`, `toenails`, `knuckles`])[0]}, it was the season of ${shuffle([`calluses`, `fungus`, `sole`, `athelete's foot`])[0]}, it was the season of ${shuffle([`calluses`, `fungus`, `sole`, `athelete's foot`])[0]}, it was the spring of ${shuffle([`calluses`, `fungus`, `sole`, `athelete's foot`])[0]}, it was the winter of ${shuffle([`calluses`, `fungus`, `sole`, `athelete's foot`])[0]}.`,
		`slap slip slap slip concrete floor creak crick creak crick wooden floor swish swash swish swash carpet floor woosh wash woosh wash sandy beach crunch scrunch crunch scrunch fallen leaves clomp slush clomp slush fresh snow step stomp smash shatter my heart`,
		`waning moon I'll see you soon the man, the man he calls me a treat, a treat he has for me down below, behind the toe a taste of something sweet a taste of something sour scrape scrape scrape collect the cheese the foot giveth once more the foot giveth always all hail the foot`,
		`big feet, little feet sweet feet, sour feet happy feet, sad feet feet feet, feet feet hot feet, cold feet wet feet, dry feet old feet, new feet feet feet, feet feet red feet, blue feet green feet, yellow feet purple feet, orange feet feet feet, feet feet loud feet, quiet feet fast feet, slow feet soft feet, hard feet feet feet, feet feet fee fi fo fum`,
		`rub rub rub rub your toes together squeeze squeeze squeeze squeeze your toes together wiggle wiggle wiggle wiggle your toes together tap tap tap tap your toes together shhhh listen do you hear the toes? they're talking to you they're talking to me they're talking to us the foot knows all`
	].map((i) => i.replace(/'/g, "'"));
	let line = '';
	do{
		line = shuffle(lines)[0];
	} while (!line.startsWith(lastLine));
	lastLine = line.substring(0, 10);
	return line;
}
