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
export class HudFlags {
    FollowingPlayer: boolean

    constructor(followingPlayer: boolean) {
        this.FollowingPlayer = followingPlayer;
    }
}

export class Hud extends Phaser.Scene {
    parentScene: Phaser.Scene;
    roomLocationControl: Phaser.GameObjects.Text;
    instructions: Phaser.GameObjects.Text;
    Flags_FollowingPlayer: Phaser.GameObjects.Text;

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

    updateFlags(flags: HudFlags) {
        this.Flags_FollowingPlayer.setText(flags.FollowingPlayer ? "FOLLOWING" : "");
    }
    init(data: HudParameters) {
        this.parentScene = data.parent;

        this.cameras.main.setViewport(data.x, data.y, data.width, data.height);

        this.parentScene.events.on('screenmov', (args: object) => {
            this.updateRoomLocation(args);

        }, this)
        this.parentScene.events.on('updateflags', (args: HudFlags) => {
            this.updateFlags(args);

        }, this)

    }
    preload() {

    }
    create() {
        this.roomLocationControl = this.add.text(0, 0, "Room: (0,0)");

        const instructionText = [
            'Instructions: Use WASD to explore theres only 8x6 rooms or so, and the characters dont move',
            '              The Room name and position will be displayed in topleft hand corner'
        ];

        this.instructions = this.add.text(0, 15, instructionText);

        // flags

        this.Flags_FollowingPlayer = this.add.text(0, 30, 'FOLLOWING');
    }

}