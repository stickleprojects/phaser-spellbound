import { Item } from "../config/configentities";
import { IInventoryItem, Inventory } from "../inventory";

export class ObjectItem implements IInventoryItem {
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
    get Sprite() { return this._sprite; }
    get name() { return this._src.stats?.fullname || this.id }
    get weight() { return this._src.stats?.weight || 0 }
}
