import Phaser, { Scene } from 'phaser';

import { createWorld, IWorld } from "bitecs";

import { HudFlags, HudRoomInfo } from './Hud';
import { RoomNavigator } from '../roomnavigator';
import Player from '../player';
import { LevelConfig } from '../config/levelconfig';
import { Character, Item } from '../config/configentities';

class GameFlags {
    private _followingPlayer: boolean;
    private _callback: (values: GameFlags, propertyName: string, oldValue: any) => void;
    private _context: any;

    constructor(callback: (values: GameFlags, propertyName: string, oldValue: any) => void, context: any) {
        this._callback = callback;
        this._context = context;
    }

    set FollowingPlayer(newvalue: boolean) {
        let oldValue = this._followingPlayer;
        if (oldValue == newvalue) return;

        this._followingPlayer = newvalue;
        this._callback.call(this._context, this, "FollowingPlayer", oldValue);
    }
    get FollowingPlayer() { return this._followingPlayer; }


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

    private _levelConfig: LevelConfig;

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

    private roomWidthInTiles: number = 16;
    private roomHeightInTiles: number = 10;


    private cameraController: any;
    private hud: any;
    private horizontalRooms: number;
    private verticalRooms: number;
    private inputTimer: Phaser.Time.TimerEvent;
    private parentScene: Scene;
    RoomNavigator: RoomNavigator;
    Player: Player;
    followingPlayer: boolean;
    ToggleFollowingPlayerKey: Phaser.Input.Keyboard.Key | undefined;
    flags: GameFlags;

    constructor() {
        super('GamePlay')
    }



    preload() {

    }
    onRoomChanged() {

        this.positionCameraAccordingToRoom();

    }
    onFlagsChanged(args: GameFlags, propertyName: string, oldValue: any) {


        if (propertyName == 'FollowingPlayer') {
            // move the screen to the player
            this.showRoomThatThePlayerIsIn();
        }
        var newhudFlags = new HudFlags(args.FollowingPlayer);
        this.events.emit('updateflags', newhudFlags);


    }
    setupPhysics() {
        this.physics.world.gravity.y = 1500;

    }
    create() {
        this.camera = this.cameras.main


        this.setupPhysics();

        this.cursors = this.input.keyboard?.createCursorKeys()

        this.ToggleFollowingPlayerKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.F);

        this.flags = new GameFlags(this.onFlagsChanged, this);

        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);
        this.camera.setZoom(3.5);

        this.map = this.make.tilemap({ key: 'levels', tileWidth: 16, tileHeight: 16 });

        this._levelConfig = new LevelConfig(this.cache, this.roomWidthInTiles, this.map.tileWidth, this.roomHeightInTiles, this.map.tileHeight);

        const boundaries = this._levelConfig.getRoomBoundaries();
        this.horizontalRooms = boundaries.x + 1;
        this.verticalRooms = boundaries.y + 1;

        //this.rooms = this.splitTileMapIntoRooms(this.map);

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

        this.map.setCollisionBetween(0, 1000, true, true, 'solid');


        this.createObjectSprites();

        this.createCharacterSprites();

        const w = this.roomWidthInTiles * this.map.tileWidth * this.cameras.main.zoomX;
        const h = this.roomHeightInTiles * this.map.tileHeight * this.cameras.main.zoomY;
        this.cameras.main.setSize(w, h);

        // set the start room
        this.RoomNavigator.SetRoomCoordinates({ x: 5, y: 2 });
        this.flags.FollowingPlayer = true;


    }
    private getCharacter(name: string): Character | undefined {
        let character = this._levelConfig.Characters.find(c => c.id == name);

        return character;
    }
    private createCharacterSprites() {
        const characterTileHeight = 32;
        const charaterTileWidth = 16;
        const characterTilemapWidth = 16;

        const characterhalfH = characterTileHeight / 2;
        const characterhalfW = charaterTileWidth / 2;

        this.characterLayer.forEach(o => {
            const characterName = o.name; // + "_right";

            let characterInfo = this.getCharacter(characterName);

            const mapWidth = characterTilemapWidth;

            if (!characterInfo) {
                console.log("Cannot find character texture for " + characterName);
            } else {
                let firstImage = characterInfo.images[0];
                const index = (firstImage.y * mapWidth) + firstImage.x;

                const pixelX = Math.ceil(o.x! / 16) * 16;
                const pixelY = Math.ceil(o.y! / 16) * 16;

                if (o.name == "knight") {
                    // create the knight and add to the world
                    this.createKnight(pixelX + characterhalfW, pixelY + characterhalfH, index);
                } else {
                    this.add.sprite(pixelX + characterhalfW, pixelY + characterhalfH, 'characters', index);

                }
            }
        });
    }

    private getItemInfo(name: string): Item | undefined {
        return this._levelConfig.Items.find(x => x.id == name);
    }
    private createObjectSprites() {
        const objectTileHeight = 16;
        const objectTileWidth = 16;
        const objectTilemapWidth = 16;

        const objecthalfH = objectTileHeight / 2;

        // create the objets
        this.objectLayer.forEach(o => {
            const objectName = o.name;

            let itemInfo = this.getItemInfo(objectName);

            const mapWidth = objectTilemapWidth;
            if (!itemInfo) {
                console.log("Failed to find object " + objectName);
            } else {

                let firstImage = itemInfo.images[0];
                const index = (firstImage.y * mapWidth) + firstImage.x;
                const pixelX = Math.ceil(o.x! / objectTileWidth) * objectTileWidth;
                const pixelY = Math.ceil(o.y! / objectTileHeight) * objectTileHeight;

                this.add.sprite(pixelX, pixelY + objecthalfH, 'objects', index);

            }
        });
    }

    createKnight(x: number, y: number, index: number) {


        const sprite = this.physics.add.sprite(x, y, 'characters', index);


        const currentGravity = this.physics.world.gravity.y;
        const playerGravity = currentGravity * -0.35;
        this.Player = new Player(sprite, this.cursors!, playerGravity);

        this.physics.add.collider(sprite, this.solidLayer);
    }

    positionCameraAccordingToRoom() {

        const roomCoords = this.RoomNavigator.GetRoomCoords();

        const roomInfo = this._levelConfig.findRoom(roomCoords.x, roomCoords.y);

        if (!roomInfo) {
            console.log(`Failed to find room! ${roomCoords}`);
        } else {

            this.events.emit("screenmov", new HudRoomInfo(roomCoords.x, roomCoords.y, roomInfo.name));
            this.camera.setBounds(
                roomInfo.WorldLocation.x, roomInfo.WorldLocation.y,
                roomInfo.WorldLocation.width, roomInfo.WorldLocation.height, false);
        }
    }
    init(data: GamePlayWindowConfig) {

        this.parentScene = data.parent;

        this.cameras.main.setViewport(data.x, data.y, data.width, data.height);

        this.world = createWorld()


    }

    showRoomThatThePlayerIsIn() {
        const px = this.Player.sprite.x;
        const py = this.Player.sprite.y;

        const cw = this.camera.displayWidth;
        const ch = this.camera.displayHeight;

        const rx = Math.trunc(px / cw);
        const ry = Math.trunc(py / ch);

        const newCoords = { x: rx, y: ry };

        this.RoomNavigator.SetRoomCoordinates(newCoords);

    }
    update(time, delta) {

        //const sprite = this.Player.sprite;
        //this.physics.collide(sprite, this.solidLayer,);

        this.RoomNavigator.UpdateInput();

        this.Player.Update();

        // tick the input system and other systems maybe

        // check if  player wandered off screen

        if (Phaser.Input.Keyboard.JustDown(this.ToggleFollowingPlayerKey!)) {
            this.flags.FollowingPlayer = !this.flags.FollowingPlayer;

        }
        if (this.flags.FollowingPlayer) {
            this.showRoomThatThePlayerIsIn();
        }

    }

}

