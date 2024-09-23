import Phaser, { Tilemaps } from 'phaser';

import { createWorld, IWorld, System } from "bitecs";
import createMovementSystem from "../systems/movement";
import createInputSystem from "../systems/input";
import createSpriteSystem from "../systems/sprite";
import createCharacterMap from '../maps/characters';
import createObjectMap from '../maps/objects';
import { Hud } from './Hud';

class RoomData {
    x: number;
    y: number;
    width: number;
    height: number;
}

export class GamePlay extends Phaser.Scene {



    private camera: Phaser.Cameras.Scene2D.Camera;
    private world: IWorld;
    private movementSystem: System;
    private inputSystem: System;
    private spriteSystem: System;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
    private map: Phaser.Tilemaps.Tilemap;

    private background: Phaser.GameObjects.Image;
    private msg_text: Phaser.GameObjects.Text;
    private map_alltiles: Phaser.Tilemaps.Tileset;
    private map_foregroundtiles: Phaser.Tilemaps.Tileset;
    private backgroundLayer: Phaser.Tilemaps.TilemapLayer;
    private foregroundLayer: Phaser.Tilemaps.TilemapLayer;
    private solidLayer: Phaser.Tilemaps.TilemapLayer;
    private characterSprites: Phaser.GameObjects.GameObject[];
    private objectSprites: Phaser.GameObjects.GameObject[];
    characterLayer: Phaser.Types.Tilemaps.TiledObject[];
    doorLayer: Phaser.Types.Tilemaps.TiledObject[];
    objectLayer: Phaser.Types.Tilemaps.TiledObject[];
    roomX: number = 0;
    roomY: number = 0;
    rooms: RoomData[];
    roomWidth: number;
    roomHeight: number;
    characterMap: Map<String, { x: integer; y: integer; }>;
    objectMap: Map<String, { x: integer; y: integer; }>;
    cameraController: any;
    hud: any;
    horizontalRooms: number;
    verticalRooms: number;
    inputTimer: Phaser.Time.TimerEvent;
    constructor() {
        super('GamePlay')
    }


    splitTileMapIntoRooms(map: Tilemaps.Tilemap) {


        // iterate throught he map
        const roomWidthInTiles = 16;
        const roomHeightInTiles = 10;

        // map.width is in tiles, map.height is in tiles
        this.horizontalRooms = Phaser.Math.RoundTo(map.width / roomWidthInTiles, 0);
        this.verticalRooms = Phaser.Math.RoundTo(map.height / roomHeightInTiles, 0);


        var rooms = [];

        for (var y = 0; y < this.verticalRooms; y++)
            for (var x = 0; x < this.horizontalRooms; x++) {
                // copy the data

                const i = x * roomWidthInTiles
                const j = y * roomHeightInTiles

                const roomData = {
                    x: i * map.tileWidth,
                    y: j * map.tileHeight,
                    width: roomWidthInTiles * map.tileWidth,
                    height: roomHeightInTiles * map.tileHeight
                }

                rooms.push(roomData)
            }

        return rooms;
    }

    preload() {

    }
    create() {
        this.camera = this.cameras.main
        this.cursors = this.input.keyboard?.createCursorKeys()

        // init the systems

        // this.inputTimer = this.time.addEvent({
        //     callback: this.updateInput,
        //     callbackScope: this,
        //     delay: 500,
        //     loop: true
        // });


        this.movementSystem = createMovementSystem()
        this.spriteSystem = createSpriteSystem(this, [""])

        this.inputSystem = createInputSystem(this.cursors)
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);
        this.camera.setZoom(3.5);

        this.map = this.make.tilemap({ key: 'levels', tileWidth: 16, tileHeight: 16 });
        this.rooms = this.splitTileMapIntoRooms(this.map);


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

                this.add.sprite(pixelX, pixelY + objecthalfH, 'objects', index);
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

                this.add.sprite(pixelX + characterhalfW, pixelY + characterhalfH, 'characters', index);
            }
        })

        var controlConfig = {
            camera: this.cameras.main,
            left: this.cursors!.left,
            right: this.cursors!.right,
            up: this.cursors!.up,
            down: this.cursors!.down,
            speed: 0.2,
            disableCull: true,
            zoomIn: this.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.A),
            zoomOut: this.input!.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.E),

        };
        //this.cameraController = new Phaser.Cameras.Controls.FixedKeyControl(controlConfig);



    }
    positionCameraAccordingToRoom() {


        this.roomX = Phaser.Math.Clamp(this.roomX, 0, this.horizontalRooms - 1);
        this.roomY = Phaser.Math.Clamp(this.roomY, 0, this.verticalRooms - 1);
        const roomIndex = this.roomX + (this.roomY * this.horizontalRooms);
        const roomData = this.rooms[roomIndex];

        if (!roomData) {
            console.log("Failed to find room!");
        } else {

            this.events.emit("screenmov", { x: this.roomX, y: this.roomY });
            this.camera.setBounds(roomData.x, roomData.y, roomData.width, roomData.height, false);
        }
    }
    init(data) {
        // everything is loaded, so display stuff
        // data is the params passed to this scene with this.scene.start(key,data)
        this.scene.launch('hud', this);

        // in this example, i will share the world with one passed in
        if (data.world) {
            this.world = data.world
        } else {
            this.world = createWorld()
        }


    }
    updateInput() {

        if (Phaser.Input.Keyboard.JustDown(this.cursors!.down)) {
            this.roomY++;
            this.positionCameraAccordingToRoom();
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors!.up)) {
            this.roomY--;
            this.positionCameraAccordingToRoom();
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors!.left)) {
            this.roomX--;
            this.positionCameraAccordingToRoom();
        }
        if (Phaser.Input.Keyboard.JustDown(this.cursors!.right)) {
            this.roomX++;
            this.positionCameraAccordingToRoom();
        }
    }
    update(time, delta) {
        // tick the physics
        this.movementSystem(this.world)
        this.inputSystem(this.world)
        //this.cameraController.update(delta);

        this.updateInput();

        // tick the input system and other systems maybe

    }
    drawRoom() {

    }
    drawObjects() {

    }
    drawPlayer() {

    }
}

