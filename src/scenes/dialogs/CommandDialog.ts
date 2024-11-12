import { MenuDialog, MenuDialogParameters } from "./MenuDialog";

export class CommandDialogParameters extends MenuDialogParameters {

    isModal: boolean = true;

    constructor(parent: Scene, dims: Rectangle, menuitems: string[], autosize: boolean = true, promise?: Promise<string>) {
        super(parent, dims, menuitems, autosize, promise);


        this.allowSelection = true;
    }
}
export class CommandDialog extends MenuDialog {

    constructor() {
        super('commandDialog');

    }

    override init(data: CommandDialogParameters): void {
        super.init(data);
    }


}