import { plainToInstance } from "class-transformer";
import { RoomData } from "./RoomData";
import { Root } from "./configentities";

export class LevelConfig {
    RoomData: RoomData[];

    constructor(cacheManager: Phaser.Cache.CacheManager) {

        const xml = cacheManager.xml.get('levelconfig');
        const j = cacheManager.json.get('levelconfigJSON');

        let o = plainToInstance(Root, j);

        this.RoomData = this.readRoomData(xml);
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