import Phaser from "phaser";
import {
  customEmitter,
  LiftArrivedEventArgs,
  LiftMovingEventArgs,
} from "../components/customemitter";

export enum DoorStateEnum {
  closed,
  open,
}

export interface IDoor {
  GetPosition(): { x: number; y: number };

  get Name(): string;
  OpenAsync(): Promise<boolean>;
  CloseAsync(): Promise<boolean>;
  get isOpen(): boolean;
  get isClosed(): boolean;

  get Tags(): Map<string, any>;
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

  private _currentDoor: IDoor;
  private _input: Phaser.Input.InputPlugin;
  private _doorKeys: Map<Phaser.Input.Keyboard.Key, IDoor>;
  private _sound:
    | Phaser.Sound.NoAudioSoundManager
    | Phaser.Sound.HTML5AudioSoundManager
    | Phaser.Sound.WebAudioSoundManager;
  private _liftInteriorDoor: IDoor;

  public static async CreateAsync(
    doors: IDoor[],
    input: Phaser.Input.InputPlugin,
    sound:
      | Phaser.Sound.NoAudioSoundManager
      | Phaser.Sound.HTML5AudioSoundManager
      | Phaser.Sound.WebAudioSoundManager
  ): Promise<LiftManager> {
    const x = new LiftManager(doors, input, sound);
    await x.closeAllDoorsAsync();

    return x;
  }
  private constructor(
    doors: IDoor[],
    input: Phaser.Input.InputPlugin,
    sound:
      | Phaser.Sound.NoAudioSoundManager
      | Phaser.Sound.HTML5AudioSoundManager
      | Phaser.Sound.WebAudioSoundManager
  ) {
    this._input = input;

    const doorsWithoutLiftEntrance = doors.filter(
      (d) => d.Name.toLowerCase() != "liftentrance"
    );
    this._doors = this.sortTheDoorsIntoFloorOrder(doorsWithoutLiftEntrance);
    this._liftEntrance = doors.find(
      (d) => d.Name.toLowerCase() == "liftentrance"
    )!;
    this._liftInteriorDoor = doors.find(
      (d) => d.Name.toLowerCase() == "liftexit"
    )!;
    this.setupKeys();
    this.setupDoorsAndRanges();

    this._sound = sound;

    // put the lift on the roof
    this.callLiftAsync(this.GetDoorByName("roof")!, false);
  }

  private setupDoorsAndRanges() {
    const sortedDoors = this._doors.toSorted(
      (a, b) => a.GetPosition().y - b.GetPosition().y
    );

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

  ForEachDoor(action: (d: IDoor, idx: number) => void) {
    const sortedDoors = this.sortTheDoorsIntoFloorOrder(this._doors);

    sortedDoors.forEach(action);
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

    const sortedDoors = doors.toSorted(
      (a, b) => floorNames.indexOf(a.Name) - floorNames.indexOf(b.Name)
    );

    return sortedDoors;
  }
  GetDoorByName(name: string): IDoor | undefined {
    return this._doors.find((d) => (d.Name == name ? true : false));
  }

  private setupKeys(): void {
    //      let keys: Phaser.Input.Keyboard.Key[] = [];

    let keymappings: Map<Phaser.Input.Keyboard.Key, IDoor> = new Map<
      Phaser.Input.Keyboard.Key,
      IDoor
    >();

    keymappings.set(
      this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.B),
      this.GetDoorByName("basement")!
    );
    keymappings.set(
      this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ZERO),
      this.GetDoorByName("groundfloor")!
    );
    keymappings.set(
      this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.ONE),
      this.GetDoorByName("1stfloor")!
    );
    keymappings.set(
      this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.TWO),
      this.GetDoorByName("2ndfloor")!
    );
    keymappings.set(
      this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.THREE),
      this.GetDoorByName("3rdfloor")!
    );
    keymappings.set(
      this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FOUR),
      this.GetDoorByName("4thfloor")!
    );
    keymappings.set(
      this._input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.FIVE),
      this.GetDoorByName("roof")!
    );

    this._doorKeys = keymappings;
  }

  private async closeAllDoorsAsync(): Promise<boolean> {
    return new Promise<boolean>(async (resolve) => {
      await this._doors.forEach(async (d) => {
        await d.CloseAsync();
      });

      resolve(true);
    });
  }
  private openDoorAsync(door: IDoor): Promise<boolean> {
    if (DEBUG_MODE) console.log("closing all lift doors");
    return this.closeAllDoorsAsync().then(async () => {
      return await door.OpenAsync().then(async () => {
        if (DEBUG_MODE)
          console.log(
            "opening lift internal door",
            this._liftInteriorDoor.Name
          );
        return await this._liftInteriorDoor.OpenAsync();
      });
    });
  }

  GetLiftEntranceLocation(): { x: number; y: number } {
    return this._liftEntrance.GetPosition();
  }

  GetClosestLiftDoor(y: number): IDoor | undefined {
    const closestDoor = this._doorsWithRanges.find(
      (d) => d.min_y <= y && d.max_y >= y
    );
    if (closestDoor) {
      return closestDoor.door;
    }
    return undefined;
  }

  GetLiftExitLocation(): { x: number; y: number } {
    return this._currentDoor.GetPosition();
  }
  GetCurrentDoor() {
    return this._currentDoor;
  }
  async callLiftAsync(
    door: IDoor,
    playSound: boolean = true
  ): Promise<boolean> {
    return this.closeAllDoorsAsync().then((b: boolean) => {
      if (!b) return false;

      return new Promise<boolean>(async (resolve, _) => {
        customEmitter.emitLiftIsMoving(
          new LiftMovingEventArgs(this._currentDoor, door)
        );

        if (playSound == true) {
          const s = this._sound
            .add("lift_move")
            .on(Phaser.Sound.Events.COMPLETE, async () => {
              await this.openDoorAsync(door);
              this._currentDoor = door;
              customEmitter.emitLiftArrived(
                new LiftArrivedEventArgs(this._currentDoor)
              );

              resolve(true);
            });

          s.play();
        } else {
          await this.openDoorAsync(door);
          this._currentDoor = door;
          customEmitter.emitLiftArrived(
            new LiftArrivedEventArgs(this._currentDoor)
          );

          resolve(true);
        }
      });
    });
  }

  async Update() {
    await this._doorKeys.forEach(async (d, k) => {
      if (Phaser.Input.Keyboard.JustDown(k)) {
        await this.callLiftAsync(d);
      }
    });
  }
}
