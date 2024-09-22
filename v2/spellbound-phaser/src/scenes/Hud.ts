import Phaser from 'phaser';

export class Hud extends Phaser.Scene {
    parentScene: Phaser.Scene;
    roomLocationControl: Phaser.GameObjects.Text = null;

    updateRoomLocation(x: integer) {
        //const x = 2;
        const y = 1;
        if (!this.roomLocationControl) return;
        this.roomLocationControl.setText(`Room: (${x},${y})`);
    }

    constructor() {
        super('hud')

    }

    init(args) {
        this.parentScene = args;

        this.parentScene.events.on('screenmov', (args: integer) => {
            this.updateRoomLocation(args);


        })

    }
    preload() {

    }
    create() {
        this.roomLocationControl = this.add.text(0, 0, "Room: (0,0)");


    }

}