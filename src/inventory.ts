// Allows someone to carry something

import { customEmitter } from "./components/customemitter";

export interface IInventoryOwner {

}
export interface IInventoryItem {

    id: string;
    weight: number;
    name: string;
    description: string;
    owner?: Inventory;
}
export class TemplateString {
    private _template: string;
    private _params: any[];

    private _formattedString: string;

    // Custom String.format function
    formatString(template: string, ...args: any[]): string {
        return template.replace(/\${(\d+)}/g, (match, index) => {
            return typeof args[index] !== 'undefined' ? args[index] : match;
        });
    }

    constructor(template: string, ...params: any[]) {
        this._template = template;
        this._params = params;

        this._formattedString = this.formatString(template, params)

    }

    public toString(): string {
        return this._formattedString
    }

    public getTemplate() { return this._template; }
    public getParams() { return this._params; }

}
export class InventoryEventArgs {
    inventory: Inventory;
    item: IInventoryItem;
    constructor(inventory: Inventory, item: IInventoryItem) {
        this.inventory = inventory;
        this.item = item;

    }
}
export type Result<T, E = Error> =
    | { ok: true; value: T }
    | { ok: false; error: E };

export class InventoryError extends Error {
    private _inventory: Inventory;
    private _messageTemplate: TemplateString;

    constructor(inventory: Inventory, template: TemplateString) {
        super(template.toString())
        this._inventory = inventory;
        this._messageTemplate = template;

    }
    getInventory() { return this._inventory; }
    getMessageTemplate() { return this._messageTemplate; }
}
export class InventoryItemError extends InventoryError {
    private _item: IInventoryItem;
    constructor(inventory: Inventory, item: IInventoryItem, message: TemplateString) {
        super(inventory, message)

        this._item = item;
    }

    getItem() { return this._item; }
}
export class ItemAlreadyInInventoryError extends InventoryItemError {

    constructor(inventory: Inventory, item: IInventoryItem) {
        super(inventory, item, new TemplateString("Item ${0} already in the inventory", item.id))

    }

}

export class ItemTooHeavyError extends InventoryItemError {
    constructor(inventory: Inventory, item: IInventoryItem) {
        super(inventory, item, new TemplateString("Item ${0} is too heavy", item.id))

    }
}
export class TooManyItemsError extends InventoryItemError {
    constructor(inventory: Inventory, item: IInventoryItem) {
        super(inventory, item, new TemplateString("Not enough room for ${0}", item.id))

    }
}
export class ItemNotInInventoryError extends InventoryItemError {
    constructor(inventory: Inventory, item: IInventoryItem) {
        super(inventory, item, new TemplateString("${0} is not in the inventory", item.id))

    }
}
export class InventoryEmptyError extends InventoryError {
    constructor(inventory: Inventory) {
        super(inventory, new TemplateString("There is nothing in the inventory"))
    }
}

export class Inventory {
    //private _owner: IInventoryOwner;
    private _maxNumberOfItems: number;
    private _maxTotalWeight: number;

    private _items: Map<string, IInventoryItem>;

    private _eventEmitter: Phaser.Events.EventEmitter;

    constructor(
        //owner: IInventoryOwner,
        maxNumberOfItems: number,
        maxTotalWeight: number,
        eventEmitter?: Phaser.Events.EventEmitter

    ) {

        //  this._owner = owner;
        this._maxNumberOfItems = maxNumberOfItems;
        this._maxTotalWeight = maxTotalWeight;
        this._eventEmitter = eventEmitter || customEmitter;

        this._items = new Map<string, IInventoryItem>();

    }

    public AddItem(item: IInventoryItem): Result<boolean, InventoryError> {

        if (this._items.has(item.id)) {
            // already in collection
            return {
                ok: false,
                error: new ItemAlreadyInInventoryError(this, item)
            }
        }

        if (this._items.size >= this._maxNumberOfItems) {

            return {
                ok: false,
                error: new TooManyItemsError(this, item)
            }
        }


        let currentWeight = this.getTotalWeight();

        if (currentWeight + item.weight > this._maxTotalWeight) {
            return {
                ok: false,
                error: new ItemTooHeavyError(this, item)
            }
        }

        this._items.set(item.id, item);
        item.owner = this;
        this._eventEmitter.emit("itemadded", new InventoryEventArgs(this, item));

        return { ok: true, value: true };
    }

    public HasItem(id: string): boolean {
        return this._items.has(id);
    }
    public GetItems(): readonly IInventoryItem[] {
        return Array.from(this._items.values());

    }
    getTotalWeight(): number {
        return Object.values(this._items).reduce((acc, item) => acc += item.weight, 0);
    }
    public RemoveItem(item: IInventoryItem): Result<boolean> {

        if (this._items.size == 0) {
            return {
                ok: false,
                error: new InventoryEmptyError(this)
            }
        }

        if (!this._items.has(item.id)) {
            return {
                ok: false,
                error: new ItemNotInInventoryError(this, item)
            }
        }

        this._items.delete(item.id);
        item.owner = undefined;
        this._eventEmitter.emit("itemremoved", new InventoryEventArgs(this, item));
        return { ok: true, value: true };
    }
}