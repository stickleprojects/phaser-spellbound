import Phaser, { Scene } from 'phaser';

export class HudParameters {
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
export class Hud extends Phaser.Scene {
    parentScene: Phaser.Scene;
    roomLocationControl: Phaser.GameObjects.Text;

    updateRoomLocation(xy: object) {
        const x = xy.x;
        const y = xy.y;
        const name = xy.name;
        if (!this.roomLocationControl) return;
        this.roomLocationControl.setText(`Room: (${x},${y}) - [${name}]`);
    }

    constructor() {
        super('hud')

    }

    init(data: HudParameters) {
        this.parentScene = data.parent;

        this.cameras.main.setViewport(data.x, data.y, data.width, data.height);

        this.parentScene.events.on('screenmov', (args: object) => {
            this.updateRoomLocation(args);


        })

    }
    preload() {

    }
    create() {
        this.roomLocationControl = this.add.text(0, 0, "Room: (0,0)");

        this.add.text(0, 20, 'Instructions: Use the cursor keys to explore the building (theres only 9x7 rooms or so)');

    }

}