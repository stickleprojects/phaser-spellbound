import Phaser from "phaser";

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

class DoorPositionRange {

    min_y: number;
    max_y: number;
    door: IDoor;

    constructor(miny: number, maxy: number, door: IDoor) {
        this.min_y = miny;
        this.max_y = maxy;
        this.door = door;
    }
}
export class LiftManager {

    private _liftEntrance: IDoor;
    private _doorsWithRanges: DoorPositionRange[];
    private _doors: IDoor[];
    private _liftFloorNumber: number = 3;
    private _input: Phaser.Input.InputPlugin;
    private _floorKeys: Map<Phaser.Input.Keyboard.Key, number>;
    private _sound: Phaser.Sound.NoAudioSoundManager | Phaser.Sound.HTML5AudioSoundManager | Phaser.Sound.WebAudioSoundManager;
    private _liftInteriorDoor: IDoor;


    public static async CreateAsync(doors: IDoor[], input: Phaser.Input.InputPlugin, sound: Phaser.Sound.NoAudioSoundManager | Phaser.Sound.HTML5AudioSoundManager | Phaser.Sound.WebAudioSoundManager): Promise<LiftManager> {


        const x = new LiftManager(doors, input, sound);
        await x.closeAllDoorsAsync();

        return x;
    }
    private constructor(doors: IDoor[], input: Phaser.Input.InputPlugin, sound: Phaser.Sound.NoAudioSoundManager | Phaser.Sound.HTML5AudioSoundManager | Phaser.Sound.WebAudioSoundManager) {

        this._input = input;

        const doorsWithoutLiftEntrance = doors.filter(d => d.Name.toLowerCase() != 'liftentrance');
        this._doors = this.sortTheDoorsIntoFloorOrder(doorsWithoutLiftEntrance);
        this._liftEntrance = doors.find(d => d.Name.toLowerCase() == 'liftentrance')!;
        this._liftInteriorDoor = doors.find(d => d.Name.toLowerCase() == 'liftexit')!
        this.setupKeys();
        this.setupDoorsAndRanges();

        this._sound = sound;

    }

    private setupDoorsAndRanges() {

        const sortedDoors = this._doors.toSorted((a, b) => (a.GetPosition().y - b.GetPosition().y));

        let ret: DoorPositionRange[] = [];
        let prevY: number = 0;
        sortedDoors.forEach((d, idx) => {
            const dy = d.GetPosition().y;
            if (idx == 0) {

                ret.push(new DoorPositionRange(0, dy, d));
            } else {
                ret.push(new DoorPositionRange(prevY + 1, dy, d));
            }
            prevY = dy;
        });

        this._doorsWithRanges = ret;
    }

    private sortTheDoorsIntoFloorOrder(doors: IDoor[]) {
        const floorNames = [
            "roof",
            "4thfloor",
            "3rdfloor",
            "2ndfloor",
            "1stfloor",
            "groundfloor",
            "basement",
        ];

        const sortedDoors = doors.toSorted((a, b) => floorNames.indexOf(a.Name) - floorNames.indexOf(b.Name));

        return sortedDoors;
    }
    private setupKeys(): void {

        //      let keys: Phaser.Input.Keyboard.Key[] = [];

        // lets map the keys to the correct floors! lol
        let keymappings: Map<Phaser.Input.Keyboard.Key, number> = new Map<Phaser.Input.Keyboard.Key, number>();

        let getIndexOfFloor = (name: string) => this._doors.findIndex((d) => d.Name == name ? true : false);


        keymappings.set(this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.B), getIndexOfFloor("basement"));
        keymappings.set(this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO), getIndexOfFloor("groundfloor"));
        keymappings.set(this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE), getIndexOfFloor("1stfloor"));
        keymappings.set(this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO), getIndexOfFloor("2ndfloor"));
        keymappings.set(this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE), getIndexOfFloor("3rdfloor"));
        keymappings.set(this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR), getIndexOfFloor("4thfloor"));
        keymappings.set(this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE), getIndexOfFloor("roof"));

        /*
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
        */
        this._floorKeys = keymappings;

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
                const floorDoor = this._doors[index];
                console.log('opening lift', floorDoor.Name);
                return await floorDoor.OpenAsync()
                    .then(async () => {
                        console.log('opening lift', this._liftInteriorDoor.Name);
                        return await this._liftInteriorDoor.OpenAsync()

                    });

            });
    }

    GetLiftEntranceLocation(): { x: number, y: number } {

        return this._liftEntrance.GetPosition();
    }

    GetClosestLiftLocation(y: number): number | undefined {
        const closestDoor = this._doorsWithRanges.find(d => d.min_y <= y && d.max_y >= y);
        if (closestDoor) {
            return this._doors.indexOf(closestDoor.door);
        }
        return undefined;
    }

    GetLiftExitLocation(): { x: number, y: number } {
        return this._doors[this._liftFloorNumber].GetPosition();

    }
    async callLiftAsync(floorNumber: number): Promise<boolean> {

        return this.closeAllDoorsAsync()
            .then((b: boolean) => {

                if (!b) return false;

                return new Promise<boolean>(async (resolve, reject) => {
                    if (floorNumber >= this._doors.length) {
                        console.error("cannot go to that floor, max is ", this._doors.length)
                    }
                    console.log("moving lift to floor", floorNumber);

                    const s = this._sound.add('lift_move')
                        .on(Phaser.Sound.Events.COMPLETE, async () => {
                            await this.openDoorAsync(floorNumber);
                            this._liftFloorNumber = floorNumber;
                            resolve(true);

                        });

                    s.play();
                })

            })
    }
    get LiftFloorNumber(): number { return this._liftFloorNumber; }


    async Update() {

        await this._floorKeys.forEach(async (number, k) => {
            if (Phaser.Input.Keyboard.JustDown(k)) {
                await this.callLiftAsync(number);

            }
        })
    }

}