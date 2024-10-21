// https://github.com/typestack/class-transformer?tab=readme-ov-file#installation

import { Type } from 'class-transformer'
import 'reflect-metadata';


export class Stats {
    fullname: string
}

export class Image {
    id: string
    x: number
    y: number
}

export class CharacterStats extends Stats {
    maxnumberofitems: number
    maxweightperitem: number
    maxenergy: number
    energy: number
}
export class RoomStats extends Stats {
    dark: boolean
    poisonous: boolean
}
export class ItemStats extends Stats {
    weight: number
}

export class Character {

    @Type(() => CharacterStats)
    stats?: CharacterStats

    @Type(() => Image)
    images: Image[]

    id: string
}


export class Room {
    x: number
    y: number
    name: string


    @Type(() => RoomStats)
    stats: RoomStats


}


export class Door {
    @Type(() => Image)
    images: Image[]
    id: string
    type?: string
}


export class Root {

    @Type(() => Character)
    characters: Character[]

    @Type(() => Item)
    items: Item[]

    @Type(() => Room)
    rooms: Room[]

    @Type(() => Door)
    doors: Door[]
}

export class Item {
    @Type(() => ItemStats)
    stats?: ItemStats

    @Type(() => Image)
    images: Image[]

    id: string
}

