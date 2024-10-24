import Phaser, { Scene } from 'phaser';

import { createWorld, IWorld, System } from "bitecs";

import { HudFlags, HudRoomInfo } from './Hud';
import { RoomNavigator } from '../roomnavigator';
import Player from '../player';
import { LevelConfig, Rectangle } from '../config/levelconfig';
import { Character, Item } from '../config/configentities';
import { Inventory } from '../inventory';
import { customEmitter } from '../components/customemitter';
import { InputEventSystem, KEYEVENT_CLOSEDIALOG, KEYEVENT_DROP_ITEM, KEYEVENT_FOLLOW_PLAYER, KEYEVENT_OPENDIALOG, KEYEVENT_PICKUP_ITEM, KEYEVENT_TELEPORT, KEYEVENT_TOGGLE_DEBUG } from '../systems/inputEventSystem';
import { GameFlags } from './GameFlags';
import { ObjectItem } from './objectitem';
import { DialogManager } from '../systems/dialogManager';
import { MenuDialogParameters } from './dialogs/MenuDialog';
import { InventoryDialogParameters } from './dialogs/InventorySelector';


export class GamePlayWindowConfig {
    parent: Scene;
    x: number;
    y: number;
    width: number;
    height: number;
    dialogManager: DialogManager;

    constructor(parent: Scene, x: number, y: number, width: number, height: number, dialogManager: DialogManager) {
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
        this.dialogManager = dialogManager;
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
    private solidLayer: Phaser.Tilemaps.TilemapLayer;
    private characterLayer: Phaser.Types.Tilemaps.TiledObject[];
    private objectLayer: Phaser.Types.Tilemaps.TiledObject[];

    private roomWidthInTiles: number = 16;
    private roomHeightInTiles: number = 10;


    private horizontalRooms: number;
    private verticalRooms: number;
    private Items: Map<string, ObjectItem>;

    RoomNavigator: RoomNavigator;
    Player: Player;
    flags: GameFlags;
    ObjectGroup: Phaser.Physics.Arcade.Group;
    inputEventSystem: System;
    private _dialogManager: DialogManager;

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
        if (this.Player) {
            this.Player.allowMovement = args.FollowingPlayer;
        }
        var newhudFlags = new HudFlags(args.FollowingPlayer, args.Debug);
        customEmitter.emit('updateflags', newhudFlags);


    }
    setupPhysics() {
        this.physics.world.gravity.y = 1500;

    }
    create() {
        this.camera = this.cameras.main


        this.setupPhysics();



        this.cursors = this.input.keyboard?.createCursorKeys()
        /*
                this.ToggleFollowingPlayerKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.F);
                this.PickupItemKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.P);
                this.DropItemKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.X);
                this.ToggleDebugKey = this.input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
          */
        this.flags = new GameFlags(this.onFlagsChanged, this);

        this.physics.world.drawDebug = false;

        this.flags.Debug = this.physics.world.drawDebug;


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

        this.map.createLayer('background', this.map_alltiles)!
        this.map.createLayer('foreground', this.map_foregroundtiles)!
        this.solidLayer = this.map.createLayer('solid', this.map_alltiles)!
        this.characterLayer = this.map.getObjectLayer('characters')?.objects!
        this.map.getObjectLayer('doorobjects')?.objects!
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

        this.inputEventSystem = InputEventSystem(this.input);

        this.wireupEvents();



    }

    showDialog() {

        this._dialogManager.clear();
        let x = 100;
        let y = 150;

        var windowParameters = new MenuDialogParameters(this,
            new Rectangle(x, y, 400, 100),
            [
                'p = pickup',
                'x = drop',
                'cursorkeys = move',
                'space = show debug',
                'f = toggle follow player',
                't = teleport (if you carry the key)'
            ]
            , true

        );

        windowParameters.texture = 'border_panel_green';
        windowParameters.color = '0xcf6af7';

        this._dialogManager.showDialog('commandDialog', windowParameters);

        // if (this.scene.manager.getIndex('commandDialog') < 0) {
        //     this.scene.manager.add('commandDialog', CommandDialog, false);
        // }

        // this.scene.launch('commandDialog', playWindow);

    }

    showInventory() {

        let x = 250;
        let y = 250;

        var windowParameters = new InventoryDialogParameters(this,
            new Rectangle(x, y, 400, 100),
            [
                'f = florin',
                'e = elrand',

            ]
            , true

        );
        windowParameters.texture = 'border_panel_red';

        windowParameters.color = '0x6a6aff';

        this._dialogManager.showDialog('inventoryDialog', windowParameters);

    }
    private closeLastDialog() {

        this._dialogManager.closeTopmost();


    }
    private wireupEvents() {

        customEmitter.on(KEYEVENT_OPENDIALOG, () => {
            this.showDialog();
            this.showInventory();
        });

        customEmitter.on(KEYEVENT_CLOSEDIALOG, () => {
            this.closeLastDialog();

        });
        customEmitter.on(KEYEVENT_TELEPORT, () => {
            this.teleportPlayerToPad();
        });
        customEmitter.on(KEYEVENT_TOGGLE_DEBUG, () => {
            this.flags.Debug = !this.flags.Debug;
            this.toggleDebug(this.flags.Debug);
        })
        customEmitter.on(KEYEVENT_FOLLOW_PLAYER, () => {
            this.flags.FollowingPlayer = !this.flags.FollowingPlayer;
        })
        customEmitter.on(KEYEVENT_DROP_ITEM, () => {
            this.dropLastItem();
        })
        customEmitter.on(KEYEVENT_PICKUP_ITEM, () => {
            this.pickupNearestItem();
        })

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
                    let ss = this.add.sprite(pixelX + characterhalfW, pixelY + characterhalfH, 'characters', index);
                    ss.name = o.name;
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

        const that = this;
        this.Items = new Map<string, ObjectItem>();

        this.ObjectGroup = this.physics.add.group();

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

                let sprite = this.physics.add.sprite(pixelX, pixelY + objecthalfH, 'objects', index);
                sprite.body.setSize(16, 16);

                this.ObjectGroup.add(sprite, false);
                let newitem = new ObjectItem(itemInfo, sprite);

                that.Items.set(newitem.id, newitem);
                this.physics.add.collider(sprite, this.solidLayer);
                sprite.name = objectName;

            }
        });
    }

    createKnight(x: number, y: number, index: number) {


        const sprite = this.physics.add.sprite(x, y, 'characters', index);

        const nearbyWidth = sprite.width * 4;
        const nearbySprite = this.physics.add.body(x, y, nearbyWidth, sprite.height);
        nearbySprite.allowGravity = false;

        const currentGravity = this.physics.world.gravity.y;
        const playerGravity = currentGravity * -0.35;

        let inventory = new Inventory(5, 10);

        this.Player = new Player(sprite, nearbySprite, this.cursors!, playerGravity, inventory);

        this.physics.add.collider(sprite, this.solidLayer);
        this.physics.add.overlap(nearbySprite, this.ObjectGroup);

        sprite.name = "Knight";

    }

    positionCameraAccordingToRoom() {

        const roomCoords = this.RoomNavigator.GetRoomCoords();

        const roomInfo = this._levelConfig.findRoom(roomCoords.x, roomCoords.y);

        if (!roomInfo) {
            console.log(`Failed to find room! ${roomCoords}`);
        } else {

            console.log('room stats', roomInfo.stats);

            customEmitter.emit("screenmov", new HudRoomInfo(roomCoords.x, roomCoords.y, roomInfo.name));
            this.camera.setBounds(
                roomInfo.WorldLocation.x, roomInfo.WorldLocation.y,
                roomInfo.WorldLocation.width, roomInfo.WorldLocation.height, false);

            if (roomInfo.stats.dark) {
                console.log("its TOO DARK in here!");
                this.camera.setAlpha(0.2);
            } else {
                this.camera.setAlpha(1);

            }
        }
    }
    teleportPlayerToPad() {
        // if the player is carrying the teleportkey

        if (!this.Player.getBody().onFloor()) {
            return;

        }
        if (!this.Player.getInventory().HasItem("teleportkey")) {
            console.error("you arent carrying the teleport key");
            return;
        }

        if (this.Player.getInventory().HasItem("teleportpad")) {
            console.error("you are CARRYING the teleport pad! you cant teleport to it");
            return;
        }

        // find the teleportpad
        const tp = this.Items.get("teleportpad");
        if (!tp) {
            console.error("Cannot find teleportpad");
            return;
        }

        if (tp.owner) {
            console.error("Someone is carrying that!");
            return;
        }

        const newLocationX = tp!.Sprite.x;
        const newLocationY = tp!.Sprite.y;

        console.log("moving to {0},{1}", newLocationX, newLocationY)

        this.Player.moveTo(newLocationX, newLocationY);

    }
    init(data: GamePlayWindowConfig) {


        this._dialogManager = data.dialogManager;

        this.cameras.main.setViewport(data.x, data.y, data.width, data.height);

        this.world = createWorld()


    }

    showRoomThatThePlayerIsIn() {
        let s = this.Player.getSprite();
        const px = s.x;
        const py = s.y;

        const cw = this.camera.displayWidth;
        const ch = this.camera.displayHeight;

        const rx = Math.trunc(px / cw);
        const ry = Math.trunc(py / ch);

        const newCoords = { x: rx, y: ry };

        this.RoomNavigator.SetRoomCoordinates(newCoords);

    }
    getNearbyItems(): ObjectItem[] {
        let s = this.Player.getNearbySprite();

        let nearObjects: Phaser.GameObjects.Sprite[] = [];

        this.physics.overlap(s, this.ObjectGroup, (_, b: Phaser.Physics.Arcade.GameObjectWithBody) => {


            nearObjects.push(b);
        });

        console.log(nearObjects);

        let nearbyItems: ObjectItem[] = [];
        // map the objects into items
        nearObjects.map(o => {
            let objectName = o.name;
            let item = this.Items.get(objectName);
            if (item) {
                if (!item.owner) {
                    nearbyItems.push(item);
                }
            }
        })
        return nearbyItems;
    }
    pickupNearestItem() {
        let nearbyItems = this.getNearbyItems();

        if (nearbyItems.length == 0) {
            // no items
        } else {
            let itemToPickup = nearbyItems[0];
            let s = itemToPickup.Sprite;
            //s.setImmovable(true);
            s.body.setAllowGravity(false);
            let result = this.Player.getInventory().AddItem(nearbyItems[0]);
            if (result.ok) {
                // great
            } else {
                console.log(result.error.message);
            }
        }
    }
    dropLastItem() {
        let items = this.Player.getInventory().GetItems();
        if (items.length == 0) {
            // you arent carrying anything
            console.log("You arent carrying anything!");
        } else {
            // drop the last item
            let lastItem = items[items.length - 1];
            let s = lastItem._sprite;
            s.body.setAllowGravity(true);

            this.Player.getInventory().RemoveItem(lastItem);

        }
    }
    toggleDebug(on: boolean) {
        if (!on) {
            this.physics.world.drawDebug = false;
            this.physics.world.debugGraphic.clear();
        }
        else {
            this.physics.world.drawDebug = true;
        }
    }
    update(/*time, delta*/) {

        this.inputEventSystem(this.world);
        this.RoomNavigator.UpdateInput();

        this.Player.Update();

        if (this.flags.FollowingPlayer) {
            this.showRoomThatThePlayerIsIn();
        }

    }

}

