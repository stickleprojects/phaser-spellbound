import Phaser from 'phaser';

import { createWorld, IWorld, System } from "bitecs";
import createMovementSystem from "../systems/movement";
import createInputSystem from "../systems/input";
import createSpriteSystem from "../systems/sprite";
import Position from '../components/position';

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
    characterMap: Map<String, { x: integer; y: integer; }>;
    
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
        
        
        // create the objets
        this.objectLayer.forEach(o => {
            this.add.sprite(o.x!, o.y!, 'characters',0);
        })

        this.characterLayer.forEach(o => {
            const characterName=o.name+"_right";
            const characterPosition = this.characterMap.get(characterName);

            if(!characterPosition ) {
                console.log("Cannot find character texture for "+characterName);
            } else {
                this.add.sprite(o.x!, o.y!, 'characters', characterPosition.x);
            }
        })

        this.loadRoom();

       
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

