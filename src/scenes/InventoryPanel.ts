import { customEmitter } from "../components/customemitter";
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

        customEmitter.on('itemadded', (args: InventoryEventArgs) => {
            this._inventory = args.inventory
            this.showInventory();
        })
        customEmitter.on('itemremoved', (args: InventoryEventArgs) => {
            this._inventory = args.inventory
            this.showInventory();
        })

    }

    showInventory() {

        if (this._inventoryText == null) {
            this._inventoryText = this.add.text(this.InnerRect!.x, this.InnerRect!.y, '');
        }

        let inventorylist: string[] = this._inventory.GetItems().map((item, idx) => `${idx + 1}. ${item.id}`);

        this._inventoryText.setText(inventorylist);
    }
}