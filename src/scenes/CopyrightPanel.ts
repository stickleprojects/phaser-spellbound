import { Scene } from "phaser";
import { BottomPanel, BottomPanelParameters } from "./BottomPanel";

export class CopyrightPanelParameters extends BottomPanelParameters {

    constructor(parent: Scene, x: number, y: number, width: number, height: number) {
        super(parent, x, y, width, height);
    }
}

export class CopyrightPanel extends BottomPanel {

    private _copyrightText: Phaser.GameObjects.Text;
    private _titleText: Phaser.GameObjects.Text;


    constructor() {
        super('copyright');
    }


    create() {

        // add a border using nineslice

        const title = "SPELLBOUND";

        const copyright = [
            "COPYRIGHT MASTERTRONIC 1986",
            "BY ADRIAN SHEPPARD 1986"
        ];

        const x = this.InnerRect!.x;
        const y = this.InnerRect!.y;

        this._titleText = this.add.text(x, y, title);
        this._copyrightText = this.add.text(x, y + 20, copyright);

    }
}