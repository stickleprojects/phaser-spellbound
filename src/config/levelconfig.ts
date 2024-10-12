import { plainToInstance } from "class-transformer";
//import { RoomData } from "./RoomData";
import { Root, Character, Room, Door, Item, Rectangle } from "./configentities";

export class Rectangle {
    x: number
    y: number
    width: number
    height: number

    constructor(x: number, y: number, w: number, h: number) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;

    }
}
class RoomWithWorldLocation extends Room {
    WorldLocation: Rectangle

    constructor(src: Room, worldLocation: Rectangle) {
        super()
        this.x = src.x;
        this.y = src.y;
        this.name = src.name;
        this.stats = src.stats;
        this.WorldLocation = worldLocation;
    }
}

export class LevelConfig {
    //RoomData: RoomData[];

    Rooms: RoomWithWorldLocation[];
    Characters: Character[];
    Doors: Door[];
    Items: Item[];
    constructor(cacheManager: Phaser.Cache.CacheManager, roomWidthInTiles: number, tileWidth: number, roomHeightInTiles: number, tileHeight: number) {

        const xml = cacheManager.xml.get('levelconfig');
        const j = cacheManager.json.get('levelconfigJSON');

        let o = plainToInstance(Root, j);

        this.Rooms = this.updateRoomWorldLocations(o.rooms, roomWidthInTiles, tileWidth, roomHeightInTiles, tileHeight);
        this.Characters = o.characters;
        this.Doors = o.doors;
        this.Items = o.items;


        //  this.RoomData = this.readRoomData(xml);
    }

    updateRoomWorldLocations(rooms: Room[], roomWidthInTiles: number, tileWidth: number, roomHeightInTiles: number, tileHeight: number): RoomWithWorldLocation[] {
        const roomWidth = roomWidthInTiles * tileWidth;
        const roomHeight = roomHeightInTiles * tileHeight;


        return rooms.map(r => {

            return new RoomWithWorldLocation(r, new Rectangle(
                r.x * roomWidth,
                r.y * roomHeight,
                roomWidth,
                roomHeight
            ));

        });
    }
    getRoomBoundaries(): { x: number, y: number } {

        return {
            x: Math.max(...this.Rooms.map(r => r.x)),
            y: Math.max(...this.Rooms.map(r => r.y)),

        }
    }
    private readCharacterData(xml) {

    }

    private readRoomData(xml) {

        const roomsAndNames = xml.getElementsByTagName("room");

        var ret: RoomData[] = [];

        Array.from(roomsAndNames).forEach(element => {
            const x = element.getAttribute('x');
            const y = element.getAttribute('y');
            const name = element.getAttribute('name');
            ret.push(new RoomData(x, y, 0, 0, name));
        });
        return ret;
    }
}