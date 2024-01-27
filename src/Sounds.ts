import { getHowl, sfx } from "./Audio";
import { randRange } from "./utils";

export enum Sounds {
    Type = 9,
    Good = 13,
    Bad = 14,
}

export function randomSound(sound: Sounds): void {
    sfx(`${soundNameAtIndex(sound, randRange(1, sound))}`);
}

export function cancelSound(sound: Sounds): void {
    for (let i = 0; i < sound; i++) {
        getHowl(soundNameAtIndex(sound, i))?.stop();
    }
}

function soundNameAtIndex(sound: Sounds, index: number): string {
    return `${Sounds[sound].toLowerCase()}${Math.round(index)}`;
}
