export class RoomNavigator {
    SetRoomCoordinates(coords: { x: number; y: number; }) {
        this.roomX = coords.x;
        this.roomY = coords.y;
        this.clampAndRaiseRoomChanged();

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

    public GetRoomCoords() {
        return { x: this.roomX, y: this.roomY };
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