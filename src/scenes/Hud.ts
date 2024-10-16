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
export class HudRoomInfo {
    x: number;
    y: number;
    name: string;

    constructor(x: number, y: number, name: string) {
        this.x = x;
        this.y = y;
        this.name = name;
    }
}
export class Hud extends Phaser.Scene {
    parentScene: Phaser.Scene;
    roomLocationControl: Phaser.GameObjects.Text;

    Flags_FollowingPlayer: Phaser.GameObjects.Text;
    NotFollowing_instructions: Phaser.GameObjects.Text;
    Following_instructions: Phaser.GameObjects.Text;

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
        this.Following_instructions.setVisible(flags.FollowingPlayer);
        this.NotFollowing_instructions.setVisible(!flags.FollowingPlayer);
    }
    init(data: HudParameters) {
        this.parentScene = data.parent;

        this.cameras.main.setViewport(data.x, data.y, data.width, data.height);

        this.parentScene.events.on('screenmov', (args: HudRoomInfo) => {
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

        const NotFollowing_instructionText = [
            'Instructions: Use WASD to explore theres only 8x6 rooms or so, and the characters dont move',
            '              The Room name and position will be displayed in topleft hand corner'
        ];
        const Following_instructionText = [
            'Instructions: Use Arrow Keys to walk about, Press F to toggle walking/screens'

        ];

        this.NotFollowing_instructions = this.add.text(0, 15, NotFollowing_instructionText);
        this.Following_instructions = this.add.text(0, 15, Following_instructionText);

        // flags

        this.Flags_FollowingPlayer = this.add.text(0, 30, 'FOLLOWING');
    }

}