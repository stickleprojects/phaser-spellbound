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
import { InventoryDialogParameters } from './dialogs/InventorySelector';
import { MessageDialogParameters } from './dialogs/MessageDialog';
import { DoorStateEnum, IDoor, LiftManager } from '../systems/liftManager';
import { CommandDialogParameters, CommandItem } from './dialogs/CommandDialog';
import { LiftControlPanel } from './LiftControlPanel';

class DoorSprite implements IDoor {
    private _sprite: Phaser.GameObjects.Sprite;
    private _tags: Map<string, any> = new Map<string, any>();

    private _state: DoorStateEnum = DoorStateEnum.closed;

    constructor(sprite: Phaser.GameObjects.Sprite) {
        this._sprite = sprite;

    }
    get Tags(): Map<string, any> {
        return this._tags;
    }
    GetPosition(): { x: number; y: number; } {

        return { x: this._sprite.x, y: this._sprite.y };
    }
    get Name(): string { return this._sprite.name; }
    OpenAsync(): Promise<boolean> {


        return new Promise<boolean>((resolve) => {
            if (this.isOpen) {
                resolve(true)
            } else {

                this._sprite.play('open').once('animationcomplete-open', () => {
                    this._state = DoorStateEnum.open;
                    this._sprite.setVisible(false);
                    console.log('door open', this._sprite.name);
                    resolve(true);
                })

            }
        });
    }
    CloseAsync(): Promise<boolean> {

        return new Promise<boolean>((resolve) => {

            if (this.isClosed) {
                resolve(true)
            } else {
                this._sprite.setVisible(true);

                this._sprite.play('close').once('animationcomplete-close', () => {
                    this._state = DoorStateEnum.closed;

                    console.log('door close', this._sprite.name);
                    resolve(true);
                })

            }
        });
    }
    get isOpen(): boolean {
        return this._state == DoorStateEnum.open;
    }
    get isClosed(): boolean {
        return this._state == DoorStateEnum.closed;
    }


}
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

    LiftManager: LiftManager;
    RoomNavigator: RoomNavigator;
    Player: Player;
    flags: GameFlags;
    ObjectGroup: Phaser.Physics.Arcade.Group;
    inputEventSystem: System;
    private _dialogManager: DialogManager;
    Doors: IDoor[];
    DoorGroup: Phaser.Physics.Arcade.StaticGroup;
    private _liftDoorKnightOverlap: Phaser.Physics.Arcade.Collider;
    private _liftControlPanel: LiftControlPanel;


    constructor() {
        super('GamePlay')
    }



    preload() {

    }
    onRoomChanged() {

        this.positionCameraAccordingToRoom();

    }
    onFlagsChanged(args: GameFlags, propertyName: string) {


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
    async create() {
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


        this.objectLayer = this.map.getObjectLayer('objects')?.objects!

        this.map.setCollisionBetween(0, 1000, true, true, 'solid');

        this.createDoors(this.map.getObjectLayer('doorobjects')?.objects!);


        this.LiftManager = await LiftManager.CreateAsync(this.Doors, this.input, this.sound);

        let pnl = this.objectLayer.find(x => x.name == '#lift-control-panel');

        if (!pnl) {
            throw "Cannot find #lift-control-panel in the objectlayer"
        } else {
            this._liftControlPanel = new LiftControlPanel(this, pnl.x!, pnl.y!, this.LiftManager);
        }

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
    createDoors(doorTileObjects: Phaser.Types.Tilemaps.TiledObject[]) {



        const objectTileWidth = 16;


        const objecthalfW = objectTileWidth / 2;


        this.Doors = [];

        this.DoorGroup = this.physics.add.staticGroup();

        // create the door objects
        doorTileObjects.forEach(o => {
            const objectName = o.name.toLocaleLowerCase();

            console.log("Creating lift ", objectName)
            const frameName = "24.png"
            const pixelX = Math.ceil(o.x! / 16) * 16;
            const pixelY = Math.ceil(o.y! / 16) * 16;

            let sprite = this.physics.add.staticSprite(pixelX - objecthalfW, pixelY, 'characters', frameName);

            sprite.setGravity(0, 0);

            //            sprite.setOrigin(0, 0.5);
            sprite.body.setSize(16, 32);


            if (objectName != "liftentrance") {
                this.DoorGroup.add(sprite);
            }
            if ((objectName == "liftentrance")) {
                sprite.setVisible(false);
            }
            const door = new DoorSprite(sprite);

            this.Doors.push(door);

            sprite.name = objectName;
            sprite.setPipeline('Light2D');

            sprite.anims.create({
                key: 'open',
                frames: this.anims.generateFrameNames('characters', { start: 24, end: 26, suffix: ".png", zeroPad: 2 }),
                frameRate: 10

            })
            sprite.anims.create({
                key: 'close',
                frames: this.anims.generateFrameNames('characters', { start: 26, end: 24, suffix: ".png", zeroPad: 2 }),
                frameRate: 10

            })

        });

        // ensure doors dont fall through the floor
        this.physics.add.collider(this.DoorGroup, this.solidLayer);

    }


    showDialog() {

        this._dialogManager.clear();
        let x = 100;
        let y = 150;

        var dialogParameters = new CommandDialogParameters(this,
            new Rectangle(x, y, 400, 100),
            [
                new CommandItem('i. inventory', (_) => {
                    //this._dialogManager.closeTopmost();
                    this.showInventorySelector((selectedItem: IInventoryItem) => {
                        this._dialogManager.clear();
                        this.showMessage('YOu selected ' + selectedItem.name);
                        console.log('woo hoo, inventory and you selected a thing %s', selectedItem.name)
                    });

                }),
                new CommandItem('p. pickup', (_) => {
                    this.pickupItem();

                }),
                new CommandItem('x. drop', (_) => {
                    this._dialogManager.closeTopmost();
                    this.dropLastItem();
                }),
                //new CommandItem('cursorkeys = move', (_) => console.log('on cursorkeys')),
                new CommandItem('Show debug', (_) => {
                    this._dialogManager.closeTopmost();

                    customEmitter.emitToggleDebug();
                }),
                new CommandItem('Toggle follow player', (_) => {
                    this._dialogManager.closeTopmost();

                    customEmitter.emitToggleFollowPlayer();
                }),
                new CommandItem('Teleport (if you carry the key)', (_) => {
                    this._dialogManager.closeTopmost();
                    customEmitter.emitTeleport();
                }),
                new CommandItem('c = call lift', (_) => {
                    this._dialogManager.closeTopmost();
                    customEmitter.emitCallLift();

                })
            ]
            , true

        );

        dialogParameters.color = '0xcf6af7';
        dialogParameters.isModal = true;

        this._dialogManager.showDialog('commandDialog', dialogParameters);

    }

    showMessage(txt: string[] | string) {

        if (typeof txt === 'string') {
            txt = [txt];
        }
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
    showNearbyItemsSelector(onselected: (itm: IInventoryItem) => void) {
        const r = this._dialogManager.getTopmost()?.data.dimensions;

        if (!r) {
            console.error("Failed to get topmostdialog.data.dimensions, got undefined instead");
            return;
        }

        const nearbyItems = this.getNearbyItems();
        if (nearbyItems.length == 0) {
            this._dialogManager.closeTopmost();
            this.showMessage('There is nothing nearby to do that to!');
            return;
        }
        const newPosition = new Rectangle(r.x + 100, r.y + 100, r?.width, 100);
        const menuItems = nearbyItems.map((itm: ObjectItem, _) =>
            new CommandItem(itm.name, (p) => {
                console.log('you selected item %s, invoking callback', itm.name);
                onselected(itm as IInventoryItem);
            }));
        const args = new InventoryDialogParameters(parent, newPosition, menuItems);

        args.color = '0x6a6aff';

        this._dialogManager.showDialog('inventoryDialog', args);

    }
    showInventorySelector(onselected: (itm: IInventoryItem) => void) {

        const r = this._dialogManager.getTopmost()?.data.dimensions;

        if (!r) {
            console.error("Failed to get topmostdialog.data.dimensions, got undefined instead");
            return;
        }
        const inventory = this.Player.getInventory();
        if (!inventory) {
            console.error("Cannot find player's inventory");
            return;
        }
        if (inventory.GetItems().length == 0) {
            this._dialogManager.closeTopmost();
            this.showMessage('you arent carrying anything!');
            return;
        }
        const newPosition = new Rectangle(r.x + 100, r.y + 100, r?.width, 100);
        const menuItems = inventory.GetItems().map((itm, _) =>
            new CommandItem(itm.name, (p) => {
                console.log('you selected item %s, invoking callback', itm.name);
                onselected(itm);
            }));
        const args = new InventoryDialogParameters(parent, newPosition, menuItems);

        args.color = '0x6a6aff';

        this._dialogManager.showDialog('inventoryDialog', args);

    }
    private wireupEvents() {


        customEmitter.onCallLift(async (_) => {
            const playerFloor = this.LiftManager.GetClosestLiftDoor(this.Player.getSprite().y);

            if (!playerFloor) return;


            await this.LiftManager.callLiftAsync(playerFloor)
        })
        customEmitter.OnLiftArrived(() => {
            console.log("on lift arrived");
        })
        customEmitter.OnLiftMoving(() => {
            console.log("on lift moving");
        })
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
        customEmitter.onDropItem((/*itemid: string*/) => {
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
                if (!objectName.startsWith('#')) {
                    console.log("Failed to find object " + objectName);
                }
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

                    const fx = sprite.postFX?.addGlow(0xf5e887, 0, 0, false, 0.1, 2);

                    this.tweens.add({
                        targets: fx,
                        outerStrength: 12,
                        yoyo: true,
                        loop: -1,
                        ease: 'sine.inout'
                    });

                    newitem.light = objectLight;
                    objectLight.setVisible(false);

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
        let teleport = this.sound.addAudioSprite('knight_teleport');

        const sprite = this.physics.add.sprite(x, y, 'characters', index);


        sprite.setPipeline('Light2D');

        const nearbyWidth = sprite.width * 4;
        const nearbySprite = this.physics.add.body(x, y, nearbyWidth, sprite.height);
        nearbySprite.allowGravity = false;

        const currentGravity = this.physics.world.gravity.y;
        const playerGravity = currentGravity * -0.35;

        let inventory = new Inventory(5, 10);

        this.Player = new Player(sprite, nearbySprite, this.cursors!, playerGravity, inventory);

        // add collider between the player and the solid objects (note that we sometimes make things invisible, so need to ignore those)
        this.physics.add.collider(sprite, this.solidLayer, undefined, this.ignoreInvisibleItemsCollider.bind(this));
        this.physics.add.collider(sprite, this.DoorGroup, undefined, this.ignoreInvisibleItemsCollider.bind(this));
        this._liftDoorKnightOverlap = this.physics.add.overlap(sprite, this.DoorGroup, undefined, this.liftDoorCollision, this);

        this.physics.add.overlap(nearbySprite, this.ObjectGroup, undefined, this.ignoreInvisibleItemsCollider.bind(this));

        sprite.name = "Knight";


        this.Player.setWalkingSound(walking);
        this.Player.setTeleportSound(teleport);

    }
    liftDoorCollision(/*player: any*/ _: any, doorSprite: any): boolean {

        // ignore collision if the door is not visible
        if (doorSprite.visible) return true;

        //disable the collider
        if (doorSprite.name != 'liftexit') {
            this._liftDoorKnightOverlap.active = false;

            // move the player sprite x,y coords in the map so they appear in the lift
            this.movePlayerIntoLift();
        } else {
            this.liftExitCollision(/*player, doorSprite*/);
        }
        return true;
    }
    liftExitCollision(/*player: any, doorSprite: any*/): void {

        const newLocation = this.LiftManager.GetLiftExitLocation();
        console.log("moving to ", newLocation)

        this.Player.moveTo(newLocation.x + 20, newLocation.y + 16);

    }
    movePlayerIntoLift() {
        const newLocation = this.LiftManager.GetLiftEntranceLocation();

        console.log("moving to ", newLocation)

        this.Player.moveTo(newLocation.x, newLocation.y);
        this._liftDoorKnightOverlap.active = true;
    }

    ignoreInvisibleItemsCollider(a: any, b: any): boolean {

        if (!b.visible) return false;
        if (!a.visible) return false;

        return true;
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

            if (this.flags.FollowingPlayer) {
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

        this.Player.teleportTo(newLocation.x, newLocation.y);

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

        this.physics.overlap(s, this.ObjectGroup, (_, b: any) => {


            nearObjects.push(b);
        });

        console.log("nearby objects", nearObjects);

        let nearbyItems: ObjectItem[] = [];
        // map the objects into items
        nearObjects.map(o => {
            let objectName = o.name;
            let item = this.Items.get(objectName);
            if (item) {
                if (!item.owner) {
                    nearbyItems.push(item);
                } else {
                    console.log("Found item", item.name, " but it has an owner already");
                }
            } else {
                console.error("couldnt identify the item from its name", o.name);
            }
        })
        return nearbyItems;
    }
    pickupNearestItem() {
        let nearbyItems = this.getNearbyItems();

        if (nearbyItems.length == 0) {
            // no items
            console.log("nothing nearby to pick up");
        } else {
            let itemToPickup = nearbyItems[0];

            let result = this.Player.getInventory().AddItem(itemToPickup);
            if (result.ok) {
                // great
            } else {
                console.log(result.error.message);
            }
        }
    }
    pickupItem() {

        this.showNearbyItemsSelector((itemToPickup: IInventoryItem) => {

            this._dialogManager.clear();
            let result = this.Player.getInventory().AddItem(itemToPickup);
            if (result.ok) {
                // great
            } else {
                console.log(result.error.message);
            }
        })

    }
    dropLastItem() {
        let items = this.Player.getInventory().GetItems();
        if (items.length == 0) {
            // you arent carrying anything
            console.log("You arent carrying anything!");
        } else {
            // drop the last item
            let lastItem = items[items.length - 1];

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


        if (this.inputEventSystem) {
            this.inputEventSystem(this.world);
        }
        if (this.LiftManager) {
            this.LiftManager.Update();
        }
        this.RoomNavigator?.UpdateInput();

        this.Player?.Update();

        if (this.flags?.FollowingPlayer) {
            this.showRoomThatThePlayerIsIn();
        }


    }

}

