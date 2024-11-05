import { Scene } from "phaser";
import { Rectangle } from "../../config/levelconfig";
import { customEmitter } from "../../components/customemitter";


export class DialogParameters {
    parent: Scene;
    dimensions: Rectangle
    texture: string = 'border_panel';
    tileWidth: number = 16;
    tileHeight: number = 16;
    promise?: Promise<string>;
    color: string = '0xffffff';
    isModal: boolean = true;

    constructor(parent: Scene, dims: Rectangle, promise?: Promise<string>) {
        this.parent = parent;
        this.dimensions = dims;
        this.promise = promise;
        this.isModal = true;
    }
}

export abstract class Dialog extends Phaser.Scene {
    parentScene: Scene;

    InnerRect?: Rectangle;
    private _topBorder?: Phaser.GameObjects.TileSprite;
    private _topRight?: Phaser.GameObjects.Sprite;
    private _leftBorder?: Phaser.GameObjects.TileSprite;
    private _rightBorder?: Phaser.GameObjects.TileSprite;
    private _bottomLeft?: Phaser.GameObjects.Sprite;
    private _bottomBorder?: Phaser.GameObjects.TileSprite;
    private _bottomRight?: Phaser.GameObjects.Sprite;

    private _topLeft?: Phaser.GameObjects.Sprite;
    protected _borderTint: string;
    private _id: string;

    constructor(id: string) {
        super(id);
        this._id = id;

    }
    drawBorders(tileWidth: number, tileHeight: number, texture: string, boundaries: Rectangle): Rectangle {

        const left = 0; // coords are relative to the viewport, so start at 0,0
        const top = 0;
        const bottom = top + boundaries.height;
        let right = left + boundaries.width

        let horizontalBorderWidth = boundaries.width - (tileWidth * 2);
        let verticalBorderHeight = boundaries.height - (tileHeight * 2);

        this._topLeft = this.add.sprite(left, top, texture, 0);

        this._topBorder = this.add.tileSprite(left + tileWidth, top, horizontalBorderWidth, tileHeight, texture, 1)
        this._topRight = this.add.sprite(right - tileWidth, top, texture, 2);

        this._leftBorder = this.add.tileSprite(left, top + tileHeight, tileWidth, verticalBorderHeight, texture, 3);

        this._rightBorder = this.add.tileSprite(right - tileWidth, top + tileHeight, tileWidth, verticalBorderHeight, texture, 5)
        this._bottomLeft = this.add.sprite(left, bottom - tileHeight, texture, 6);
        this._bottomBorder = this.add.tileSprite(left + tileWidth, bottom - tileHeight, horizontalBorderWidth, tileHeight, texture, 7)
        this._bottomRight = this.add.sprite(right - tileWidth, bottom - tileHeight, texture, 8);
        this.setBorderSpriteSettings();

        return new Rectangle(left + tileWidth, top + tileHeight, horizontalBorderWidth, verticalBorderHeight);

    }


    setSpriteSetting(sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.TileSprite | undefined) {


        if (!sprite) return;

        sprite.setOrigin(0, 0);

        const rgb = Number(this._borderTint);

        sprite.setTint(rgb);

    }
    setBorderSpriteSettings() {

        this.setSpriteSetting(this._topLeft);
        this.setSpriteSetting(this._topBorder);
        this.setSpriteSetting(this._topRight);

        this.setSpriteSetting(this._leftBorder);
        this.setSpriteSetting(this._rightBorder);

        this.setSpriteSetting(this._bottomLeft);
        this.setSpriteSetting(this._bottomBorder);
        this.setSpriteSetting(this._bottomRight);



    }
    create() {



        this.events.on(Phaser.Scenes.Events.SHUTDOWN, () => {

            if (this._topLeft) {
                this._topLeft.destroy();
                this._topLeft = undefined;
            }

            if (this._topBorder) {
                this._topBorder.destroy();
                this._topBorder = undefined;
            }

            if (this._topRight) {
                this._topRight.destroy();
                this._topRight = undefined;
            }
            if (this._rightBorder) {
                this._rightBorder.destroy();
                this._rightBorder = undefined;
            }


            if (this._bottomRight) {
                this._bottomRight.destroy();
                this._bottomRight = undefined;
            }


            if (this._bottomBorder) {
                this._bottomBorder.destroy();
                this._bottomBorder = undefined;
            }

            if (this._bottomLeft) {
                this._bottomLeft.destroy();
                this._bottomLeft = undefined;
            }


            if (this._leftBorder) {
                this._leftBorder.destroy();
                this._leftBorder = undefined;
            }

        });

    }
    init(data: DialogParameters) {

        this.parentScene = data.parent;

        this._borderTint = data.color;

        const dimensions = data.dimensions;
        this.cameras.main.setViewport(dimensions.x, dimensions.y, dimensions.width, dimensions.height);
        this.cameras.main.setZoom(1);
        this.cameras.main.setBackgroundColor("black")

        this.InnerRect = this.drawBorders(data.tileWidth, data.tileHeight, data.texture, dimensions);

        this.addControls(data, this.InnerRect!);
    }


    override update(time: number, delta: number) {
        // react to keypresses

        if (!this.scene.isActive) return;


    }
    abstract addControls(data: DialogParameters, innerRect: Rectangle): void;


}