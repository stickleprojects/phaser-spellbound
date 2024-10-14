import { Scene } from "phaser";

export class BottomPanelParameters {
    parent: Scene;
    x: number;
    y: number;
    width: number;
    height: number;

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


    constructor(id: string) {
        super(id);
    }
    init(data: BottomPanelParameters) {
        this.parentScene = data.parent;

        this.cameras.main.setViewport(data.x, data.y, data.width, data.height);

    }

}