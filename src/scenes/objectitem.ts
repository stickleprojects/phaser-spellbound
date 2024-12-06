import { Item, ItemStats } from "../config/configentities";
import { IInventoryItem, Inventory } from "../inventory";

export class ObjectItem implements IInventoryItem {
    setLocation(x: number, y: number) {

        this._sprite.setPosition(x, y);

        if (this.light) {
            this.light.setPosition(x, y);

        }
    }

    getLocation(): { x: number, y: number } {
        return { x: this._sprite.x, y: this._sprite.y };
    }

    private _sprite: Phaser.GameObjects.Sprite;
    private _src: Item;

    constructor(src: Item, sprite: Phaser.GameObjects.Sprite) {
        this._sprite = sprite;
        this.id = src.id;
        this._src = src;
    }
    description: string;
    id: string;
    owner?: Inventory;
    light?: Phaser.GameObjects.Light;

    //get Sprite() { return this._sprite; }
    get name() { return this._src.stats?.fullname || this.id }
    get weight() { return this._src.stats?.weight || 0 }
    get Src() { return this._src; }
    get stats(): ItemStats | undefined { return this._src.stats; }
    get Sprite() { return this._sprite; }
    setVisible(visible: boolean) {
        this._sprite.visible = visible;

    }
    setOwner(owner?: Inventory) {
        this.owner = owner;

        if (this.owner) {
            this._sprite?.body?.setAllowGravity(false);
        } else {
            this._sprite?.body?.setAllowGravity(true);
        }
    }
}
