import { CommandDialog, CommandDialogParameters, CommandItem } from "./CommandDialog";

export class ShowWhatDialogParameters extends CommandDialogParameters {

    constructor(parent: Scene, dims: Rectangle, menuitems: CommandItem[], autosize: boolean = true, promise?: Promise<string>) {
        super(parent, dims, menuitems, autosize, promise);


        this.allowSelection = true;
    }
}
export class ShowWhatDialog extends CommandDialog {

    constructor() {
        super('showWhatDialog');
    }


}