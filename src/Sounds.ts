import { getHowl, sfx } from "./Audio";
import { randRange } from "./utils";

export enum Sounds {
    Type = 9,
    Good = 13,
    Bad = 14,
}

export function randomSound(sound: Sounds): void {
    switch (sound) {
        case Sounds.Good:
            for (let i = 0; i < Sounds.Bad; i++) {
                getHowl(soundNameAtIndex(sound, i))?.stop();
            }
            break;
        case Sounds.Bad:
            for (let i = 0; i < Sounds.Good; i++) {
                getHowl(soundNameAtIndex(sound, i))?.stop();
            }
            break;
    }

    sfx(`${soundNameAtIndex(sound, randRange(1, sound))}`);
}

function soundNameAtIndex(sound: Sounds, index: number): string {
    return `${Sounds[sound].toLowerCase()}${Math.round(index)}`;
}
