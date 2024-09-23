import Phaser from 'phaser';

export class Hud extends Phaser.Scene {
    parentScene: Phaser.Scene;
    roomLocationControl: Phaser.GameObjects.Text;

    updateRoomLocation(xy: object) {
        const x = xy.x;
        const y = xy.y;
        if (!this.roomLocationControl) return;
        this.roomLocationControl.setText(`Room: (${x},${y})`);
    }

    constructor() {
        super('hud')

    }

    init(args) {
        this.parentScene = args;

        this.parentScene.events.on('screenmov', (args: object) => {
            this.updateRoomLocation(args);


        })

    }
    preload() {

    }
    create() {
        this.roomLocationControl = this.add.text(0, 0, "Room: (0,0)");


    }

}