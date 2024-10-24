
export class Coordinate {
    x: number;
    y: number;
    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;

    }

    toString() {
        return `(${this.x},${this.y})`;
    }
}
export class RoomNavigator {
    SetRoomCoordinates(coords: { x: number; y: number; }) {
        let changed = false;
        if (coords.x != this.roomX) {
            this.roomX = coords.x;
            changed = true;
        }
        if (coords.y != this.roomY) {
            this.roomY = coords.y;
            changed = true;
        }
        if (changed) this.clampAndRaiseRoomChanged();

    }

    private NavigationUp: Phaser.Input.Keyboard.Key | undefined;
    private NavigationLeft: Phaser.Input.Keyboard.Key | undefined;
    private NavigationRight: Phaser.Input.Keyboard.Key | undefined;
    private NavigationDown: Phaser.Input.Keyboard.Key | undefined;

    private roomX: number = 0;
    private roomY: number = 0;
    OnRoomChanged: any;
    horizontalRooms: number;
    verticalRooms: number;

    public GetRoomCoords(): Coordinate {
        return new Coordinate(this.roomX, this.roomY);
    }
    constructor(input: Phaser.Input.InputPlugin, horizontalRoomMax: number, verticalRoomMax: number, onRoomChanged) {

        this.horizontalRooms = horizontalRoomMax;
        this.verticalRooms = verticalRoomMax;
        this.NavigationUp = input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.NavigationLeft = input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.NavigationRight = input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.NavigationDown = input.keyboard?.addKey(Phaser.Input.Keyboard.KeyCodes.S);

        this.OnRoomChanged = onRoomChanged;
    }

    clampAndRaiseRoomChanged() {
        this.roomX = Phaser.Math.Clamp(this.roomX, 0, this.horizontalRooms - 1);
        this.roomY = Phaser.Math.Clamp(this.roomY, 0, this.verticalRooms - 1);

        this.OnRoomChanged();
    }

    UpdateInput() {

        if (Phaser.Input.Keyboard.JustDown(this.NavigationDown!)) {
            this.roomY++;
            this.clampAndRaiseRoomChanged();

        }
        if (Phaser.Input.Keyboard.JustDown(this.NavigationUp!)) {
            this.roomY--;
            this.clampAndRaiseRoomChanged();
        }
        if (Phaser.Input.Keyboard.JustDown(this.NavigationLeft!)) {
            this.roomX--;
            this.clampAndRaiseRoomChanged();
        }
        if (Phaser.Input.Keyboard.JustDown(this.NavigationRight!)) {
            this.roomX++;
            this.clampAndRaiseRoomChanged();
        }
    }
}