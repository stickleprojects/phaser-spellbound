export class GameFlags {
    private _followingPlayer: boolean;
    private _callback: (values: GameFlags, propertyName: string, oldValue: any) => void;
    private _context: any;
    private _debug: any;

    constructor(callback: (values: GameFlags, propertyName: string, oldValue: any) => void, context: any) {
        this._callback = callback;
        this._context = context;
    }

    set FollowingPlayer(newvalue: boolean) {
        let oldValue = this._followingPlayer;
        if (oldValue == newvalue) return;

        this._followingPlayer = newvalue;
        this._callback.call(this._context, this, "FollowingPlayer", oldValue);
    }
    get FollowingPlayer() { return this._followingPlayer; }

    set Debug(newvalue: boolean) {
        let oldValue = this._debug;
        if (oldValue == newvalue) return;

        this._debug = newvalue;
        this._callback.call(this._context, this, "Debug", oldValue);

    }
    get Debug() { return this._debug; }
}
