import { Physics } from "phaser";
import { IInventoryItem, Inventory } from "./inventory";
import { ObjectItem } from "./scenes/GamePlay";

export default class Player {
    private sprite: Phaser.GameObjects.Sprite;
    private speed: number = 150;
    private jumpSpeed: number = -250;
    private gravity: number = 600;
    private cursorKeys: Phaser.Types.Input.Keyboard.CursorKeys
    private _inventory: Inventory;
    nearbySprite: Phaser.Physics.Arcade.Body;

    allowMovement: boolean;
    getSprite(): Phaser.GameObjects.Sprite { return this.sprite; }
    getNearbySprite(): Phaser.Physics.Arcade.Body { return this.nearbySprite; }

    constructor(
        sprite: Phaser.GameObjects.Sprite,
        nearbySprite: Phaser.Physics.Arcade.Body,
        cursors: Phaser.Types.Input.Keyboard.CursorKeys
        , jumpSpeed: number = -250
        , inventory: Inventory) {
        this.sprite = sprite;

        this.nearbySprite = nearbySprite;
        this.jumpSpeed = jumpSpeed;
        this.getBody().allowGravity = true;
        this.getBody().setMass(1)
        this.getBody().setGravityY(this.gravity);
        this.getBody().setFriction(1, 0);

        this.cursorKeys = cursors;

        let fi = this.sprite.anims.generateFrameNumbers('characters', {
            frames: [16, 17, 18]
        });

        if (fi.length < 1) {
            console.error("No animation frames found");
        }

        // setup the anims
        this.sprite.anims.create({
            key: 'walk',
            frames: fi,
            frameRate: 15,
            repeat: -1,

        })
        this.sprite.anims.create({
            key: 'stop',
            frames: this.sprite.anims.generateFrameNumbers('characters', {
                frames: [17]
            }),
            frameRate: 80,
            repeat: -1,

        })

        this._inventory = inventory;

    }

    getInventory(): Inventory { return this._inventory; }
    protected getBody(): Physics.Arcade.Body {
        return this.sprite.body as Physics.Arcade.Body;
    }
    moveRight() {

        this.getBody().setVelocityX(this.speed);
        this.sprite.anims.play('walk', true);
    }
    moveLeft() {
        this.getBody().setVelocityX(-this.speed);
        this.sprite.anims.play('walk', true);
    }
    jump() {
        this.getBody().setVelocityY(this.jumpSpeed);
    }
    Update() {


        if (this.allowMovement) {
            if (this.cursorKeys.right.isDown) {
                // move sprite 
                this.moveRight();

                this.sprite.flipX = false;
            } else if (this.cursorKeys.left.isDown) {
                // move sprite 
                this.moveLeft();
                this.sprite.flipX = true;

            } else {
                this.getBody().setVelocityX(0);
                this.sprite.anims.play('stop');
                //      this.sprite.flipX = !this.sprite.flipX;
            }
            if (this.cursorKeys.up.isDown && this.getBody().onFloor()) {
                // move sprite 
                this.jump();
            }

            this.repositionNearbySprite();
        }
    }
    repositionNearbySprite() {
        this.nearbySprite.x = this.sprite.x - this.nearbySprite.width / 2;
        this.nearbySprite.y = this.sprite.y - this.nearbySprite.height / 2;

        // move the inventory items too!
        this._inventory.GetItems().forEach((i: IInventoryItem, index: number) => {

            let value = i as ObjectItem;

            value.Sprite.x = this.sprite.x;
            value.Sprite.y = this.sprite.y;

        })
    }
}