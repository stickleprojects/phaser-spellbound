import { InventoryEventArgs, Inventory } from "../inventory";
import { BottomPanel, BottomPanelParameters } from "./BottomPanel";

export class InventoryPanel extends BottomPanel {
    private _inventory: Inventory;

    private _inventoryText: Phaser.GameObjects.Text;

    constructor() {
        super('inventory');
    }


    init(data: BottomPanelParameters) {
        super.init(data);


    }
    create() {
        this.add.text(this.InnerRect!.x, this.InnerRect!.y, 'Inventory');

        this.events.on('itemadded', (args: InventoryEventArgs) => {
            this._inventory = args.inventory
            this.showInventory();
        })
        this.events.on('itemremoved', (args: InventoryEventArgs) => {
            this._inventory = args.inventory
            this.showInventory();
        })

    }

    showInventory() {

        if (this._inventoryText == null) {
            this._inventoryText = this.add.text(this.InnerRect!.x, this.InnerRect!.y, '');
        }

        let inventorylist: string[] = this._inventory.GetItems().map(i => i.id);

        this._inventoryText.setText(inventorylist);
    }
}