import { customEmitter, LiftArrivedEventArgs } from "../components/customemitter";

export class LiftControlPanel {
    private _panelSprite: Phaser.GameObjects.Sprite;
    private _light: Phaser.GameObjects.Light;
    private _floorIndicator: Phaser.GameObjects.Rectangle;
    private _roof_Indicator_Position: { x: number; y: number; };
    private _indicator_gap_y: number;
    private _liftIndicatorPositions: { x: number, y: number }[];

    constructor(scene: Phaser.Scene, x: number, y: number) {
        this._panelSprite = scene.add.sprite(x, y, 'lift-control-panel');
        this._panelSprite.setOrigin(0, 0);
        this._panelSprite.setPipeline('Light2D');

        this._floorIndicator = scene.add.rectangle(x, y, 5, 5, 0xff0000, 0.5);
        this._floorIndicator.setOrigin(0, 0);
        this._roof_Indicator_Position = { x: 11, y: 15 };
        this._indicator_gap_y = 10;
        this._light = scene.lights.addLight(x + 10, y, 30, 0xfcc603, 20);
        //const fx = this._panelSprite.postFX?.addGlow(0xf5e887, 0, 0, false, 0.1, 2);

        this._liftIndicatorPositions = [];
        this._liftIndicatorPositions.push({ x: x + 6, y: y + 65 });
        this._liftIndicatorPositions.push({ x: x + 6, y: y + 55 });
        this._liftIndicatorPositions.push({ x: x + 6, y: y + 45 });
        this._liftIndicatorPositions.push({ x: x + 6, y: y + 35 });
        this._liftIndicatorPositions.push({ x: x + 6, y: y + 14 });
        this._liftIndicatorPositions.push({ x: x + 6, y: y + 9 });

        this.wireUpEvents();

        // position on the roof
        this.positionIndicatorOnFloor(5);
    }

    private positionIndicatorOnFloor(floorNumber: number) {
        const where = this._liftIndicatorPositions[floorNumber];
        this._floorIndicator.setPosition(where.x, where.y);

    }
    private wireUpEvents() {
        customEmitter.OnLiftMoving(() => {
            console.log('moo liftmoving');

        })
        customEmitter.OnLiftArrived((args: LiftArrivedEventArgs) => {
            console.log('moo liftrrived', args);
            todo: error the floornumber is the position in the array in liftmanager NOT the floornumber!

            this.positionIndicatorOnFloor(args.onFloor);
        })
    }
}