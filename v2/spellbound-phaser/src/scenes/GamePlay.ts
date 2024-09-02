import Phaser from 'phaser';

import { createWorld, IWorld, System } from "bitecs";
import createMovementSystem from "../systems/movement";
import createInputSystem from "../systems/input";
import createSpriteSystem from "../systems/sprite";

export class GamePlay extends Phaser.Scene {
    private camera: Phaser.Cameras.Scene2D.Camera;
    private world: IWorld;
    private movementSystem: System;
    private inputSystem: System;
    private spriteSystem: System;
    private cursors?: Phaser.Types.Input.Keyboard.CursorKeys
    private map: Phaser.Tilemaps.Tilemap;

    private background: Phaser.GameObjects.Image;
    private msg_text : Phaser.GameObjects.Text;
    private map_alltiles: Phaser.Tilemaps.Tileset ;
    private map_foregroundtiles: Phaser.Tilemaps.Tileset ;
    private backgroundLayer: Phaser.Tilemaps.TilemapLayer ;
    private foregroundLayer: Phaser.Tilemaps.TilemapLayer ;
    private solidLayer: Phaser.Tilemaps.TilemapLayer ;
    private characterSprites: Phaser.GameObjects.GameObject[];
    private objectSprites: Phaser.GameObjects.GameObject[];
    characterLayer: Phaser.Types.Tilemaps.TiledObject[];
    doorLayer: Phaser.Types.Tilemaps.TiledObject[];
    objectLayer: Phaser.Types.Tilemaps.TiledObject[];
    roomX: number;
    roomY: number;
    roomWidth: number;
    roomHeight: number;
     characterMap: Map<String, { x: integer; y: integer; }>;
    objectMap: Map<String, { x: integer; y: integer; }>;
    constructor() {
        super('GamePlay')
    }

    preload() {

    }
    create() {
        this.camera = this.cameras.main
        this.cursors=this.input.keyboard?.createCursorKeys()
        
        // init the systems
        
        this.movementSystem = createMovementSystem()
        this.spriteSystem = createSpriteSystem(this, [""])

        this.inputSystem = createInputSystem(this.cursors)
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x000000);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.msg_text = this.add.text(512, 384, 'Gameplay scene', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        });
        this.msg_text.setOrigin(0.5);

        this.map = this.make.tilemap({key: 'levels', tileWidth: 16, tileHeight: 16});

        this.map_alltiles = this.map.addTilesetImage('alltiles','map_background')!
        this.map_foregroundtiles = this.map.addTilesetImage('foregroundtiles','map_foreground')!

        this.backgroundLayer = this.map.createLayer('background', this.map_alltiles)!
        this.foregroundLayer = this.map.createLayer('foreground', this.map_foregroundtiles)!
        this.solidLayer = this.map.createLayer('solid', this.map_alltiles)!
        this.characterLayer = this.map.getObjectLayer('characters')?.objects!
        this.doorLayer = this.map.getObjectLayer('doorobjects')?.objects!
        this.objectLayer = this.map.getObjectLayer('objects')?.objects!
                        
        this.characterMap = new Map<String, {x:integer,y: integer}>();
        this.characterMap.set("left1", {x:0,y:0});
        this.characterMap.set("left2", {x:1,y:0});
        this.characterMap.set("ladyrosmar_right", {x:4,y:0});
        this.characterMap.set("ladyrosmar_left", {x:5,y:0});
        this.characterMap.set("thor_right", {x:6,y:0});
        this.characterMap.set("thor_left", {x:7,y:0});
        this.characterMap.set("florin_right", {x:8,y:0});
        this.characterMap.set("florin_left", {x:9,y:0});
        this.characterMap.set("banshee_right", {x:10,y:0});
        this.characterMap.set("banshee_left", {x:11,y:0});
        this.characterMap.set("samsun_right", {x:12,y:0});
        this.characterMap.set("samsun_left", {x:13,y:0});
        this.characterMap.set("elrand_right", {x:14,y:0});
        this.characterMap.set("elrand_left", {x:15,y:0});
        
        this.objectMap = new Map<String, {x:integer,y: integer}>();
        this.objectMap.set("shadows", {x:0, y:0});
        this.objectMap.set("fish", {x:1, y:0});
        this.objectMap.set("crystalball", {x:2, y:0});
        this.objectMap.set("candle", {x:3, y:0});
        this.objectMap.set("redherring", {x:4, y:0});
        this.objectMap.set("mirror", {x:5, y:0});
        this.objectMap.set("elfhorn", {x:6, y:0});
        this.objectMap.set("wand", {x:7, y:0});
        this.objectMap.set("bluegem", {x:8, y:0});
        this.objectMap.set("whitering", {x:9, y:0});
        this.objectMap.set("saxophone", {x:10, y:0});
        this.objectMap.set("glowingbottle", {x:11, y:0});
        this.objectMap.set("fourleafclover", {x:12, y:0});
        this.objectMap.set("greenbottle", {x:13, y:0});
        this.objectMap.set("yellowadvert", {x:14, y:0});
        this.objectMap.set("prism", {x:15, y:0});
        this.objectMap.set("javelin", {x:16, y:0});
        this.objectMap.set("greengem", {x:17, y:0});

        this.objectMap.set("whiteadvert", {x:18, y:0});
        this.objectMap.set("advert", {x:18, y:0});
        
        this.objectMap.set("redgem", {x:19, y:0});
        this.objectMap.set("whiteball", {x:20, y:0});
        this.objectMap.set("engravedcandle", {x:21, y:0});
        this.objectMap.set("yellowkey", {x:22, y:0});
        this.objectMap.set("urn", {x:23, y:0});
        this.objectMap.set("talisman", {x:24, y:0});
        this.objectMap.set("teleportkey", {x:25, y:0});
        this.objectMap.set("teleportpad", {x:26, y:0});
        this.objectMap.set("masonry", {x:27, y:0});
        this.objectMap.set("bluebottle", {x:28, y:0});
        this.objectMap.set("goldbrick2", {x:29, y:0});
        this.objectMap.set("goldbrick", {x:29, y:0});
        
        this.objectMap.set("blueball", {x:30, y:0});
        this.objectMap.set("whitegoldring", {x:31, y:0});

        this.objectMap.set("stickybun", {x:0, y:1});
        this.objectMap.set("greenbook", {x:1, y:1});
        this.objectMap.set("goblet", {x:2, y:1});
        this.objectMap.set("glue", {x:3, y:1});
        this.objectMap.set("trumpet", {x:4, y:1});
        this.objectMap.set("puddle", {x:5, y:1});
        this.objectMap.set("lazer", {x:6, y:1});
        this.objectMap.set("brokentalisman", {x:7, y:1});
        this.objectMap.set("powerpongplant", {x:8, y:1});
        this.objectMap.set("shield", {x:9, y:0});
        
        
        this.roomX = -9;
        this.roomY = -8;
        this.roomWidth=8*4;
        this.roomHeight=8;
       
        // create the objets
        this.objectLayer.forEach(o => {
            const objectName=o.name;
            const objectPosition = this.objectMap.get(objectName);

            const mapWidth=16;
            if(!objectPosition) {
                console.log("Failed to find object "+objectName)
            } else {

            const index=(objectPosition.y * mapWidth) + objectPosition.x;

            this.add.sprite(o.x!, o.y! + 8, 'objects',index);
            }
        })

        this.characterLayer.forEach(o => {
            const characterName=o.name+"_right";
            const characterPosition = this.characterMap.get(characterName);
            const mapWidth=16;
            if(!characterPosition ) {
                console.log("Cannot find character texture for "+characterName);
            } else {
                const index=(characterPosition.y * mapWidth) + characterPosition.x;

                this.add.sprite(o.x!, o.y!, 'characters', index);
            }
        })

        this.loadRoom();
this.input.on('key_up', () => {
console.log(this.camera.scrollX);

            this.roomX--;
            this.showRoom();
            

        });

       
    }
    showRoom() {
        console.log(this.roomX);

        this.camera.setScroll(this.roomX  * this.roomWidth, this.roomY  * this.roomHeight);
    }
    loadRoom() {

    }
    init(data) {
        // everything is loaded, so display stuff
        // data is the params passed to this scene with this.scene.start(key,data)

        // in this example, i will share the world with one passed in
        if(data.world) {
            this.world = data.world
        } else {
            this.world = createWorld()
        }
    }
    update() {
        // tick the physics
        this.movementSystem(this.world)
        this.inputSystem(this.world)
        

        // draw all characters in this location

        // tick the input system and other systems maybe
        
    }
    drawRoom() {

    }
    drawObjects() {

    }
    drawPlayer() {

    }
}

