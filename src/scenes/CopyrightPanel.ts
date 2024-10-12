import { Scene } from "phaser";

export class CopyrightPanelParameters {
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

export class CopyrightPanel extends Phaser.Scene {
    parentScene: Scene;
    private _copyrightText: Phaser.GameObjects.Text;
    private _titleText: Phaser.GameObjects.Text;


    constructor() {
        super('copyright');
    }
    init(data: CopyrightPanelParameters) {
        this.parentScene = data.parent;

        this.cameras.main.setViewport(data.x, data.y, data.width, data.height);

        // hook up events

    }

    create() {

        // add a border using nineslice

        const title = "SPELLBOUND";

        const copyright = [
            "COPYRIGHT MASTERTRONIC 1986",
            "BY ADRIAN SHEPPARD 1986"
        ];

        this._titleText = this.add.text(0, 0, title);
        this._copyrightText = this.add.text(0, 20, copyright);

    }
}