import { Scene } from "phaser";
import { Rectangle } from "../../config/levelconfig";


export class DialogParameters {
    parent: Scene;
    dimensions: Rectangle
    texture: string = 'border_panel';
    tileWidth: number = 16;
    tileHeight: number = 16;
    promise?: Promise<string>;
    color: string = '0xffffff';

    constructor(parent: Scene, dims: Rectangle, promise?: Promise<string>) {
        this.parent = parent;
        this.dimensions = dims;
        this.promise = promise;
    }
}

export abstract class Dialog extends Phaser.Scene {
    parentScene: Scene;

    InnerRect?: Rectangle;
    private _topBorder: Phaser.GameObjects.TileSprite;
    private _topRight: Phaser.GameObjects.Sprite;
    private _leftBorder: Phaser.GameObjects.TileSprite;
    private _rightBorder: Phaser.GameObjects.TileSprite;
    private _bottomLeft: Phaser.GameObjects.Sprite;
    private _bottomBorder: Phaser.GameObjects.TileSprite;
    private _bottomRight: Phaser.GameObjects.Sprite;

    private _topLeft: Phaser.GameObjects.Sprite;
    protected _borderTint: string;

    constructor(id: string) {
        super(id);
    }
    drawBorders(tileWidth: number, tileHeight: number, texture: string, boundaries: Rectangle): Rectangle {

        const left = 0; // coords are relative to the viewport, so start at 0,0
        const top = 0;
        const bottom = top + boundaries.height;
        let right = left + boundaries.width

        let horizontalBorderWidth = boundaries.width - (tileWidth * 2);
        let verticalBorderHeight = boundaries.height - (tileHeight * 2);

        // all sprites will be setorigin(0,0)
        // topleft
        if (!this._topLeft) {
            this._topLeft = this.add.sprite(left, top, texture, 0);

        } else {
            this._topLeft.setPosition(left, top);
        }
        if (!this._topBorder) {
            this._topBorder = this.add.tileSprite(left + tileWidth, top, horizontalBorderWidth, tileHeight, texture, 1)

        } else {

            this._topBorder.setPosition(left, top);
            this._topBorder.width = horizontalBorderWidth;
        }

        // topright
        if (!this._topRight) {
            this._topRight = this.add.sprite(right - tileWidth, top, texture, 2);

        } else {
            this._topBorder.setPosition(right - tileWidth, top);

        }

        // left border

        if (!this._leftBorder) {
            this._leftBorder = this.add.tileSprite(left, top + tileHeight, tileWidth, verticalBorderHeight, texture, 3);

        } else {
            this._leftBorder.setPosition(left, top + tileHeight);
            this._leftBorder.height = verticalBorderHeight;
        }

        // right
        if (!this._rightBorder) {
            this._rightBorder = this.add.tileSprite(right - tileWidth, top + tileHeight, tileWidth, verticalBorderHeight, texture, 5)

        } else {
            this._leftBorder.setPosition(right - tileWidth, top + tileHeight);
            this._leftBorder.height = verticalBorderHeight;
        }

        // botleft
        if (!this._bottomLeft) {
            this._bottomLeft = this.add.sprite(left, bottom - tileHeight, texture, 6);

        } else {
            this._leftBorder.setPosition(left, bottom - tileHeight);
        }

        // bottomBorder
        if (!this._bottomBorder) {
            this._bottomBorder = this.add.tileSprite(left + tileWidth, bottom - tileHeight, horizontalBorderWidth, tileHeight, texture, 7)

        } else {
            this._bottomBorder.setPosition(left, bottom - tileHeight);
            this._bottomBorder.width = horizontalBorderWidth
        }

        // botright
        if (!this._bottomRight) {
            this._bottomRight = this.add.sprite(right - tileWidth, bottom - tileHeight, texture, 8);

        } else {
            this._bottomRight.setPosition(right - tileWidth, bottom - tileHeight)
        }

        this.setBorderSpriteSettings();

        return new Rectangle(left + tileWidth, top + tileHeight, horizontalBorderWidth, verticalBorderHeight);

    }

    setSpriteSetting(sprite: Phaser.GameObjects.Sprite | Phaser.GameObjects.TileSprite) {

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


    abstract addControls(data: DialogParameters, innerRect: Rectangle): void;


}