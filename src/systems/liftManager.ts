

export enum DoorStateEnum {
    closed,
    open
}

export interface IDoor {
    GetPosition(): { x: number; y: number; };

    get Name(): string;
    OpenAsync(): Promise<boolean>;
    CloseAsync(): Promise<boolean>;
    get isOpen(): boolean;
    get isClosed(): boolean;

}

export class LiftManager {

    private _liftEntrance: IDoor;


    private _doors: IDoor[];
    private _liftFloorNumber: number = 3;
    private _input: Phaser.Input.InputPlugin;
    private _floorKeys: Phaser.Input.Keyboard.Key[];

    public static async CreateAsync(doors: IDoor[], input: Phaser.Input.InputPlugin): Promise<LiftManager> {

        const x = new LiftManager(doors, input);
        await x.closeAllDoorsAsync();

        return x;
    }
    private constructor(doors: IDoor[], input: Phaser.Input.InputPlugin) {

        this._input = input;
        this._doors = doors.filter(d => d.Name.toLowerCase() != 'liftentrance');
        this._liftEntrance = doors.find(d => d.Name.toLowerCase() == 'liftentrance')!;
        this.setupKeys();
    }

    private setupKeys(): void {

        let keys: Phaser.Input.Keyboard.Key[] = [];

        keys.push(this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE));
        keys.push(this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO));
        keys.push(this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE));
        keys.push(this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR));
        keys.push(this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE));
        keys.push(this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SIX));
        keys.push(this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SEVEN));
        keys.push(this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.EIGHT));
        keys.push(this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.NINE));
        keys.push(this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO));

        this._floorKeys = keys;

    }
    private async closeAllDoorsAsync(): Promise<boolean> {
        return new Promise<boolean>(async (resolve) => {
            await this._doors.forEach(async (d) => {
                await d.CloseAsync();
            });

            resolve(true);
        })
    }
    private openDoorAsync(index: number): Promise<boolean> {
        console.log('closing all lift doors');
        return this.closeAllDoorsAsync()
            .then(async () => {
                const d = this._doors[index];
                console.log('opening lift', d.Name);
                return await d.OpenAsync();

            });
    }

    GetLiftEntranceLocation(): { x: number, y: number } {

        return this._liftEntrance.GetPosition();
    }

    GetLiftExitLocation(): { x: number, y: number } {
        return this._doors[this._liftFloorNumber].GetPosition();

    }
    async callLiftAsync(floorNumber: number): Promise<boolean> {
        return new Promise<boolean>(async (resolve, reject) => {

            if (floorNumber >= this._doors.length) {
                console.error("cannot go to that floor, max is ", this._doors.length)
            }
            if (floorNumber == this._liftFloorNumber) {
                console.log('lift already here!');
                reject("Already on that floor");
            }
            console.log("moving lift to floor", floorNumber);

            await this.openDoorAsync(floorNumber);
            this._liftFloorNumber = floorNumber;
            resolve(true);
        })
    }
    get LiftFloorNumber(): number { return this._liftFloorNumber; }


    async Update() {

        await this._floorKeys.forEach(async (k, index) => {
            if (Phaser.Input.Keyboard.JustDown(k)) {
                await this.callLiftAsync(index);

            }
        })
    }

}