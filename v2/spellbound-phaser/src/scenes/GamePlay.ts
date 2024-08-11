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

    constructor() {
        super('gameplay')
    }

    preload() {

    }
    create() {
        this.camera = this.cameras.main
        this.cursors=this.input.keyboard?.createCursorKeys()
        
        // init the systems
        this.world = createWorld()
        this.movementSystem = createMovementSystem()
        this.spriteSystem = createSpriteSystem(this, [""])

        this.inputSystem = createInputSystem(this.cursors)
        // load the current room map

        // draw all characters in this location
        // relying on the physics model to keep things moving along nicely

    }

    init() {
        // everything is loaded, so display stuff


    }
    update() {
        // tick the physics
        this.movementSystem(this.world)
        this.inputSystem(this.world)
        

        // tick the input system and other systems maybe
        
    }
    drawRoom() {

    }
    drawObjects() {

    }
    drawPlayer() {

    }
}