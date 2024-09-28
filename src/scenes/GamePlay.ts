import Phaser, { Scene, Tilemaps } from 'phaser';

import { addComponent, addEntity, createWorld, IWorld, System } from "bitecs";
import createCharacterMap from '../maps/characters';
import createObjectMap from '../maps/objects';
import { Hud, HudParameters } from './Hud';
import { RoomNavigator } from '../roomnavigator';

class RoomData {
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

export class GamePlayWindowConfig {
    parent: Scene;
    x: number;
    y: number;
    width: number;
    height: number;

    constructor(parent: Scene, x: number, y: number, width: number, height: number) {
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
    }
}
export class GamePlay extends Phaser.Scene {



    private camera: Phaser.Cameras.Scene2D.Camera;
    private world: IWorld;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
    private map: Phaser.Tilemaps.Tilemap;


    private map_alltiles: Phaser.Tilemaps.Tileset;
    private map_foregroundtiles: Phaser.Tilemaps.Tileset;
    private backgroundLayer: Phaser.Tilemaps.TilemapLayer;
    private foregroundLayer: Phaser.Tilemaps.TilemapLayer;
    private solidLayer: Phaser.Tilemaps.TilemapLayer;
    private characterSprites: Phaser.GameObjects.GameObject[];
    private objectSprites: Phaser.GameObjects.GameObject[];
    private characterLayer: Phaser.Types.Tilemaps.TiledObject[];
    private doorLayer: Phaser.Types.Tilemaps.TiledObject[];
    private objectLayer: Phaser.Types.Tilemaps.TiledObject[];
    private rooms: RoomData[];
    private roomWidthInTiles: number = 16;
    private roomHeightInTiles: number = 10;
    private characterMap: Map<String, { x: integer; y: integer; }>;
    private objectMap: Map<String, { x: integer; y: integer; }>;
    private cameraController: any;
    private hud: any;
    private horizontalRooms: number;
    private verticalRooms: number;
    private inputTimer: Phaser.Time.TimerEvent;
    private parentScene: Scene;
    RoomNavigator: RoomNavigator;

    constructor() {
        super('GamePlay')
    }


    getRoomConfig() {
        const xml = this.cache.xml.get('levelconfig');
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
    splitTileMapIntoRooms(map: Tilemaps.Tilemap) {

        const roomConfig = this.getRoomConfig();


        // map.width is in tiles, map.height is in tiles
        this.horizontalRooms = Phaser.Math.RoundTo(map.width / this.roomWidthInTiles, 0);
        this.verticalRooms = Phaser.Math.RoundTo(map.height / this.roomHeightInTiles, 0);


        var rooms = [];

        for (var y = 0; y < this.verticalRooms; y++)
            for (var x = 0; x < this.horizontalRooms; x++) {
                // copy the data

                const i = x * this.roomWidthInTiles
                const j = y * this.roomHeightInTiles


                var foundRoom = roomConfig.find(r => (r.x == x && r.y == y))

                const name = foundRoom?.name;

                const roomData = {
                    x: i * map.tileWidth,
                    y: j * map.tileHeight,
                    width: this.roomWidthInTiles * map.tileWidth,
                    height: this.roomHeightInTiles * map.tileHeight,
                    name: name
                }

                rooms.push(roomData)
            }

        return rooms;
    }

    preload() {

    }
    onRoomChanged() {

        this.positionCameraAccordingToRoom();

    }
    create() {
        this.camera = this.cameras.main

        this.cursors = this.input.keyboard?.createCursorKeys()


        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);
        this.camera.setZoom(3.5);

        this.map = this.make.tilemap({ key: 'levels', tileWidth: 16, tileHeight: 16 });
        this.rooms = this.splitTileMapIntoRooms(this.map);

        this.RoomNavigator = new RoomNavigator(this.input,
            this.horizontalRooms, this.verticalRooms,
            () => this.positionCameraAccordingToRoom());


        this.map_alltiles = this.map.addTilesetImage('alltiles', 'map_background')!
        this.map_foregroundtiles = this.map.addTilesetImage('foregroundtiles', 'map_foreground')!

        this.backgroundLayer = this.map.createLayer('background', this.map_alltiles)!
        this.foregroundLayer = this.map.createLayer('foreground', this.map_foregroundtiles)!
        this.solidLayer = this.map.createLayer('solid', this.map_alltiles)!
        this.characterLayer = this.map.getObjectLayer('characters')?.objects!
        this.doorLayer = this.map.getObjectLayer('doorobjects')?.objects!
        this.objectLayer = this.map.getObjectLayer('objects')?.objects!


        this.characterMap = createCharacterMap();

        this.objectMap = createObjectMap();



        const objectTileHeight = 16;
        const objectTileWidth = 16;
        const objectTilemapWidth = 16;

        const objecthalfW = objectTileWidth / 2;
        const objecthalfH = objectTileHeight / 2;

        // create the objets
        this.objectLayer.forEach(o => {
            const objectName = o.name;
            const objectTilePosition = this.objectMap.get(objectName);

            const mapWidth = objectTilemapWidth;
            if (!objectTilePosition) {
                console.log("Failed to find object " + objectName)
            } else {

                const index = (objectTilePosition.y * mapWidth) + objectTilePosition.x;
                const pixelX = Math.ceil(o.x! / 16) * 16;
                const pixelY = Math.ceil(o.y! / 16) * 16;

                const addedSprite = this.add.sprite(pixelX, pixelY + objecthalfH, 'objects', index);


            }
        })

        const characterTileHeight = 32;
        const charaterTileWidth = 16;
        const characterTilemapWidth = 16;

        const characterhalfH = characterTileHeight / 2;
        const characterhalfW = charaterTileWidth / 2;

        this.characterLayer.forEach(o => {
            const characterName = o.name + "_right";
            const characterTileCoords = this.characterMap.get(characterName);
            const mapWidth = characterTilemapWidth;

            if (!characterTileCoords) {
                console.log("Cannot find character texture for " + characterName);
            } else {
                const index = (characterTileCoords.y * mapWidth) + characterTileCoords.x;

                const pixelX = Math.ceil(o.x! / 16) * 16;
                const pixelY = Math.ceil(o.y! / 16) * 16;

                // in theory we create the player here

                const addedSprite = this.add.sprite(pixelX + characterhalfW, pixelY + characterhalfH, 'characters', index);

                if (o.name == "knight") {
                    // create the knight and add to the world
                    this.createKnight(addedSprite);
                } else {

                }
            }
        })

        const w = this.roomWidthInTiles * this.map.tileWidth * this.cameras.main.zoomX;
        const h = this.roomHeightInTiles * this.map.tileHeight * this.cameras.main.zoomY;
        this.cameras.main.setSize(w, h);

        // set the start room
        this.roomX = 5;
        this.roomY = 2;


        this.positionCameraAccordingToRoom();

    }
    createKnight(addedSprite: Phaser.GameObjects.Sprite) {



    }
    positionCameraAccordingToRoom() {

        const roomCoords = this.RoomNavigator.GetRoomCoords();

        let roomX = Phaser.Math.Clamp(roomCoords.x, 0, this.horizontalRooms - 1);
        let roomY = Phaser.Math.Clamp(roomCoords.y, 0, this.verticalRooms - 1);
        const roomIndex = roomX + (roomY * this.horizontalRooms);
        const roomData = this.rooms[roomIndex];

        if (!roomData) {
            console.log("Failed to find room!");
        } else {

            this.events.emit("screenmov", { x: roomX, y: roomY, name: roomData.name });
            this.camera.setBounds(roomData.x, roomData.y, roomData.width, roomData.height, false);
        }
    }
    init(data: GamePlayWindowConfig) {

        this.parentScene = data.parent;

        this.cameras.main.setViewport(data.x, data.y, data.width, data.height);

        this.world = createWorld()


    }

    update(time, delta) {

        this.RoomNavigator.UpdateInput();


        // tick the input system and other systems maybe

    }
    drawPlayer() {

    }
}

