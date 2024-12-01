import { customEmitter, LiftArrivedEventArgs } from "../components/customemitter";
import { IDoor, LiftManager } from "../systems/liftManager";

export class LiftControlPanel {
    private _panelSprite: Phaser.GameObjects.Sprite;
    private _light: Phaser.GameObjects.Light;
    private _doorIndicator: Phaser.GameObjects.Rectangle;

    private _liftManager: LiftManager;

    constructor(scene: Phaser.Scene, x: number, y: number, liftManager: LiftManager) {
        this._panelSprite = scene.add.sprite(x, y, 'lift-control-panel');
        this._panelSprite.setOrigin(0, 0);
        this._panelSprite.setPipeline('Light2D');

        this._liftManager = liftManager;
        this._doorIndicator = scene.add.rectangle(x, y, 5, 4, 0xff0000, 1);
        this._doorIndicator.setOrigin(0, 0);
        this._doorIndicator.setVisible(false);

        this._light = scene.lights.addLight(x, y, 20, 0xff0000, 1);
        this._doorIndicator.postFX?.addGlow(0xf5e887, 0, 0, false, 0.1, 10);

        // link the controls to the correct door
        // starting from the roof

        const liftIndicatorPositions = new Map<string, { x: number, y: number }>();
        liftIndicatorPositions.set('roof', { x: x + 6, y: y + 10 });
        liftIndicatorPositions.set('4thfloor', { x: x + 6, y: y + 18 });
        liftIndicatorPositions.set('3rdfloor', { x: x + 6, y: y + 26 });
        liftIndicatorPositions.set('2ndfloor', { x: x + 6, y: y + 34 });
        liftIndicatorPositions.set('1stfloor', { x: x + 6, y: y + 42 });
        liftIndicatorPositions.set('groundfloor', { x: x + 6, y: y + 50 });
        liftIndicatorPositions.set('basement', { x: x + 6, y: y + 58 });

        liftManager.ForEachDoor((d: IDoor, idx: number) => {

            const pos = liftIndicatorPositions.get(d.Name);
            if (!pos) {
                console.log('warning - cannot find door indicator for door %s', d.Name);
            } else {
                const xy = pos;
                d.Tags.set('doorIndicator', xy);
                console.log('idx: %d, door: %s, xy:%s', idx, d.Name, JSON.stringify(xy));
            }
        });

        this.wireUpEvents();

        // position on the roof
        this.positionIndicatorAtDoor(this._liftManager.GetCurrentDoor());
    }

    private positionIndicatorAtDoor(d: IDoor) {

        if (!d) return;

        const where = d.Tags.get('doorIndicator');
        if (where) {
            this._doorIndicator.setPosition(where.x, where.y);
            this._light.setPosition(where.x, where.y);
            this._light.setVisible(true);
            this._doorIndicator.setVisible(true);
        }
    }
    private wireUpEvents() {
        customEmitter.OnLiftMoving(() => {
            console.log('liftcontrolpanel: liftmoving');

        })
        customEmitter.OnLiftArrived((args: LiftArrivedEventArgs) => {
            console.log('liftcontrolpanel: liftrrived at door ', args.on.Name);

            this.positionIndicatorAtDoor(args.on);
        })
    }
}