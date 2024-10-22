import { Scene } from "phaser";
import { Rectangle } from "../config/levelconfig";

export class BottomPanelParameters {
    parent: Scene;
    x: number;
    y: number;
    width: number;
    height: number;

    texture: string = 'border_bottompanel';
    tileWidth: number = 16;
    tileHeight: number = 16;

    constructor(parent: Scene, x: number, y: number, width: number, height: number) {
        this.parent = parent;
        this.x = x;
        this.y = y;
        this.height = height;
        this.width = width;
    }
}

export abstract class BottomPanel extends Phaser.Scene {
    parentScene: Scene;

    InnerRect?: Rectangle;

    constructor(id: string) {
        super(id);
    }
    init(data: BottomPanelParameters) {
        this.parentScene = data.parent;

        this.cameras.main.setViewport(data.x, data.y, data.width, data.height);
        this.cameras.main.setZoom(1);
        this.cameras.main.setBackgroundColor("black")

        const halfWidth = data.tileWidth / 2;
        const halfHeight = data.tileHeight / 2;


        // draw the border

        const left = halfWidth;
        const top = halfHeight;


        // topleft
        this.add.sprite(left, top, data.texture, 0);

        // top
        let w = data.width - data.tileWidth - data.tileWidth
        this.add.tileSprite((w / 2) + data.tileWidth, top, w, data.tileHeight, data.texture, 1)

        // topright
        this.add.sprite(data.width - data.tileWidth, top, data.texture, 2);


        // left
        let h = data.height - data.tileHeight - data.tileHeight
        this.add.tileSprite(left, h / 2 + data.tileHeight, data.tileWidth, h, data.texture, 3);


        // right
        this.add.tileSprite(data.width - data.tileWidth, h / 2 + data.tileHeight, data.tileWidth, h, data.texture, 5)

        // botleft
        this.add.sprite(left, data.height - data.tileHeight, data.texture, 6);

        // BOT
        this.add.tileSprite((w / 2) + data.tileWidth, data.height - data.tileHeight, w, data.tileHeight, data.texture, 7)

        // botright
        this.add.sprite(data.width - data.tileWidth, data.height - data.tileHeight, data.texture, 8);

        this.InnerRect = new Rectangle(data.tileWidth, data.tileHeight, w, data.height - data.tileHeight);

    }

}