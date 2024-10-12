export class RoomDatazz {
    x: number;
    y: number;
    width: number;
    height: number;
    name: string;

    constructor(x: number, y: number, width: number, height: number, name: string) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.name = name;
    }
}


export class CharacterStats {
    fullname: string;
}
export class ImageInfo {
    id: string;
    x: number;
    y: number;
}
export class CharacterData {
    id: string;

    stats: CharacterStats;


}