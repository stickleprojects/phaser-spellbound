import { MenuDialogParameters, MenuDialog } from "./MenuDialog";

export class InventoryDialogParameters extends MenuDialogParameters {

    constructor(parent: Scene, dims: Rectangle, menuitems: string[], autosize: boolean = true, promise?: Promise<string>) {
        super(parent, dims, menuitems, autosize, promise);


        this.allowSelection = true;
    }
}
export class InventoryDialog extends MenuDialog {

    constructor() {
        super('inventoryDialog');
    }


}