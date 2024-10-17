import Phaser, { Scene } from 'phaser';
import { customEmitter } from '../components/customemitter';

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

    Debug: boolean;

    constructor(followingPlayer: boolean, debug: boolean) {
        this.FollowingPlayer = followingPlayer;
        this.Debug = debug;
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
    Flags_Debug: Phaser.GameObjects.Text;

    private updateRoomLocation(xy: HudRoomInfo) {
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
        this.Flags_Debug.setVisible(flags.Debug);
    }
    init(data: HudParameters) {
        this.parentScene = data.parent;

        this.cameras.main.setViewport(data.x, data.y, data.width, data.height);

        customEmitter.on('screenmov', (args: HudRoomInfo) => {
            this.updateRoomLocation(args);

        }, this)
        customEmitter.on('updateflags', (args: HudFlags) => {
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

        let y = 40;
        this.Flags_Debug = this.add.text(0, y, 'DEBUG');
        this.Flags_FollowingPlayer = this.add.text(60, y, 'FOLLOWING');
    }

}