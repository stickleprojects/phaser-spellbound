

enum DoorStateEnum {
    closed,
    open
}

export interface IDoor {

    Open(): Promise<null>;
    Close(): Promise<null>;
    get isOpen(): boolean;
    get isClosed(): boolean;

}
export class Door implements IDoor {
    private _sprite: Phaser.GameObjects.Sprite;
    private _state: DoorStateEnum;

    constructor(sprite: Phaser.GameObjects.Sprite) {
        this._sprite = sprite;

        this._sprite.on('animationcomplete-open', () => {
            this._state = DoorStateEnum.open;
        });
        this._sprite.on('animationstart-close', () => {
            this._state = DoorStateEnum.closed;
        })
    }

    async Open(): Promise<null> {
        if (this._sprite.anims.isPlaying) return;

        return new Promise<null>((resolve) => {
            this._sprite.anims.play('open').once('animationcomplete-open', () => resolve);

        })

    }
    async Close(): Promise<null> {
        if (this._sprite.anims.isPlaying) return;

        return new Promise<null>((resolve) => {
            this._sprite.anims.play('close').once('animationcomplete-close', () => resolve);

        })

    }
    get isOpen(): boolean { return this._state == DoorStateEnum.open; }
    get isClosed(): boolean { return this._state == DoorStateEnum.closed; }

}
export class LiftManager {

    private _doors: IDoor[];

    private _liftFloorNumber: number;

    constructor(doors: IDoor[]) {

        this._doors = doors;
    }

    private async closeAllDoors(): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            await this._doors.forEach(async (d) => await d.Close());

            resolve(true);
        })
    }
    private openDoor(index: number): Promise<boolean> {
        return this.closeAllDoors()
            .then(async () => {
                return await this._doors[index].Open();

            });
    }

    callLift(floorNumber: number): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {

            if (floorNumber == this._liftFloorNumber) {
                console.log('lift already here!');
                reject("Already on that floor");
            }
            await this.openDoor(floorNumber);
            resolve(true);
        })
    }
    get LiftFloorNumber(): number { return this._liftFloorNumber; }


}