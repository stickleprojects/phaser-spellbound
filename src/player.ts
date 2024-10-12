import { Physics } from "phaser";

export default class Player {
    sprite: Phaser.GameObjects.Sprite;
    private speed: number = 150;
    private jumpSpeed: number = -250;
    private gravity: number = 600;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys

    constructor(sprite: Phaser.GameObjects.Sprite,
        cursors: Phaser.Types.Input.Keyboard.CursorKeys
        , jumpSpeed: number = -250) {
        this.sprite = sprite;

        this.jumpSpeed = jumpSpeed;
        this.getBody().allowGravity = true;
        this.getBody().setMass(1)
        this.getBody().setGravityY(this.gravity);
        this.getBody().setFriction(1, 0);

        this.cursorKeys = cursors;
    }

    protected getBody(): Physics.Arcade.Body {
        return this.sprite.body as Physics.Arcade.Body;
    }
    moveRight() {

        this.getBody().setVelocityX(this.speed);

    }
    moveLeft() {
        this.getBody().setVelocityX(-this.speed);

    }
    jump() {
        this.getBody().setVelocityY(this.jumpSpeed);
    }
    Update() {


        if (this.cursorKeys.right.isDown) {
            // move sprite 
            this.moveRight();
        } else if (this.cursorKeys.left.isDown) {
            // move sprite 
            this.moveLeft();
        } else {
            this.getBody().setVelocityX(0);
        }
        if (this.cursorKeys.up.isDown && this.getBody().onFloor()) {
            // move sprite 
            this.jump();
        }
    }
}