import { MenuDialog, MenuDialogParameters } from "./MenuDialog";

export class CommandDialogParameters extends MenuDialogParameters {

    isModal: boolean = true;
}
export class CommandDialog extends MenuDialog {

    constructor() {
        super('commandDialog');

    }

    override init(data: MenuDialogParameters): void {
        super.init(data);
    }


}