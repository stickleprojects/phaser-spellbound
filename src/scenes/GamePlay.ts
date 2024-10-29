import Phaser, { Scene } from 'phaser';

import { createWorld, IWorld, System } from "bitecs";

import { HudFlags, HudRoomInfo } from './Hud';
import { RoomNavigator } from '../roomnavigator';
import Player from '../player';
import { LevelConfig, Rectangle } from '../config/levelconfig';
import { Character, Item } from '../config/configentities';
import { IInventoryItem, Inventory } from '../inventory';
import { customEmitter } from '../components/customemitter';
import { InputEventSystem } from '../systems/inputEventSystem';
import { GameFlags } from './GameFlags';
import { ObjectItem } from './objectitem';
import { DialogManager } from '../systems/dialogManager';
import { MenuDialogParameters } from './dialogs/MenuDialog';
import { InventoryDialogParameters } from './dialogs/InventorySelector';
import { MessageDialogParameters } from './dialogs/MessageDialog';


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
        customEmitter.UpdateFlags(newhudFlags);


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

        const bk = this.map.createLayer('background', this.map_alltiles)!
        bk.setPipeline('Light2D');

        const fg = this.map.createLayer('foreground', this.map_foregroundtiles)!
        fg.setPipeline('Light2D');

        this.solidLayer = this.map.createLayer('solid', this.map_alltiles)!
        this.solidLayer.setPipeline('Light2D');

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

        this.setupLights();


    }

    showDialog() {

        this._dialogManager.clear();
        let x = 100;
        let y = 150;

        var dialogParameters = new MenuDialogParameters(this,
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

        dialogParameters.color = '0xcf6af7';

        this._dialogManager.showDialog('commandDialog', dialogParameters);

    }

    showMessage(txt: string[]) {


        var dialogParameter = new MessageDialogParameters(this,
            new Rectangle(0, 0, 400, 100),
            txt
            , true

        );
        dialogParameter.centerX = true;
        dialogParameter.centerY = true;

        dialogParameter.color = '0xffffff';

        this._dialogManager.showDialog('messageDialog', dialogParameter);


    }
    showInventory() {

        let x = 250;
        let y = 250;

        var dialogParameter = new InventoryDialogParameters(this,
            new Rectangle(x, y, 400, 100),
            [
                'f = florin',
                'e = elrand',

            ]
            , true

        );

        dialogParameter.color = '0x6a6aff';

        this._dialogManager.showDialog('inventoryDialog', dialogParameter);

    }
    private wireupEvents() {

        customEmitter.onTurnOnLight((item: IInventoryItem) => {

            let x = item as ObjectItem;
            if (x) {
                x.light?.setVisible(true);
            }
        });
        customEmitter.onTurnOffLight((item: IInventoryItem) => {

            let x = item as ObjectItem;
            if (x) {
                x.light?.setVisible(false);
            }
        });

        customEmitter.onShowMessage((data: string[]) => {
            this.showMessage(data);

        });

        customEmitter.onOpenDialog(() => {
            this.showDialog();
            this.showInventory();
        });

        customEmitter.OnTeleport(() => {
            this.teleportPlayerToPad();
        });
        customEmitter.onToggleDebug(() => {
            this.flags.Debug = !this.flags.Debug;
            this.toggleDebug(this.flags.Debug);
        })

        customEmitter.onToggleFollowPlayer(() => {
            this.flags.FollowingPlayer = !this.flags.FollowingPlayer;
        })
        customEmitter.onDropItem((itemid: string) => {
            this.dropLastItem();
        })

        customEmitter.onPickupItem(() => {
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
                    //let ss = this.add.sprite(pixelX + characterhalfW, pixelY + characterhalfH, 'characters', index);
                    const spriteFrame = index.toString().padStart(2, '0') + '.png'
                    let ss = this.add.sprite(pixelX + characterhalfW, pixelY + characterhalfH, 'characters', spriteFrame);
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
                const frameName = index.toString().padStart(2, '0') + '.png';
                const pixelX = Math.ceil(o.x! / objectTileWidth) * objectTileWidth;
                const pixelY = Math.ceil(o.y! / objectTileHeight) * objectTileHeight;


                let sprite = this.physics.add.sprite(pixelX, pixelY + objecthalfH, 'objects', frameName);
                sprite.body.setSize(16, 16);

                this.ObjectGroup.add(sprite, false);
                let newitem = new ObjectItem(itemInfo, sprite);

                that.Items.set(newitem.id, newitem);
                this.physics.add.collider(sprite, this.solidLayer);
                sprite.name = objectName;
                sprite.setPipeline('Light2D');

                if (itemInfo.stats?.glows) {
                    const objectLight = this.lights.addLight(pixelX, pixelY, 50, 0xfcc603, 5);

                    newitem.light = objectLight;

                }
            }
        });
    }

    enableAmbientLight() {
        this.lights.setAmbientColor(0xe0e0e0);
    }

    disableAmbientLight() {
        this.lights.setAmbientColor(0x0);

    }
    setupLights() {
        this.lights.enable().setAmbientColor(0xa0a0a0);
        this.enableAmbientLight();



    }
    createKnight(x: number, y: number, index: number) {


        let walking = this.sound.addAudioSprite('knight_walk');


        const sprite = this.physics.add.sprite(x, y, 'characters', index);


        sprite.setPipeline('Light2D');

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


        this.Player.setWalkingSound(walking);

    }

    positionCameraAccordingToRoom() {

        const roomCoords = this.RoomNavigator.GetRoomCoords();

        const roomInfo = this._levelConfig.findRoom(roomCoords.x, roomCoords.y);

        if (!roomInfo) {
            console.log(`Failed to find room! ${roomCoords}`);
        } else {

            console.log('room stats', roomInfo.stats);

            customEmitter.emitScreenMove(new HudRoomInfo(roomCoords.x, roomCoords.y, roomInfo.name));
            this.camera.setBounds(
                roomInfo.WorldLocation.x, roomInfo.WorldLocation.y,
                roomInfo.WorldLocation.width, roomInfo.WorldLocation.height, false);


            const glowingItem = this.Player.getInventory().FindItem(i => i.stats?.glows == true);

            if (roomInfo.stats.dark) {

                if (!glowingItem) {
                    customEmitter.emitShowMessage(['its TOO DARK in here!', 'Press ESC and make your way back'])
                    console.log("its TOO DARK in here!");
                } else {
                    customEmitter.emitTurnOnLight(glowingItem);

                    console.log("its reet dark in here!! Good job you have a glowing thing!")
                }
                this.disableAmbientLight();
            } else {
                this.enableAmbientLight();
                if (glowingItem) {
                    customEmitter.emitTurnOffLight(glowingItem);
                }
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

        const newLocation = tp.getLocation();

        console.log("moving to ", newLocation)

        this.Player.moveTo(newLocation.x, newLocation.y);

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

            itemToPickup.setOwner(this.Player.getInventory());

            let result = this.Player.getInventory().AddItem(itemToPickup);
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

            lastItem.setOwner(undefined);

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

