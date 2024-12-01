import { CommandDialog, CommandDialogParameters, CommandItem } from "./CommandDialog";

export class InventoryDialogParameters extends CommandDialogParameters {

    constructor(parent: Scene, dims: Rectangle, menuitems: CommandItem[], autosize: boolean = true, promise?: Promise<string>) {
        super(parent, dims, menuitems, autosize, promise);


        this.allowSelection = true;
    }
}
export class InventoryDialog extends CommandDialog {

    constructor() {
        super('inventoryDialog');
    }


}